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
export function plainToClass<T>(cls: ClassType<T>, plain: Object, options?: ClassTransformOptions): T;
export function plainToClass<T>(cls: ClassType<T>, plain: Object[], options?: ClassTransformOptions): T[]; // plainArrayToClassArray
export function plainToClass<T>(cls: ClassType<T>, plain: Object|Object[], options?: ClassTransformOptions): T|T[] {
    return classTransformer.plainToClass(cls, plain, options);
}

/**
 * Converts plain (literal) object to class (constructor) object.
 * Uses given object as source object (it means fills given object with data from plain object).
 *  Also works with arrays.

export function plainToClassFromExist<T>(clsObject: T, plain: Object, options?: ClassTransformOptions): T;
export function plainToClassFromExist<T>(clsObject: T, plain: Object[], options?: ClassTransformOptions): T[]; // plainArrayToClassArray
export function plainToClassFromExist<T>(clsObject: T, plain: Object|Object[], options?: ClassTransformOptions): T|T[] {
    return classTransformer.plainToClassFromExist(clsObject, plain, options);
} */

/**
 * Converts class (constructor) object to new class (constructor) object. Also works with arrays.

export function classToClass<T>(object: T, options?: ClassTransformOptions): T;
export function classToClass<T>(object: T[], options?: ClassTransformOptions): T[];
export function classToClass<T>(object: T|T[], options?: ClassTransformOptions): T|T[] {
    return classTransformer.classToClass(object, options);
} */

/**
 * Converts class (constructor) object to plain (literal) object.
 * Uses given plain object as source object (it means fills given plain object with data from class object).
 * Also works with arrays.

export function classToClassFromExist<T>(object: T, fromObject: T, options?: ClassTransformOptions): T;
export function classToClassFromExist<T>(object: T, fromObjects: T[], options?: ClassTransformOptions): T[];
export function classToClassFromExist<T>(object: T, fromObject: T|T[], options?: ClassTransformOptions): T|T[] {
    return classTransformer.classToClassFromExist(object, fromObject, options);
} */

/**
 * Converts plain (literan) object to new plain (literal) object. Also works with arrays.

export function plainToPlain<T>(object: T, options?: ClassTransformOptions): T;
export function plainToPlain<T>(object: T[], options?: ClassTransformOptions): T[];
export function plainToPlain<T>(object: T|T[], options?: ClassTransformOptions): T|T[] {
    return classTransformer.plainToPlain(object, options);
} */

/**
 * Converts plain (literan) object to new plain (literal) object. Also works with arrays.

export function plainToPlainFromExist<T>(object: T, fromObject: T, options?: ClassTransformOptions): T;
export function plainToPlainFromExist<T>(object: T[], fromObject: T, options?: ClassTransformOptions): T[];
export function plainToPlainFromExist<T>(object: T|T[], fromObject: T, options?: ClassTransformOptions): T|T[] {
    return classTransformer.plainToPlainFromExist(object, fromObject, options);
} */

/**
 * Serializes given object to a JSON string.

export function serialize<T>(object: T, options?: ClassTransformOptions): string;
export function serialize<T>(object: T[], options?: ClassTransformOptions): string;
export function serialize<T>(object: T|T[], options?: ClassTransformOptions): string {
    return classTransformer.serialize(object, options);
} */

/**
 * Deserializes given JSON string to a object of the given class.

export function deserialize<T>(cls: ClassType<T>, json: string, options?: ClassTransformOptions): T {
    return classTransformer.deserialize(cls, json, options);
} */

/**
 * Deserializes given JSON string to an array of objects of the given class.

export function deserializeArray<T>(cls: T, json: string, options?: ClassTransformOptions): T[] {
    return classTransformer.deserialize(cls, json, options);
}*/

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export const defaultMetadataStorage = new MetadataStorage();
