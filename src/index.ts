import {ClassTransformer, ClassType} from "./ClassTransformer";
import {MetadataStorage} from "./metadata/MetadataStorage";
import {ClassTransformOptions} from "./ClassTransformOptions";

export {ClassTransformer} from "./ClassTransformer";
export * from "./decorators";

const classTransformer = new ClassTransformer();

/**
 * Converts class (constructor) object to plain (literal) object. Also works with arrays.
 */
export function classToPlain<T>(object: T, options?: ClassTransformOptions): Object;
export function classToPlain<T>(object: T[], options?: ClassTransformOptions): Object[];
export function classToPlain<T>(object: T|T[], options?: ClassTransformOptions): Object|Object[] {
    return classTransformer.classToPlain(object, options);
}

/**
 * Converts class (constructor) object to plain (literal) object.
 * Uses given plain object as source object (it means fills given plain object with data from class object).
 * Also works with arrays.
 */
export function classToPlainFromExist<T>(object: T, plainObject: Object, options?: ClassTransformOptions): Object;
export function classToPlainFromExist<T>(object: T, plainObjects: Object[], options?: ClassTransformOptions): Object[];
export function classToPlainFromExist<T>(object: T, plainObject: Object|Object[], options?: ClassTransformOptions): Object|Object[] {
    return classTransformer.classToPlainFromExist(object, plainObject, options);
}

/**
 * Converts plain (literal) object to class (constructor) object. Also works with arrays.
 */
export function plainToClass<T, V extends Array<any>>(cls: ClassType<T>, plain: V, options?: ClassTransformOptions): T[];
export function plainToClass<T, V>(cls: ClassType<T>, plain: V, options?: ClassTransformOptions): T;
export function plainToClass<T, V>(cls: ClassType<T>, plain: V|V[], options?: ClassTransformOptions): T|T[] {
    return classTransformer.plainToClass(cls, plain as any, options);
}

/**
 * Converts plain (literal) object to class (constructor) object.
 * Uses given object as source object (it means fills given object with data from plain object).
 *  Also works with arrays.
 */
export function plainToClassFromExist<T, V extends Array<any>>(clsObject: T[], plain: V, options?: ClassTransformOptions): T[];
export function plainToClassFromExist<T, V>(clsObject: T, plain: V, options?: ClassTransformOptions): T;
export function plainToClassFromExist<T, V>(clsObject: T, plain: V|V[], options?: ClassTransformOptions): T|T[] {
    return classTransformer.plainToClassFromExist(clsObject, plain, options);
}

/**
 * Converts class (constructor) object to new class (constructor) object. Also works with arrays.
 */
export function classToClass<T>(object: T, options?: ClassTransformOptions): T;
export function classToClass<T>(object: T[], options?: ClassTransformOptions): T[];
export function classToClass<T>(object: T|T[], options?: ClassTransformOptions): T|T[] {
    return classTransformer.classToClass(object, options);
}

/**
 * Converts class (constructor) object to plain (literal) object.
 * Uses given plain object as source object (it means fills given plain object with data from class object).
 * Also works with arrays.
 */
export function classToClassFromExist<T>(object: T, fromObject: T, options?: ClassTransformOptions): T;
export function classToClassFromExist<T>(object: T, fromObjects: T[], options?: ClassTransformOptions): T[];
export function classToClassFromExist<T>(object: T, fromObject: T|T[], options?: ClassTransformOptions): T|T[] {
    return classTransformer.classToClassFromExist(object, fromObject, options);
}

/**
 * Serializes given object to a JSON string.
 */
export function serialize<T>(object: T, options?: ClassTransformOptions): string;
export function serialize<T>(object: T[], options?: ClassTransformOptions): string;
export function serialize<T>(object: T|T[], options?: ClassTransformOptions): string {
    return classTransformer.serialize(object, options);
}

/**
 * Deserializes given JSON string to a object of the given class.
 */
export function deserialize<T>(cls: ClassType<T>, json: string, options?: ClassTransformOptions): T {
    return classTransformer.deserialize(cls, json, options);
}

/**
 * Deserializes given JSON string to an array of objects of the given class.
 */
export function deserializeArray<T>(cls: ClassType<T>, json: string, options?: ClassTransformOptions): T[] {
    return classTransformer.deserializeArray(cls, json, options);
}

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export const defaultMetadataStorage = new MetadataStorage();
