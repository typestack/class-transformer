import {ClassTransformOptions} from "./ClassTransformOptions";
import {defaultMetadataStorage} from "./index";

export type ClassType<T> = { new (...args: any[]): T; }

export class ClassTransformer {

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Converts class (constructor) object to plain (literal) object. Also works with arrays.
     */
    classToPlain<T>(object: T, options?: ClassTransformOptions): Object;
    classToPlain<T>(object: T[], options?: ClassTransformOptions): Object[];
    classToPlain<T>(object: T|T[], options?: ClassTransformOptions): Object|Object[] {
        // const arrayType = object instanceof Array ? object.constructor : undefined;
        return this.convert("classToPlain", undefined, object, undefined, undefined, options || {});
    }

    /**
     * Converts class (constructor) object to plain (literal) object.
     * Uses given plain object as source object (it means fills given plain object with data from class object).
     * Also works with arrays.
     */
    classToPlainFromExist<T, P>(object: T, plainObject: P, options?: ClassTransformOptions): P;
    classToPlainFromExist<T, P>(object: T, plainObjects: P[], options?: ClassTransformOptions): P[];
    classToPlainFromExist<T, P>(object: T, plainObject: P|P[], options?: ClassTransformOptions): P|P[] {
        return this.convert("classToPlain", plainObject, object, undefined, undefined, options || {});
    }

    /**
     * Converts plain (literal) object to class (constructor) object. Also works with arrays.
     */
    plainToClass<T, V extends Array<any>>(cls: ClassType<T>, plain: V, options?: ClassTransformOptions): V;
    plainToClass<T, V>(cls: ClassType<T>, plain: V, options?: ClassTransformOptions): V;
    plainToClass<T, V>(cls: ClassType<T>, plain: V|V[], options?: ClassTransformOptions): V|V[] {
        // let newObject: any = {};
        /*if (operationType === "plainToConstructor") {
         if (target instanceof Function) {
         newObject = new (target as any)();
         } else {
         newObject = cls;
         cls = newObject.constructor;
         }
         }*/

        return this.convert("plainToClass", undefined, plain, cls, undefined, options || {});
    }

    /**
     * Converts plain (literal) object to class (constructor) object.
     * Uses given object as source object (it means fills given object with data from plain object).
     *  Also works with arrays.
     */
    /*plainToClassFromExist<T>(clsObject: T, plain: Object, options?: ClassTransformOptions): T;
    plainToClassFromExist<T>(clsObject: T, plain: Object[], options?: ClassTransformOptions): T[]; // plainArrayToClassArray
    plainToClassFromExist<T>(clsObject: T, plain: Object|Object[], options?: ClassTransformOptions): T|T[] {
        return classTransformer.plainToClassFromExist(clsObject, plain, options);
    }*/

    /**
     * Converts class (constructor) object to new class (constructor) object. Also works with arrays.
     */
    /*classToClass<T>(object: T, options?: ClassTransformOptions): T;
    classToClass<T>(object: T[], options?: ClassTransformOptions): T[];
    classToClass<T>(object: T|T[], options?: ClassTransformOptions): T|T[] {
        return classTransformer.classToClass(object, options);
    }*/

    /**
     * Converts class (constructor) object to plain (literal) object.
     * Uses given plain object as source object (it means fills given plain object with data from class object).
     * Also works with arrays.
     */
    /*classToClassFromExist<T>(object: T, fromObject: T, options?: ClassTransformOptions): T;
    classToClassFromExist<T>(object: T, fromObjects: T[], options?: ClassTransformOptions): T[];
    classToClassFromExist<T>(object: T, fromObject: T|T[], options?: ClassTransformOptions): T|T[] {
        return classTransformer.classToClassFromExist(object, fromObject, options);
    }*/

    /**
     * Converts plain (literan) object to new plain (literal) object. Also works with arrays.
     */
    /*plainToPlain<T>(object: T, options?: ClassTransformOptions): T;
    plainToPlain<T>(object: T[], options?: ClassTransformOptions): T[];
    plainToPlain<T>(object: T|T[], options?: ClassTransformOptions): T|T[] {
        return classTransformer.plainToPlain(object, options);
    }*/

    /**
     * Converts plain (literan) object to new plain (literal) object. Also works with arrays.
     */
    /*plainToPlainFromExist<T>(object: T, fromObject: T, options?: ClassTransformOptions): T;
    plainToPlainFromExist<T>(object: T[], fromObject: T, options?: ClassTransformOptions): T[];
    plainToPlainFromExist<T>(object: T|T[], fromObject: T, options?: ClassTransformOptions): T|T[] {
        return classTransformer.plainToPlainFromExist(object, fromObject, options);
    }*/

