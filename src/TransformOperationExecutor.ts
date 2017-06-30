import {ClassTransformOptions} from "./ClassTransformOptions";
import {getDefaultMetadataStorage} from "./storage";
import {TypeOptions} from "./metadata/ExposeExcludeOptions";
import {ExposeMetadata} from "./metadata/ExposeMetadata";

export type TransformationType = "plainToClass"|"classToPlain"|"classToClass";

export class TransformOperationExecutor {

    // -------------------------------------------------------------------------
    // Private Properties
    // -------------------------------------------------------------------------

    private transformedTypesMap = new Map<Object, { level: number, object: Object }>();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private transformationType: TransformationType,
                private options: ClassTransformOptions) {
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    transform(source: Object|Object[]|any,
              value: Object|Object[]|any,
              targetType: Function,
              arrayType: Function,
              isMap: boolean,
              level: number = 0) {

        if (value instanceof Array || value instanceof Set) {
            const newValue = arrayType && this.transformationType === "plainToClass" ? new (arrayType as any)() : [];
            (value as any[]).forEach((subValue, index) => {
                const subSource = source ? source[index] : undefined;
                if (!this.options.enableCircularCheck || !this.isCircular(subValue, level)) {
                    const value = this.transform(subSource, subValue, targetType, undefined, subValue instanceof Map, level + 1);
                    if (newValue instanceof Set) {
                        newValue.add(value);
                    } else {
                        newValue.push(value);
                    }
                } else if (this.transformationType === "classToClass") {
                    if (newValue instanceof Set) {
                        newValue.add(subValue);
                    } else {
                        newValue.push(subValue);
                    }
                }
            });
            return newValue;

        } else if (targetType === String && !isMap) {
            return String(value);

        } else if (targetType === Number && !isMap) {
            return Number(value);

        } else if (targetType === Boolean && !isMap) {
            return Boolean(value);

        } else if ((targetType === Date || value instanceof Date) && !isMap) {
            if (value instanceof Date) {
                return new Date(value.valueOf());
            }
            if (value === null || value === undefined)
                return value;

            return new Date(value);

        } else if (value instanceof Object) {

            // try to guess the type
            if (!targetType && value.constructor !== Object/* && operationType === "classToPlain"*/) targetType = value.constructor;
            if (!targetType && source) targetType = source.constructor;

            if (this.options.enableCircularCheck) {
                // add transformed type to prevent circular references
                this.transformedTypesMap.set(value, { level: level, object: value });
            }

            const keys = this.getKeys(targetType, value);
            let newValue: any = source ? source : {};
            if (!source && (this.transformationType === "plainToClass" || this.transformationType === "classToClass")) {
                if (isMap) {
                    newValue = new Map();
                } else if (targetType) {
                    newValue = new (targetType as any)();
                } else {
                    newValue = {};
                }
            }

            // traverse over keys
            for (let key of keys) {

                let valueKey = key, newValueKey = key, propertyName = key;
                if (!this.options.ignoreDecorators && targetType) {
                    if (this.transformationType === "plainToClass") {
                        const exposeMetadata = getDefaultMetadataStorage().findExposeMetadataByCustomName(targetType, key);
                        if (exposeMetadata) {
                            propertyName = exposeMetadata.propertyName;
                            newValueKey = exposeMetadata.propertyName;
                        }

                    } else if (this.transformationType === "classToPlain" || this.transformationType === "classToClass") {
                        const exposeMetadata = getDefaultMetadataStorage().findExposeMetadata(targetType, key);
                        if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name)
                            newValueKey = exposeMetadata.options.name;
                    }
                }

                // get a subvalue
                let subValue: any = undefined;
                if (value instanceof Map) {
                    subValue = value.get(valueKey);
                } else if (value[valueKey] instanceof Function) {
                    subValue = value[valueKey]();
                } else {
                    subValue = value[valueKey];
                }

                // determine a type
                let type: any = undefined, isSubValueMap = subValue instanceof Map;
                if (targetType && isMap) {
                    type = targetType;

                } else if (targetType) {
                    const metadata = getDefaultMetadataStorage().findTypeMetadata(targetType, propertyName);
                    if (metadata) {
                        const options: TypeOptions = { newObject: newValue, object: value, property: propertyName };
                        type = metadata.typeFunction(options);
                        isSubValueMap = isSubValueMap || metadata.reflectedType === Map;
                    } else if (this.options.targetMaps) { // try to find a type in target maps
                        this.options.targetMaps
                            .filter(map => map.target === targetType && !!map.properties[propertyName])
                            .forEach(map => type = map.properties[propertyName]);
                    }
                }

                // if value is an array try to get its custom array type
                const arrayType = value[valueKey] instanceof Array ? this.getReflectedType(targetType, propertyName) : undefined;
                // const subValueKey = operationType === "plainToClass" && newKeyName ? newKeyName : key;
                const subSource = source ? source[valueKey] : undefined;

                // if its deserialization then type if required
                // if we uncomment this types like string[] will not work
                // if (this.transformationType === "plainToClass" && !type && subValue instanceof Object && !(subValue instanceof Date))
                //     throw new Error(`Cannot determine type for ${(targetType as any).name }.${propertyName}, did you forget to specify a @Type?`);

                // if newValue is a source object that has method that match newKeyName then skip it
                if (newValue.constructor.prototype) {
                    const descriptor = Object.getOwnPropertyDescriptor(newValue.constructor.prototype, newValueKey);
                    if ((this.transformationType === "plainToClass" || this.transformationType === "classToClass")
                        && (newValue[newValueKey] instanceof Function || (descriptor && !descriptor.set))) //  || operationType === "classToClass"
                        continue;
                }

                if (!this.options.enableCircularCheck || !this.isCircular(subValue, level)) {
                    let transformKey = this.transformationType === "plainToClass" ? newValueKey : key;
                    let finalValue = this.transform(subSource, subValue, type, arrayType, isSubValueMap, level + 1);
                    finalValue = this.applyCustomTransformations(finalValue, targetType, transformKey);
                    if (newValue instanceof Map) {
                        newValue.set(newValueKey, finalValue);
                    } else {
                        newValue[newValueKey] = finalValue;
                    }
                } else if (this.transformationType === "classToClass") {
                    let finalValue = subValue;
                    finalValue = this.applyCustomTransformations(finalValue, targetType, key);
                    if (newValue instanceof Map) {
                        newValue.set(newValueKey, finalValue);
                    } else {
                        newValue[newValueKey] = finalValue;
                    }
                }

            }
            return newValue;

        } else {
            return value;
        }
    }

    private applyCustomTransformations(value: any, target: Function, key: string) {
        let metadatas = getDefaultMetadataStorage().findTransformMetadatas(target, key, this.transformationType);

        // apply versioning options
        if (this.options.version !== undefined) {
            metadatas = metadatas.filter(metadata => {
                if (!metadata.options)
                    return true;

                return this.checkVersion(metadata.options.since, metadata.options.until);
            });
        }

        // apply grouping options
        if (this.options.groups && this.options.groups.length) {
            metadatas = metadatas.filter(metadata => {
                if (!metadata.options)
                    return true;

                return this.checkGroups(metadata.options.groups);
            });
        } else {
            metadatas = metadatas.filter(metadata => {
                return  !metadata.options ||
                        !metadata.options.groups ||
                        !metadata.options.groups.length;
            });
        }

        metadatas.forEach(metadata => {
            value = metadata.transformFn(value);
        });

        return value;
    }

    // preventing circular references
    private isCircular(object: Object, level: number) {
        const transformed = this.transformedTypesMap.get(object);
        return transformed !== undefined && transformed.level < level;
    }

    private getReflectedType(target: Function, propertyName: string) {
        if (!target) return undefined;
        const meta = getDefaultMetadataStorage().findTypeMetadata(target, propertyName);
        return meta ? meta.reflectedType : undefined;
    }

    private getKeys(target: Function, object: Object): string[] {

        // determine exclusion strategy
        let strategy = getDefaultMetadataStorage().getStrategy(target);
        if (strategy === "none")
            strategy = this.options.strategy || "exposeAll"; // exposeAll is default strategy

        // get all keys that need to expose
        let keys: any[] = [];
        if (strategy === "exposeAll") {
            if (object instanceof Map) {
                keys = Array.from(object.keys());
            } else {
                keys = Object.keys(object);
            }
        }

        if (!this.options.ignoreDecorators && target) {

            // add all exposed to list of keys
            let exposedProperties = getDefaultMetadataStorage().getExposedProperties(target, this.transformationType);
            if (this.transformationType === "plainToClass") {
                exposedProperties = exposedProperties.map(key => {
                    const exposeMetadata = getDefaultMetadataStorage().findExposeMetadata(target, key);
                    if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                        return exposeMetadata.options.name;
                    }

                    return key;
                });
            }
            keys = keys.concat(exposedProperties);

            // exclude excluded properties
            const excludedProperties = getDefaultMetadataStorage().getExcludedProperties(target, this.transformationType);
            if (excludedProperties.length > 0) {
                keys = keys.filter(key => {
                    return excludedProperties.indexOf(key) === -1;
                });
            }

            // apply versioning options
            if (this.options.version !== undefined) {
                keys = keys.filter(key => {
                    const exposeMetadata = getDefaultMetadataStorage().findExposeMetadata(target, key);
                    if (!exposeMetadata || !exposeMetadata.options)
                        return true;

                    return this.checkVersion(exposeMetadata.options.since, exposeMetadata.options.until);
                });
            }

            // apply grouping options
            if (this.options.groups && this.options.groups.length) {
                keys = keys.filter(key => {
                    const exposeMetadata = getDefaultMetadataStorage().findExposeMetadata(target, key);
                    if (!exposeMetadata || !exposeMetadata.options)
                        return true;

                    return this.checkGroups(exposeMetadata.options.groups);
                });
            } else {
                keys = keys.filter(key => {
                    const exposeMetadata = getDefaultMetadataStorage().findExposeMetadata(target, key);
                    return  !exposeMetadata ||
                            !exposeMetadata.options ||
                            !exposeMetadata.options.groups ||
                            !exposeMetadata.options.groups.length;
                });
            }
        }

        // exclude prefixed properties
        if (this.options.excludePrefixes && this.options.excludePrefixes.length) {
            keys = keys.filter(key => this.options.excludePrefixes.every(prefix => {
                return key.substr(0, prefix.length) !== prefix;
            }));
        }

        // make sure we have unique keys
        keys = keys.filter((key, index, self) => {
            return self.indexOf(key) === index;
        });

        return keys;
    }

    private checkVersion(since: number, until: number) {
        let decision = true;
        if (decision && since)
            decision = this.options.version >= since;
        if (decision && until)
            decision = this.options.version < until;

        return decision;
    }

    private checkGroups(groups: string[]) {
        if (!groups)
            return true;

        return this.options.groups.some(optionGroup => groups.indexOf(optionGroup) !== -1);
    }

}
