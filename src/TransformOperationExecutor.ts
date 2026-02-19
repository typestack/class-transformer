import { defaultMetadataStorage } from './storage';
import {
  ClassTransformOptions,
  ExposeMetadata,
  TransformMetadata,
  TypeHelpOptions,
  TypeMetadata,
  TypeOptions,
} from './interfaces';
import { TransformationType } from './enums';
import { getGlobal, isPromise } from './utils';

interface TargetTransformationPlan {
  strategy: 'excludeAll' | 'exposeAll' | 'none';
  exposedProperties: string[];
  exposedPropertiesWithCustomNames: string[];
  excludedPropertiesSet: Set<string>;
  classPropertyToCustomName: Map<string, string>;
  customNameToProperty: Map<string, string>;
  exposeMetadataByProperty: Map<string, ExposeMetadata>;
  hasExposeOrExcludeMetadata: boolean;
  hasCustomNameToProperty: boolean;
  hasClassPropertyToCustomName: boolean;
}

function instantiateArrayType(arrayType: Function): Array<any> | Set<any> {
  const array = new (arrayType as any)();
  if (!(array instanceof Set) && !('push' in array)) {
    return [];
  }
  return array;
}

export class TransformOperationExecutor {
  // -------------------------------------------------------------------------
  // Private Properties
  // -------------------------------------------------------------------------