    /**
     * Serializes given object to a JSON string.
     */
    /*serialize<T>(object: T, options?: ClassTransformOptions): string;
    serialize<T>(object: T[], options?: ClassTransformOptions): string;
    serialize<T>(object: T|T[], options?: ClassTransformOptions): string {
        return classTransformer.serialize(object, options);
    }*/

    /**
     * Deserializes given JSON string to a object of the given class.
     */
    /*deserialize<T>(cls: ClassType<T>, json: string, options?: ClassTransformOptions): T {
        return classTransformer.deserialize(cls, json, options);
    }*/

    /**
     * Deserializes given JSON string to an array of objects of the given class.
     */
    /*deserializeArray<T>(cls: T, json: string, options?: ClassTransformOptions): T[] {
        return classTransformer.deserialize(cls, json, options);
    }
    */
    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private convert(operationType: "plainToClass"|"classToPlain",
                    source: Object|Object[]|any,
                    value: Object|Object[]|any,
                    targetType: Function,
                    arrayType: Function,
                    options: ClassTransformOptions) {

        if (value instanceof Array) {
            const newValue = arrayType /*&& operationType === "plainToConstructor"*/ ? new (arrayType as any)() : [];
            (value as any[]).forEach((subValue, index) => {
                const subSource = source ? source[index] : undefined;
                newValue.push(this.convert(operationType, subSource, subValue, targetType, undefined, options));
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
            // todo: operationType === "constructorToPlain" &&
            if (!targetType && operationType === "classToPlain") targetType = value.constructor;

            const keys = this.getKeys(operationType, targetType, value, options);
            let newValue: any = source ? source : {};
            if (operationType === "plainToClass") {
                newValue = new (targetType as any)();
            }

            // traverse over keys
            for (let key of keys) {
                let valueKey = key, newValueKey = key, propertyName = key;
                if (operationType === "plainToClass") {
                    const exposeMetadata = defaultMetadataStorage.findExposeMetadataByCustomName(targetType, key);
                    if (exposeMetadata) {
                        propertyName = exposeMetadata.propertyName;
                        newValueKey = exposeMetadata.propertyName;
                    }

                } else if (operationType === "classToPlain") {
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
                if (operationType === "plainToClass" && !type && subValue instanceof Object && !(subValue instanceof Date))
                    throw new Error(`Cannot determine type for ${(targetType as any).name }.${propertyName}, did you forgot to specify a @Type?`);

                // if newValue is a source object that has method that match newKeyName then skip it
                if (newValue.constructor.prototype) {
                    const descriptor = Object.getOwnPropertyDescriptor(newValue.constructor.prototype, newValueKey);
                    if (operationType === "plainToClass" && (newValue[newValueKey] instanceof Function || descriptor))
                        continue;
                }

                newValue[newValueKey] = this.convert(operationType, subSource, subValue, type, arrayType, options);
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

    private getKeys(operationType: "plainToClass"|"classToPlain",
                    target: Function,
                    object: Object,
                    options: ClassTransformOptions): string[] {

        // determine exclusion strategy
        let strategy = defaultMetadataStorage.getStrategy(target);
        if (strategy === "none")
            strategy = options.strategy || "exposeAll"; // exposeAll is default strategy

        // get all keys that need to expose
        let keys: string[] = strategy === "exposeAll" ? Object.keys(object) : [];
        /*if (operationType === "plainToClass") {
            keys = keys.map(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                    return exposeMetadata.options.name;
                }

                return key;
            });
        }*/

        // add all exposed to list of keys
        let exposedProperties = defaultMetadataStorage.getExposedProperties(target);
        if (operationType === "plainToClass") {
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
        if (options.version !== undefined) {
            keys = keys.filter(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                if (!exposeMetadata || !exposeMetadata.options)
                    return true;

                let decision = true;
                if (decision && exposeMetadata.options.since)
                    decision = options.version >= exposeMetadata.options.since;
                if (decision && exposeMetadata.options.until)
                    decision = options.version < exposeMetadata.options.until;

                return decision;
            });
        }

        // apply grouping options
        if (options.groups && options.groups.length) {
            keys = keys.filter(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                if (!exposeMetadata || !exposeMetadata.options || !exposeMetadata.options.groups)
                    return true;

                return options.groups.some(optionGroup => exposeMetadata.options.groups.indexOf(optionGroup) !== -1);
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
        if (strategy === "exposeAll" && options.excludePrefixes && options.excludePrefixes.length) {
            keys = keys.filter(key => options.excludePrefixes.every(prefix => {
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