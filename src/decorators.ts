import {defaultMetadataStorage} from "./index";
import {TypeMetadata} from "./metadata/TypeMetadata";
import {ExposeMetadata} from "./metadata/ExposeMetadata";
import {ExposeOptions, ExcludeOptions} from "./metadata/ExposeExcludeOptions";
import {ExcludeMetadata} from "./metadata/ExcludeMetadata";

/**
 * Specifies a type of the property.
 */
export function Type(typeFunction?: (type?: any) => Function) {
    return function(target: any, key: string) {
        const type = (Reflect as any).getMetadata("design:type", target, key);
        const isArray = type && typeof type === "string" ? type.toLowerCase() === "array" : false;
        const metadata = new TypeMetadata(target.constructor, key, type, typeFunction, isArray);
        defaultMetadataStorage.addTypeMetadata(metadata);
    };
}

/**
 * Marks property as included in the process of transformation. By default it includes the property for both
 * constructorToPlain and plainToConstructor transformations, however you can specify on which of transformation types
 * you want to skip this property.
 */
export function Expose(options?: ExposeOptions) {
    return function(object: Object|Function, propertyName?: string) {
        const metadata = new ExposeMetadata(object instanceof Function ? object : object.constructor, propertyName, options || {});
        defaultMetadataStorage.addExposeMetadata(metadata);
    };
}

/**
 * Marks property as excluded from the process of transformation. By default it excludes the property for both
 * constructorToPlain and plainToConstructor transformations, however you can specify on which of transformation types
 * you want to skip this property.
 */
export function Exclude(options?: ExcludeOptions) {
    return function(object: Object|Function, propertyName?: string) {
        const metadata = new ExcludeMetadata(object instanceof Function ? object : object.constructor, propertyName, options || {});
        defaultMetadataStorage.addExcludeMetadata(metadata);
    };
}