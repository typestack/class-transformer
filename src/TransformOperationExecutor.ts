import {ClassTransformOptions} from "./ClassTransformOptions";
import {defaultMetadataStorage} from "./index";

export type ConvertOperationType = "plainToClass"|"classToPlain"|"classToClass";

export class TransformOperationExecutor {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private operationType: ConvertOperationType,
                private options: ClassTransformOptions) {
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    transform(source: Object|Object[]|any,
                    value: Object|Object[]|any,
                    targetType: Function,
                    arrayType: Function) {

        if (value instanceof Array) {
            const newValue = arrayType /*&& operationType === "plainToConstructor"*/ ? new (arrayType as any)() : [];
            (value as any[]).forEach((subValue, index) => {
                const subSource = source ? source[index] : undefined;
                newValue.push(this.transform(subSource, subValue, targetType, undefined));
            });
            return newValue;

        } else if (targetType === String) {
            return String(value);

        } else if (targetType === Number) {
            return Number(value);

        } else if (targetType === Boolean) {
            return Boolean(value);

        } else if (targetType === Date || value instanceof Date) {
            if (value instanceof Date) {
                return new Date(value.getTime());
            }
            return new Date(value);

        } else if (value instanceof Object) {

            // try to guess the type
            if (!targetType && value.constructor !== Object/* && operationType === "classToPlain"*/) targetType = value.constructor;
            if (!targetType && source) targetType = source.constructor;

            const keys = this.getKeys(targetType, value);
            let newValue: any = source ? source : {};
            if (!source && (this.operationType === "plainToClass" || this.operationType === "classToClass")) {
                newValue = new (targetType as any)();
            }

            // traverse over keys
            for (let key of keys) {
                let valueKey = key, newValueKey = key, propertyName = key;
                if (this.operationType === "plainToClass") {
                    const exposeMetadata = defaultMetadataStorage.findExposeMetadataByCustomName(targetType, key);
                    if (exposeMetadata) {
                        propertyName = exposeMetadata.propertyName;
                        newValueKey = exposeMetadata.propertyName;
                    }

                } else if (this.operationType === "classToPlain" || this.operationType === "classToClass") {
                    const exposeMetadata = defaultMetadataStorage.findExposeMetadata(targetType, key);
                    if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name)
                        newValueKey = exposeMetadata.options.name;
                }

                let type = this.getKeyType(value, targetType, propertyName);

                // if value is an array try to get its custom array type
                const arrayType = value[valueKey] instanceof Array ? this.getReflectedType(targetType, propertyName) : undefined;
                // const subValueKey = operationType === "plainToClass" && newKeyName ? newKeyName : key;
                const subValue = value[valueKey] instanceof Function ? value[valueKey]() : value[valueKey];
                const subSource = source ? source[valueKey] : undefined;

                // if its deserialization then type if required
                if (this.operationType === "plainToClass" && !type && subValue instanceof Object && !(subValue instanceof Date))
                    throw new Error(`Cannot determine type for ${(targetType as any).name }.${propertyName}, did you forgot to specify a @Type?`);

                // if newValue is a source object that has method that match newKeyName then skip it
                if (newValue.constructor.prototype) {
                    const descriptor = Object.getOwnPropertyDescriptor(newValue.constructor.prototype, newValueKey);
                    if ((this.operationType === "plainToClass" || this.operationType === "classToClass") && (newValue[newValueKey] instanceof Function || descriptor)) //  || operationType === "classToClass"
                        continue;
                }

                newValue[newValueKey] = this.transform(subSource, subValue, type, arrayType);
            }
            return newValue;

        } else {
            return value;
        }
    }

    private getKeyType(object: Object, target: Function, key: string) {
        if (!target) return undefined;
        const metadata = defaultMetadataStorage.findTypeMetadata(target, key);
        return metadata ? metadata.typeFunction(object) : undefined;
    }

    private getReflectedType(target: Function, propertyName: string) {
        if (!target) return undefined;
        const meta = defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.reflectedType : undefined;
    }

    private getKeys(target: Function, object: Object): string[] {

        // determine exclusion strategy
        let strategy = defaultMetadataStorage.getStrategy(target);
        if (strategy === "none")
            strategy = this.options.strategy || "exposeAll"; // exposeAll is default strategy

        // get all keys that need to expose
        let keys: string[] = strategy === "exposeAll" ? Object.keys(object) : [];

        // add all exposed to list of keys
        let exposedProperties = defaultMetadataStorage.getExposedProperties(target);
        if (this.operationType === "plainToClass") {
            exposedProperties = exposedProperties.map(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                    return exposeMetadata.options.name;
                }

                return key;
            });
        }
        keys = keys.concat(exposedProperties);

        // exclude excluded properties
        const excludedProperties = defaultMetadataStorage.getExcludedProperties(target);
        if (excludedProperties.length > 0) {
            keys = keys.filter(key => {
                return excludedProperties.indexOf(key) === -1;
            });
        }

        // apply versioning options
        if (this.options.version !== undefined) {
            keys = keys.filter(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                if (!exposeMetadata || !exposeMetadata.options)
                    return true;

                let decision = true;
                if (decision && exposeMetadata.options.since)
                    decision = this.options.version >= exposeMetadata.options.since;
                if (decision && exposeMetadata.options.until)
                    decision = this.options.version < exposeMetadata.options.until;

                return decision;
            });
        }

        // apply grouping options
        if (this.options.groups && this.options.groups.length) {
            keys = keys.filter(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                if (!exposeMetadata || !exposeMetadata.options || !exposeMetadata.options.groups)
                    return true;

                return this.options.groups.some(optionGroup => exposeMetadata.options.groups.indexOf(optionGroup) !== -1);
            });
        } else {
            keys = keys.filter(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                return  !exposeMetadata ||
                        !exposeMetadata.options ||
                        !exposeMetadata.options.groups ||
                        !exposeMetadata.options.groups.length;
            });
        }

        // exclude prefixed properties
        if (strategy === "exposeAll" && this.options.excludePrefixes && this.options.excludePrefixes.length) {
            keys = keys.filter(key => this.options.excludePrefixes.every(prefix => {
                return key.substr(0, prefix.length) !== prefix;
            }));
        }

        // make sure we have unique keys
        keys = keys.filter((key, index, self) => {
            return self.indexOf(key) === index;
        });

        // todo: also need to include onSerialize/onDeserialize

        return keys;
    }

    /*classToPlain<T>(object: T, options?: ClassTransformOptions): any {
        if (object instanceof Array) {
            return (<any> object).map((item: any) => {
                if (item instanceof Object) {
                    return this.convert(item.constructor, item, "constructorToPlain")
                } else {
                    return item;
                }
            });
        } else {
            const cls = (<any> object.constructor);
            return this.convert(cls, object, "constructorToPlain", options);
        }
    }

    plainToClassFromExist<T>(object: T, json: Object, options?: ClassTransformOptions): T {
        return this.convert(object, json, "plainToConstructor", options);
    }

    plainToClass<T>(cls: ClassType<T>, json: Object, options?: ClassTransformOptions): T {
        return this.convert(cls, json, "plainToConstructor", options);
    }

    plainToConstructorArray<T>(cls: ClassType<T>, json: Object[], options?: ClassTransformOptions): T[] {
        if (!(json instanceof Array))
            throw new Error(`Cannot convert given data to array of constructors. Given object is not an array.`);
        
        return json.map(item => this.plainToClass(cls, item, options));
    }*/

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    /*private getMethods(obj: Object): string[] {
        let ret = Object.getOwnPropertyNames(obj);
        while (true) {
            obj = Object.getPrototypeOf(obj);
            let arr: string[];
            try {
                arr = Object.getOwnPropertyNames(obj);
            } catch (e) {
                break;
            }
    
            for (let i = 0; i < arr.length; i++) {
                if (ret.indexOf(arr[i]) == -1)
                    ret.push(arr[i]);
            }
        }
    
        return ret;
    }*/
    
    /*private convert(cls: Function|any, object: any, operationType: "plainToConstructor"|"constructorToPlain", options?: ConstructorToPlainOptions) {
        if (object === null || object === undefined)
            return object;

        let newObject: any = {};
        if (operationType === "plainToConstructor") {
            if (cls instanceof Function) {
                newObject = new (<any> cls)();
            } else {
                newObject = cls;
                cls = newObject.constructor;
            }
        }

        let keys = Object.keys(object);
        if (operationType === "constructorToPlain") {
            keys = keys.concat(this.getMethods(cls.prototype)).filter(key => [
                'constructor',
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                '__defineGetter__',
                '__lookupGetter__',
                '__defineSetter__',
                '__lookupSetter__',
                '__proto__'
            ].indexOf(key) === -1);
        }
        for (let key of keys) {
            if (this.isSkipped(cls, key, operationType)) continue;
            if (typeof object[key] !== "function" && object[key] !== undefined) {
                if (options && options.skipStartedWith &&
                    key.substr(0, options.skipStartedWith.length) === options.skipStartedWith) continue;

                let type = this.getType(cls, key, newObject);
                if (!type && operationType === "constructorToPlain") {
                    if (!(object[key] instanceof Array) && object[key] instanceof Object && object[key].constructor) { // guess type from the object
                        type = object[key].constructor;
                    }
                }

                if (object[key] instanceof Array) {
                    // if (object[key].length > 0 && !type && operationType === "plainToConstructor")
                    //     throw new TypeMissingError(cls, key);

                    const reflectedType = this.getReflectedType(cls, key);
                    newObject[key] = reflectedType && operationType === "plainToConstructor" ? new reflectedType() : [];

                    if (object[key].length > 0) {
                        object[key].forEach((arrayItem: any) => { // todo: need to implement support of arrays inside arrays too?
                            if (!type && operationType === "constructorToPlain" && arrayItem instanceof Object && arrayItem.constructor) {
                                type = arrayItem.constructor;
                            }
                            if (type) {
                                newObject[key].push(this.convert(type, arrayItem, operationType));
                            } else {
                                newObject[key].push(arrayItem);
                            }
                        });
                    } /!*else {
                        object[key].forEach((arrayItem: any) => {
                            newObject[key].push(arrayItem);
                        });
                    }*!/

                } else if (object[key] instanceof Date && type === Date && operationType === "constructorToPlain") {
                    newObject[key] = object[key].toISOString();

                } else if (object[key] instanceof Object && typeof object[key] === "object" && type) {
                    // if (!type && operationType === "plainToConstructor")
                    //     throw new TypeMissingError(cls, key);
                    newObject[key] = this.convert(type, object[key], operationType);

                } else {

                    if (type === Date) {
                        newObject[key] = new Date(object[key]);
                    } else if (type === String) {
                        newObject[key] = String(object[key]);
                    } else if (type === Number) {
                        newObject[key] = Number(object[key]);
                    } else if (type === Boolean) {
                        newObject[key] = Boolean(object[key]);
                    } else {
                        newObject[key] = object[key];
                    }
                    
                }
            }
        }

        return newObject;
    }

    private isSkipped(target: Function, propertyName: string, operationType: "plainToConstructor"|"constructorToPlain") {
        if (!target) return undefined;
        const meta = defaultMetadataStorage.findExcludeMetadata(target, propertyName);
        return operationType === "constructorToPlain" ? meta && meta.isConstructorToPlain : meta && meta.isPlainToConstructor;
    }

    private getType(target: Function, propertyName: string, object: any) {
        if (!target) return undefined;
        const meta = defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.typeFunction(object) : undefined;
    }

    private getReflectedType(target: Function, propertyName: string) {
        if (!target) return undefined;
        const meta = defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.reflectedType : undefined;
    }*/

}