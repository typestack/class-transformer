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

    plainToConstructor<T>(cls: ConstructorFunction<T>, json: Object, options?: PlainToConstructorOptions): T {
        return this.convert(cls, json, "plainToConstructor", options);
    }

    plainToConstructorArray<T>(cls: ConstructorFunction<T>, json: Object[], options?: PlainToConstructorOptions): T[] {
        return json.map(item => this.plainToConstructor(cls, item, options));
    }

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    private convert(cls: Function, object: any, operationType: "plainToConstructor"|"constructorToPlain", options?: ConstructorToPlainOptions) {
        if (object === null || object === undefined)
            return object;

        const newObject = operationType === "constructorToPlain" ? {} : new (<any> cls)();

        for (let key in object) {
            if (this.isSkipped(cls, key, operationType)) continue;
            if (typeof object[key] !== "function") {
                if (options && options.skipStartedWith &&
                    key.substr(0, options.skipStartedWith.length) === options.skipStartedWith) continue;

                const type = this.getType(cls, key);

                if (object[key] instanceof Array) {
                    // if (object[key].length > 0 && !type && operationType === "plainToConstructor")
                    //     throw new TypeMissingError(cls, key);

                    const reflectedType = this.getReflectedType(cls, key);
                    newObject[key] = reflectedType && operationType === "plainToConstructor" ? new reflectedType() : [];

                    if (object[key].length > 0 && type) {
                        object[key].forEach((arrayItem: any) => {
                            newObject[key].push(this.convert(type, arrayItem, operationType));
                        });
                    } else {
                        object[key].forEach((arrayItem: any) => {
                            newObject[key].push(arrayItem);
                        });
                    }

                } else if (object[key] instanceof Date && type === Date) {
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

    private getType(target: Function, propertyName: string) {
        if (!target) return undefined;
        const meta = defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.typeFunction() : undefined;
    }

    private getReflectedType(target: Function, propertyName: string) {
        if (!target) return undefined;
        const meta = defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.reflectedType : undefined;
    }

}