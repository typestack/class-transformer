import {defaultMetadataStorage} from "./metadata/MetadataStorage";

export type ConstructorFunction<T> = { new (...args: any[]): T; }

export interface ConstructorToPlainOptions {
    skipStartedWith: string;
}

export interface PlainToConstructorOptions {
    skipStartedWith: string;
}

export class ConstructorUtils {

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    constructorToPlain<T>(object: T, options?: ConstructorToPlainOptions): any {
        if (object instanceof Array) {
            return (<any> object).map((item: any) => this.convert(item.constructor, item, "constructorToPlain"));
        } else {
            const cls = (<any> object.constructor);
            return this.convert(cls, object, "constructorToPlain", options);
        }
    }

    plainToConstructorFromObject<T>(object: T, json: Object, options?: PlainToConstructorOptions): T {
        return this.convert(object, json, "plainToConstructor", options);
    }

    plainToConstructor<T>(cls: ConstructorFunction<T>, json: Object, options?: PlainToConstructorOptions): T {
        return this.convert(cls, json, "plainToConstructor", options);
    }

    plainToConstructorArray<T>(cls: ConstructorFunction<T>, json: Object[], options?: PlainToConstructorOptions): T[] {
        if (!(json instanceof Array))
            throw new Error(`Cannot convert given data to array of constructors. Given object is not an array.`);
        
        return json.map(item => this.plainToConstructor(cls, item, options));
    }

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    private getMethods(obj: Object): string[] {
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
    }
    
    private convert(cls: Function|any, object: any, operationType: "plainToConstructor"|"constructorToPlain", options?: ConstructorToPlainOptions) {
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
                    } /*else {
                        object[key].forEach((arrayItem: any) => {
                            newObject[key].push(arrayItem);
                        });
                    }*/

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
        const meta = defaultMetadataStorage.findSkipMetadata(target, propertyName);
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
    }

}