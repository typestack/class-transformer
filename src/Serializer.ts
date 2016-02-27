import {defaultMetadataStorage} from "./metadata/MetadataStorage";
import {TypeMissingError} from "./error/TypeMissingError";

type OperationType = string; // use in typescript 1.8 string literal instead:  "deserialization" | "serialization";

export class Serializer {

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    serialize<T>(object: T): any {
        if (object instanceof Array) {
            return (<any> object).map((item: any) => this.convert(item.constructor, item, "serialization"));
        } else {
            const cls = (<any> object.constructor);
            return this.convert(cls, object, "serialization");
        }
    }

    deserialize<T>(cls: Function, json: any): T {
        if (json instanceof Array) {
            return (<any> json).map((item: any) => this.convert(cls, item, "deserialization"));
        } else {
            return this.convert(cls, json, "deserialization");
        }
    }

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    private convert(cls: Function, object: any, operationType: OperationType) {
        const newObject = operationType === "serialization" ? {} : new (<any> cls)();
        Object.keys(object)
            .filter(key => !this.isSkipped(cls, key, operationType))
            .forEach(key => {
                const type = this.getType(cls, key);

                if (object[key] instanceof Array) {
                    if (object[key].length > 0 && !type)
                        throw new TypeMissingError(cls, key);
                    
                    newObject[key] = object[key].map((arrayItem: any) => this.convert(type, arrayItem, operationType));
                    
                } else if (object[key] instanceof Object || type) {
                    if (!type)
                        throw new TypeMissingError(cls, key);

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
            });
        return newObject;
    }

    private isSkipped(target: Function, propertyName: string, operationType: OperationType) {
        const meta = defaultMetadataStorage.findSkipMetadata(target, propertyName);
        return operationType === "serialization" ? meta && meta.isOnSerialize : meta && meta.isOnDeserialize;
    }

    private getType(target: Function, propertyName: string) {
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