  private recursionStack = new Set<Record<string, any>>();
  private readonly propertyDescriptorCache = new WeakMap<object, Map<PropertyKey, PropertyDescriptor | null>>();
  private readonly targetTransformationPlanCache = new Map<Function, TargetTransformationPlan>();
  private readonly transformMetadataForOptionsCache = new Map<Function, Map<string, TransformMetadata[]>>();
  private readonly reflectedTypeCache = new Map<Function, Map<string, any | null>>();
  private readonly discriminatorLookupCache = new WeakMap<
    object,
    { nameToSubType: Map<string, any>; valueToSubType: Map<any, any> }
  >();
  private readonly targetMapLookup = new Map<Function, Map<string, Function>>();
  private readonly isPlainToClass: boolean;
  private readonly isClassToPlain: boolean;
  private readonly isClassToClass: boolean;
  private readonly optionsGroupsSet?: Set<string>;
  private readonly hasGroups: boolean;
  private readonly hasVersion: boolean;
  private readonly excludePrefixes: string[];
  private readonly hasExcludePrefixes: boolean;
  private readonly shouldEnableImplicitConversion: boolean;
  private readonly bufferConstructor?: any;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(private transformationType: TransformationType, private options: ClassTransformOptions) {
    this.isPlainToClass = this.transformationType === TransformationType.PLAIN_TO_CLASS;
    this.isClassToPlain = this.transformationType === TransformationType.CLASS_TO_PLAIN;
    this.isClassToClass = this.transformationType === TransformationType.CLASS_TO_CLASS;
    this.hasGroups = !!(options.groups && options.groups.length > 0);
    this.hasVersion = options.version !== undefined;
    this.excludePrefixes = options.excludePrefixes || [];
    this.hasExcludePrefixes = this.excludePrefixes.length > 0;
    this.shouldEnableImplicitConversion = options.enableImplicitConversion && this.isPlainToClass;

    if (this.hasGroups) {
      this.optionsGroupsSet = new Set(options.groups);
    }

    const globalObject: any = getGlobal();
    this.bufferConstructor = globalObject && globalObject.Buffer ? globalObject.Buffer : undefined;

    if (options.targetMaps && options.targetMaps.length > 0) {
      for (const targetMap of options.targetMaps) {
        let byProperty = this.targetMapLookup.get(targetMap.target);
        if (!byProperty) {
          byProperty = new Map<string, Function>();
          this.targetMapLookup.set(targetMap.target, byProperty);
        }
        const properties = targetMap.properties || {};
        for (const propertyName of Object.keys(properties)) {
          byProperty.set(propertyName, properties[propertyName]);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  transform(
    source: Record<string, any> | Record<string, any>[] | any,
    value: Record<string, any> | Record<string, any>[] | any,
    targetType: Function | TypeMetadata,
    arrayType: Function,
    isMap: boolean,
    level: number = 0
  ): any {
    if (Array.isArray(value) || value instanceof Set) {
      const newValue = arrayType && this.isPlainToClass ? instantiateArrayType(arrayType) : [];
      const isSet = newValue instanceof Set;
      const transformArrayEntry = (subValue: any, subSource: any): void => {
        if (!this.options.enableCircularCheck || !this.isCircular(subValue)) {
          let realTargetType;
          if (
            typeof targetType !== 'function' &&
            targetType &&
            targetType.options &&
            targetType.options.discriminator &&
            targetType.options.discriminator.property &&
            targetType.options.discriminator.subTypes
          ) {
            if (this.isPlainToClass) {
              const discriminatorLookup = this.getDiscriminatorLookup(targetType.options.discriminator);
              realTargetType = discriminatorLookup.nameToSubType.get(
                subValue[(targetType as { options: TypeOptions }).options.discriminator.property]
              );
              const options: TypeHelpOptions = { newObject: newValue, object: subValue, property: undefined };
              const newType = targetType.typeFunction(options);
              realTargetType === undefined ? (realTargetType = newType) : (realTargetType = realTargetType.value);
              if (!targetType.options.keepDiscriminatorProperty)
                delete subValue[targetType.options.discriminator.property];
            }

            if (this.isClassToClass) {
              realTargetType = subValue.constructor;
            }
            if (this.isClassToPlain) {
              const discriminatorLookup = this.getDiscriminatorLookup(targetType.options.discriminator);
              subValue[targetType.options.discriminator.property] = discriminatorLookup.valueToSubType.get(
                subValue.constructor
              ).name;
            }
          } else {
            realTargetType = targetType;
          }
          const value = this.transform(
            subSource,
            subValue,
            realTargetType,
            undefined,
            subValue instanceof Map,
            level + 1
          );

          if (isSet) {
            newValue.add(value);
          } else {
            newValue.push(value);
          }
        } else if (this.isClassToClass) {
          if (isSet) {
            newValue.add(subValue);
          } else {
            newValue.push(subValue);
          }
        }
      };

      if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) {
          transformArrayEntry(value[index], source ? source[index] : undefined);
        }
      } else {
        for (const subValue of value) {
          transformArrayEntry(subValue, undefined);
        }
      }
      return newValue;
    } else if (targetType === String && !isMap) {
      if (value === null || value === undefined) return value;
      return String(value);
    } else if (targetType === Number && !isMap) {
      if (value === null || value === undefined) return value;
      return Number(value);
    } else if (targetType === Boolean && !isMap) {
      if (value === null || value === undefined) return value;
      return Boolean(value);
    } else if ((targetType === Date || value instanceof Date) && !isMap) {
      if (value instanceof Date) {
        return new Date(value.valueOf());
      }
      if (value === null || value === undefined) return value;
      return new Date(value);
    } else if (
      this.bufferConstructor &&
      (targetType === this.bufferConstructor || value instanceof this.bufferConstructor) &&
      !isMap
    ) {
      if (value === null || value === undefined) return value;
      return this.bufferConstructor.from(value);
    } else if (isPromise(value) && !isMap) {
      return new Promise((resolve, reject) => {
        value.then(
          (data: any) => resolve(this.transform(undefined, data, targetType, undefined, undefined, level + 1)),
          reject
        );
      });
    } else if (!isMap && value !== null && typeof value === 'object' && typeof value.then === 'function') {
      // Note: We should not enter this, as promise has been handled above
      // This option simply returns the Promise preventing a JS error from happening and should be an inaccessible path.
      return value; // skip promise transformation
    } else if (typeof value === 'object' && value !== null) {
      // try to guess the type
      if (!targetType && value.constructor !== Object /* && TransformationType === TransformationType.CLASS_TO_PLAIN*/)
        if (!Array.isArray(value) && value.constructor === Array) {
          // Somebody attempts to convert special Array like object to Array, eg:
          // const evilObject = { '100000000': '100000000', __proto__: [] };
          // This could be used to cause Denial-of-service attack so we don't allow it.
          // See prevent-array-bomb.spec.ts for more details.
        } else {
          // We are good we can use the built-in constructor
          targetType = value.constructor;
        }
      if (!targetType && source) targetType = source.constructor;

      if (this.options.enableCircularCheck) {
        // add transformed type to prevent circular references
        this.recursionStack.add(value);
      }

      const keys = this.getKeys(targetType as Function, value, isMap);
      const targetPlan =
        !this.options.ignoreDecorators && targetType
          ? this.getTargetTransformationPlan(targetType as Function)
          : undefined;
      const canApplyCustomTransformations = targetType
        ? defaultMetadataStorage.hasTransformMetadatas(targetType as Function)
        : false;
      const valueIsMap = value instanceof Map;
      const shouldCheckReadonlyOrMethods = this.isPlainToClass || this.isClassToClass;
      let newValue: any = source ? source : {};
      if (!source && (this.isPlainToClass || this.isClassToClass)) {
        if (isMap) {
          newValue = new Map();
        } else if (targetType) {
          newValue = new (targetType as any)();
        } else {
          newValue = {};
        }
      }
      const newValueIsMap = newValue instanceof Map;
      const newValuePrototype =
        shouldCheckReadonlyOrMethods && newValue && newValue.constructor ? newValue.constructor.prototype : undefined;

      // traverse over keys
      for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        const key = keys[keyIndex];
        if (key === '__proto__' || key === 'constructor') {
          continue;
        }

        const valueKey = key;
        let newValueKey = key,
          propertyName = key;
        if (targetPlan) {
          if (this.isPlainToClass && targetPlan.hasCustomNameToProperty) {
            const mappedPropertyName = targetPlan.customNameToProperty.get(key);
            if (mappedPropertyName !== undefined) {
              propertyName = mappedPropertyName;
              newValueKey = mappedPropertyName;
            }
          } else if ((this.isClassToPlain || this.isClassToClass) && targetPlan.hasClassPropertyToCustomName) {
            const customName = targetPlan.classPropertyToCustomName.get(key);
            if (customName !== undefined) {
              newValueKey = customName;
            }
          }
        }

        // get a subvalue
        const valueAtKey = valueIsMap ? undefined : value[valueKey];
        let subValue: any = undefined;
        if (this.isPlainToClass) {
          /**
           * This section is added for the following report:
           * https://github.com/typestack/class-transformer/issues/596
           *
           * We should not call functions or constructors when transforming to class.
           */
          subValue = valueAtKey;
        } else {
          if (valueIsMap) {
            subValue = value.get(valueKey);
          } else if (valueAtKey instanceof Function) {
            subValue = valueAtKey.call(value);
          } else {
            subValue = valueAtKey;
          }
        }

        // determine a type
        let type: any = undefined,
          isSubValueMap = subValue instanceof Map;
        if (targetType && isMap) {
          type = targetType;
        } else if (targetType) {
          const metadata = defaultMetadataStorage.findTypeMetadata(targetType as Function, propertyName);
          if (metadata) {
            const options: TypeHelpOptions = { newObject: newValue, object: value, property: propertyName };
            const newType = metadata.typeFunction ? metadata.typeFunction(options) : metadata.reflectedType;
            if (
              metadata.options &&
              metadata.options.discriminator &&
              metadata.options.discriminator.property &&
              metadata.options.discriminator.subTypes
            ) {
              if (!Array.isArray(valueAtKey)) {
                if (this.isPlainToClass) {
                  if (subValue && subValue instanceof Object && metadata.options.discriminator.property in subValue) {
                    const discriminatorLookup = this.getDiscriminatorLookup(metadata.options.discriminator);
                    type = discriminatorLookup.nameToSubType.get(subValue[metadata.options.discriminator.property]);
                  }
                  type === undefined ? (type = newType) : (type = type.value);
                  if (!metadata.options.keepDiscriminatorProperty) {
                    if (subValue && subValue instanceof Object && metadata.options.discriminator.property in subValue) {
                      delete subValue[metadata.options.discriminator.property];
                    }
                  }
                }
                if (this.isClassToClass) {
                  type = subValue.constructor;
                }
                if (this.isClassToPlain) {
                  if (subValue) {
                    const discriminatorLookup = this.getDiscriminatorLookup(metadata.options.discriminator);
                    subValue[metadata.options.discriminator.property] = discriminatorLookup.valueToSubType.get(
                      subValue.constructor
                    ).name;
                  }
                }
              } else {
                type = metadata;
              }
            } else {
              type = newType;
            }
            isSubValueMap = isSubValueMap || metadata.reflectedType === Map;
          } else {
            const targetMapType = this.getTargetMapType(targetType as Function, propertyName);
            if (targetMapType) {
              type = targetMapType;
            }
          }

          if (!type && this.shouldEnableImplicitConversion) {
            const reflectedType = this.getReflectedDesignType(targetType as Function, propertyName);
            if (reflectedType) {
              type = reflectedType;
            }
          }
        }

        // if value is an array try to get its custom array type
        const arrayType = Array.isArray(valueAtKey)
          ? this.getReflectedType(targetType as Function, propertyName)
          : undefined;

        // const subValueKey = TransformationType === TransformationType.PLAIN_TO_CLASS && newKeyName ? newKeyName : key;
        const subSource = source ? source[valueKey] : undefined;

        // if its deserialization then type if required
        // if we uncomment this types like string[] will not work
        // if (this.transformationType === TransformationType.PLAIN_TO_CLASS && !type && subValue instanceof Object && !(subValue instanceof Date))
        //     throw new Error(`Cannot determine type for ${(targetType as any).name }.${propertyName}, did you forget to specify a @Type?`);

        // if newValue is a source object that has method that match newKeyName then skip it
        if (newValuePrototype) {
          const descriptor = this.getPropertyDescriptor(newValuePrototype, newValueKey);
          if (
            // eslint-disable-next-line @typescript-eslint/unbound-method
            (descriptor && !descriptor.set) ||
            newValue[newValueKey] instanceof Function
          )
            //  || TransformationType === TransformationType.CLASS_TO_CLASS
            continue;
        }

        if (!this.options.enableCircularCheck || !this.isCircular(subValue)) {
          const transformKey = this.isPlainToClass ? newValueKey : key;
          let finalValue;

          if (this.isClassToPlain) {
            // Get original value
            if (canApplyCustomTransformations) {
              const originalValue = value[transformKey];
              finalValue = originalValue;
              // Apply custom transformation
              finalValue = this.applyCustomTransformations(
                finalValue,
                targetType as Function,
                transformKey,
                value,
                this.transformationType
              );
              // If nothing change, it means no custom transformation was applied, so use the subValue.
              finalValue = originalValue === finalValue ? subValue : finalValue;
            } else {
              finalValue = subValue;
            }
            // Apply the default transformation
            finalValue = this.transform(subSource, finalValue, type, arrayType, isSubValueMap, level + 1);
          } else {
            if (subValue === undefined && this.options.exposeDefaultValues) {
              // Set default value if nothing provided
              finalValue = newValue[newValueKey];
            } else {
              finalValue = this.transform(subSource, subValue, type, arrayType, isSubValueMap, level + 1);
              if (canApplyCustomTransformations) {
                finalValue = this.applyCustomTransformations(
                  finalValue,
                  targetType as Function,
                  transformKey,
                  value,
                  this.transformationType
                );
              }
            }
          }

          if (finalValue !== undefined || this.options.exposeUnsetFields) {
            if (newValueIsMap) {
              newValue.set(newValueKey, finalValue);
            } else {
              newValue[newValueKey] = finalValue;
            }
          }
        } else if (this.isClassToClass) {
          let finalValue = subValue;
          if (canApplyCustomTransformations) {
            finalValue = this.applyCustomTransformations(
              finalValue,
              targetType as Function,
              key,
              value,
              this.transformationType
            );
          }
          if (finalValue !== undefined || this.options.exposeUnsetFields) {
            if (newValueIsMap) {
              newValue.set(newValueKey, finalValue);
            } else {
              newValue[newValueKey] = finalValue;
            }
          }
        }
      }

      if (this.options.enableCircularCheck) {
        this.recursionStack.delete(value);
      }

      return newValue;
    } else {
      return value;
    }
  }

  private applyCustomTransformations(
    value: any,
    target: Function,
    key: string,
    obj: any,
    transformationType: TransformationType
  ): boolean {
    const metadatas = this.getTransformMetadatasForOptions(target, key);
    if (metadatas.length === 0) {
      return value;
    }

    for (const metadata of metadatas) {
      value = metadata.transformFn({ value, key, obj, type: transformationType, options: this.options });
    }

    return value;
  }

  // preventing circular references
  private isCircular(object: Record<string, any>): boolean {
    return this.recursionStack.has(object);
  }

  private getReflectedType(target: Function, propertyName: string): Function | undefined {
    if (!target) return undefined;
    const meta = defaultMetadataStorage.findTypeMetadata(target, propertyName);
    return meta ? meta.reflectedType : undefined;
  }

  private getKeys(target: Function, object: Record<string, any>, isMap: boolean): string[] {
    const targetPlan = target ? this.getTargetTransformationPlan(target) : undefined;

    // determine exclusion strategy
    let strategy = targetPlan ? targetPlan.strategy : defaultMetadataStorage.getStrategy(target);
    if (strategy === 'none') strategy = this.options.strategy || 'exposeAll'; // exposeAll is default strategy

    // get all keys that need to expose
    let keys: string[] = [];
    if (strategy === 'exposeAll' || isMap) {
      if (object instanceof Map) {
        keys = Array.from(object.keys()) as string[];
      } else {
        keys = Object.keys(object);
      }
    }

    if (isMap) {
      // expose & exclude do not apply for map keys only to fields
      return keys;
    }

    // Fast path for the common plain->class case without expose/exclude metadata-driven filtering.
    if (
      this.isPlainToClass &&
      !this.options.ignoreDecorators &&
      !this.options.excludeExtraneousValues &&
      !this.hasExcludePrefixes &&
      !this.hasVersion &&
      !this.hasGroups &&
      targetPlan &&
      strategy === 'exposeAll' &&
      !targetPlan.hasExposeOrExcludeMetadata
    ) {
      return keys;
    }

    // Fast path when decorators are ignored and no extra filtering is requested.
    if (
      this.options.ignoreDecorators &&
      !this.options.excludeExtraneousValues &&
      !this.hasExcludePrefixes &&
      !this.hasVersion &&
      !this.hasGroups
    ) {
      return keys;
    }

    /**
     * If decorators are ignored but we don't want the extraneous values, then we use the
     * metadata to decide which property is needed, but doesn't apply the decorator effect.
     */
    if (this.options.ignoreDecorators && this.options.excludeExtraneousValues && target) {
      keys = targetPlan.exposedProperties.concat(Array.from(targetPlan.excludedPropertiesSet));
    }

    let shouldFilterByDecorators = false;
    if (!this.options.ignoreDecorators && target) {
      shouldFilterByDecorators = targetPlan.hasExposeOrExcludeMetadata;
      // add all exposed to list of keys
      const exposedProperties = this.isPlainToClass
        ? targetPlan.exposedPropertiesWithCustomNames
        : targetPlan.exposedProperties;
      if (this.options.excludeExtraneousValues) {
        keys = exposedProperties;
      } else {
        keys = keys.concat(exposedProperties);
      }
    }

    const seen = new Set<string>();
    const filteredKeys: string[] = [];
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const key = keys[keyIndex];
      if (seen.has(key)) continue;
      seen.add(key);

      if (shouldFilterByDecorators) {
        if (targetPlan.excludedPropertiesSet.has(key)) {
          continue;
        }
        const exposeMetadata = targetPlan.exposeMetadataByProperty.get(key);
        if (this.hasVersion && exposeMetadata && exposeMetadata.options) {
          if (!this.checkVersion(exposeMetadata.options.since, exposeMetadata.options.until)) {
            continue;
          }
        }

        if (this.hasGroups) {
          if (exposeMetadata && exposeMetadata.options && !this.checkGroups(exposeMetadata.options.groups)) {
            continue;
          }
        } else if (
          exposeMetadata &&
          exposeMetadata.options &&
          exposeMetadata.options.groups &&
          exposeMetadata.options.groups.length
        ) {
          continue;
        }
      }

      if (this.hasExcludePrefixes) {
        let excludedByPrefix = false;
        for (let prefixIndex = 0; prefixIndex < this.excludePrefixes.length; prefixIndex++) {
          const prefix = this.excludePrefixes[prefixIndex];
          if (key.startsWith(prefix)) {
            excludedByPrefix = true;
            break;
          }
        }
        if (excludedByPrefix) continue;
      }

      filteredKeys.push(key);
    }

    return filteredKeys;
  }

