import {defaultMetadataStorage} from "./storage";
import {TypeMetadata} from "./metadata/TypeMetadata";
import {ExposeMetadata} from "./metadata/ExposeMetadata";
import {ExposeOptions, ExcludeOptions, TypeOptions, TransformOptions} from "./metadata/ExposeExcludeOptions";
import {ExcludeMetadata} from "./metadata/ExcludeMetadata";
import {TransformMetadata} from "./metadata/TransformMetadata";

/**
 * Defines a custom logic for value transformation.
 */
export function Transform(transformFn: (value: any) => any, options?: TransformOptions) {
    return function(target: any, key: string) {
        const metadata = new TransformMetadata(target.constructor, key, transformFn, options);
        defaultMetadataStorage.addTransformMetadata(metadata);
    };
}

/**
 * Specifies a type of the property.
 */
export function Type(typeFunction?: (type?: TypeOptions) => Function) {
    return function(target: any, key: string) {
        const type = (Reflect as any).getMetadata("design:type", target, key);
        const metadata = new TypeMetadata(target.constructor, key, type, typeFunction);
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