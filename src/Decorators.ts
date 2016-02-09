import "reflect-metadata";
import {defaultMetadataStorage} from "./metadata/MetadataStorage";
import {TypeMetadata} from "./metadata/TypeMetadata";
import {SkipMetadata} from "./metadata/SkipMetadata";

/**
 * Specifies a type of the property. Property needs to known about its type
 */
export function Type(typeFunction?: () => Function): Function {
    return function(target: any, key: string) {
        const type = Reflect.getMetadata("design:type", target, key);
        const isArray = type && typeof type === "string" ? type.toLowerCase() === "array" : false;
        const metadata = new TypeMetadata(target.constructor, key, typeFunction, isArray);
        defaultMetadataStorage.addTypeMetadata(metadata);
    };
}

/**
 * Marks property as skipped on the process of serialization and deserialization. By default it skips the property
 * for both serialization and deserialization, however you can specify on which of process (deserialization or
 * serialization) you want to skip this property.
 */
export function Skip(options?: { onSerialize: boolean, onDeserialize: boolean }) {
    return function(target: any, key: string) {
        const metadata = new SkipMetadata(target.constructor, key, options);
        defaultMetadataStorage.addSkipMetadata(metadata);
    };
}