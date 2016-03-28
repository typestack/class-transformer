import {defaultMetadataStorage} from "./metadata/MetadataStorage";

export interface SerializerOptions {
    skipStartedWith: string;
}

export class Serializer {

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    serialize<T>(object: T, options?: SerializerOptions): any {
        if (object instanceof Array) {
            return (<any> object).map((item: any) => this.convert(item.constructor, item, "serialization"));
        } else {
            const cls = (<any> object.constructor);
            return this.convert(cls, object, "serialization", options);
        }
    }

    deserialize<T>(cls: Function, json: any, options?: SerializerOptions): T {
        if (json instanceof Array) {
            return (<any> json).map((item: any) => this.convert(cls, item, "deserialization"));
        } else {
            return this.convert(cls, json, "deserialization", options);
        }
    }

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    private convert(cls: Function, object: any, operationType: "deserialization"|"serialization", options?: SerializerOptions) {
        if (object === null || object === undefined)
            return object;

        const newObject = operationType === "serialization" ? {} : new (<any> cls)();

        for (let key in object) {
            if (this.isSkipped(cls, key, operationType)) continue;
            if (typeof object[key] !== "function") {
                if (options && options.skipStartedWith &&
                    key.substr(0, options.skipStartedWith.length) === options.skipStartedWith) continue;

                const type = this.getType(cls, key);

                if (object[key] instanceof Array) {
                    // if (object[key].length > 0 && !type && operationType === "deserialization")
                    //     throw new TypeMissingError(cls, key);

                    if (object[key].length > 0 && type) {
                        newObject[key] = object[key].map((arrayItem: any) => this.convert(type, arrayItem, operationType));
                    } else {
                        newObject[key] = object[key];
                    }

                } else if (object[key] instanceof Object || type) {
                    // if (!type && operationType === "deserialization")
                    //     throw new TypeMissingError(cls, key);

                    if (type === Date) {
                        newObject[key] = new Date(object[key]);
                    } else if (type === String) {
                        newObject[key] = String(object[key]);
                    } else if (type === Number) {
                        newObject[key] = Number(object[key]);
                    } else if (type === Boolean) {
                        newObject[key] = Boolean(object[key]);
                    } else {
                        newObject[key] = this.convert(type, object[key], operationType);
                    }

                } else {
                    newObject[key] = object[key];
                }
            }
        }

        return newObject;
    }

    private isSkipped(target: Function, propertyName: string, operationType: "deserialization"|"serialization") {
        if (!target) return undefined;
        const meta = defaultMetadataStorage.findSkipMetadata(target, propertyName);
        return operationType === "serialization" ? meta && meta.isOnSerialize : meta && meta.isOnDeserialize;
    }

    private getType(target: Function, propertyName: string) {
        if (!target) return undefined;
        const meta = defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.typeFunction() : undefined;
    }

}

const serializer = new Serializer();
export default serializer;
export function serialize<T>(object: T) {
    return serializer.serialize(object);
}
export function deserialize<T>(cls: Function, json: any): T {
    return serializer.deserialize<T>(cls, json);
}