  private checkVersion(since: number, until: number): boolean {
    let decision = true;
    if (decision && since) decision = this.options.version >= since;
    if (decision && until) decision = this.options.version < until;

    return decision;
  }

  private checkGroups(groups: string[]): boolean {
    if (!groups || groups.length === 0) return true;
    if (!this.optionsGroupsSet) return false;
    for (const group of groups) {
      if (this.optionsGroupsSet.has(group)) {
        return true;
      }
    }
    return false;
  }

  private getPropertyDescriptor(obj: any, key: PropertyKey): PropertyDescriptor | undefined {
    let descriptorByKey = this.propertyDescriptorCache.get(obj);
    if (!descriptorByKey) {
      descriptorByKey = new Map<PropertyKey, PropertyDescriptor | null>();
      this.propertyDescriptorCache.set(obj, descriptorByKey);
    } else if (descriptorByKey.has(key)) {
      return descriptorByKey.get(key) || undefined;
    }

    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor) {
      descriptorByKey.set(key, descriptor);
      return descriptor;
    }

    const prototype = Object.getPrototypeOf(obj);
    const resolved = prototype ? this.getPropertyDescriptor(prototype, key) : undefined;
    descriptorByKey.set(key, resolved || null);
    return resolved;
  }

  private getTargetTransformationPlan(target: Function): TargetTransformationPlan {
    const existingPlan = this.targetTransformationPlanCache.get(target);
    if (existingPlan) {
      return existingPlan;
    }

    let strategy = defaultMetadataStorage.getStrategy(target);
    if (strategy === 'none') {
      strategy = this.options.strategy || 'exposeAll';
    }

    const exposedProperties = defaultMetadataStorage.getExposedProperties(target, this.transformationType);
    const excludedPropertiesSet = new Set<string>(
      defaultMetadataStorage.getExcludedProperties(target, this.transformationType)
    );
    const classPropertyToCustomName = new Map<string, string>();
    const customNameToProperty = new Map<string, string>();
    const exposeMetadataByProperty = new Map<string, ExposeMetadata>();

    for (const exposeMetadata of defaultMetadataStorage.getExposedMetadatas(target)) {
      exposeMetadataByProperty.set(exposeMetadata.propertyName, exposeMetadata);
      if (exposeMetadata.options && exposeMetadata.options.name) {
        classPropertyToCustomName.set(exposeMetadata.propertyName, exposeMetadata.options.name);
        customNameToProperty.set(exposeMetadata.options.name, exposeMetadata.propertyName);
      }
    }

    const exposedPropertiesWithCustomNames = new Array<string>(exposedProperties.length);
    for (let index = 0; index < exposedProperties.length; index++) {
      const property = exposedProperties[index];
      const customName = classPropertyToCustomName.get(property);
      exposedPropertiesWithCustomNames[index] = customName !== undefined ? customName : property;
    }

    const plan: TargetTransformationPlan = {
      strategy,
      exposedProperties,
      exposedPropertiesWithCustomNames,
      excludedPropertiesSet,
      classPropertyToCustomName,
      customNameToProperty,
      exposeMetadataByProperty,
      hasExposeOrExcludeMetadata: exposedProperties.length > 0 || excludedPropertiesSet.size > 0,
      hasCustomNameToProperty: customNameToProperty.size > 0,
      hasClassPropertyToCustomName: classPropertyToCustomName.size > 0,
    };
    this.targetTransformationPlanCache.set(target, plan);
    return plan;
  }

  private getTransformMetadatasForOptions(target: Function, key: string): TransformMetadata[] {
    let byProperty = this.transformMetadataForOptionsCache.get(target);
    if (!byProperty) {
      byProperty = new Map<string, TransformMetadata[]>();
      this.transformMetadataForOptionsCache.set(target, byProperty);
    } else if (byProperty.has(key)) {
      return byProperty.get(key);
    }

    let metadatas = defaultMetadataStorage.findTransformMetadatas(target, key, this.transformationType);

    if (this.hasVersion) {
      metadatas = metadatas.filter(metadata => {
        if (!metadata.options) return true;
        return this.checkVersion(metadata.options.since, metadata.options.until);
      });
    }

    if (this.hasGroups) {
      metadatas = metadatas.filter(metadata => {
        if (!metadata.options) return true;
        return this.checkGroups(metadata.options.groups);
      });
    } else {
      metadatas = metadatas.filter(metadata => {
        return !metadata.options || !metadata.options.groups || !metadata.options.groups.length;
      });
    }

    byProperty.set(key, metadatas);
    return metadatas;
  }

  private getTargetMapType(target: Function, propertyName: string): Function | undefined {
    const byProperty = this.targetMapLookup.get(target);
    return byProperty ? byProperty.get(propertyName) : undefined;
  }

  private getReflectedDesignType(target: Function, propertyName: string): any {
    let byProperty = this.reflectedTypeCache.get(target);
    if (!byProperty) {
      byProperty = new Map<string, any | null>();
      this.reflectedTypeCache.set(target, byProperty);
    } else if (byProperty.has(propertyName)) {
      return byProperty.get(propertyName);
    }

    // The emitted design:type exists only when property decorators are present.
    const reflectedType = (Reflect as any).getMetadata('design:type', target.prototype, propertyName);
    byProperty.set(propertyName, reflectedType || null);
    return reflectedType;
  }

  private getDiscriminatorLookup(discriminator: any): {
    nameToSubType: Map<string, any>;
    valueToSubType: Map<any, any>;
  } {
    let lookup = this.discriminatorLookupCache.get(discriminator);
    if (lookup) {
      return lookup;
    }

    const nameToSubType = new Map<string, any>();
    const valueToSubType = new Map<any, any>();
    for (const subType of discriminator.subTypes) {
      nameToSubType.set(subType.name, subType);
      valueToSubType.set(subType.value, subType);
    }

    lookup = { nameToSubType, valueToSubType };
    this.discriminatorLookupCache.set(discriminator, lookup);
    return lookup;
  }
}
