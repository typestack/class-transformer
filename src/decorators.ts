import {defaultMetadataStorage} from "./metadata/MetadataStorage";
import {TypeMetadata} from "./metadata/TypeMetadata";
import {SkipMetadata} from "./metadata/SkipMetadata";

/**
 * Specifies a type of the property.
 */
export function Type(typeFunction?: (type?: any) => Function) {
    return function(target: any, key: string) {
        const type = (<any> Reflect).getMetadata("design:type", target, key);
        const isArray = type && typeof type === "string" ? type.toLowerCase() === "array" : false;
        const metadata = new TypeMetadata(target.constructor, key, type, typeFunction, isArray);
        defaultMetadataStorage.addTypeMetadata(metadata);
    };
}

/**
 * Specifies a type of the property. Property must be an array.
 */
export function ArrayType(typeFunction?: (type?: any) => Function) {
    return function(target: any, key: string) {
        const type = (<any> Reflect).getMetadata("design:type", target, key);
        const metadata = new TypeMetadata(target.constructor, key, type, typeFunction, true);
        defaultMetadataStorage.addTypeMetadata(metadata);
    };
}

/**
 * Marks property as skipped on the process of transformation. By default it skips the property for both 
 * constructorToPlain and plainToConstructor transformations, however you can specify on which of transformation types 
 * you want to skip this property.
 */
export function Skip(options?: { constructorToPlain?: boolean, plainToConstructor?: boolean }) {
    return function(target: any, key: string) {
        const metadata = new SkipMetadata(target.constructor, key, options);
        defaultMetadataStorage.addSkipMetadata(metadata);
    };
}
