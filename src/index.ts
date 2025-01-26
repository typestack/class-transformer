import { ClassTransformer } from './ClassTransformer';
import { ClassTransformOptions } from './interfaces';
import { ClassConstructor } from './interfaces';

export { ClassTransformer } from './ClassTransformer';
export * from './decorators';
export * from './interfaces';
export * from './enums';

const classTransformer = new ClassTransformer();

/**
 * Converts class (constructor) object to plain (literal) object. Also works with arrays.
 *
 * @deprecated Function name changed, use the `instanceToPlain` method instead.
 */
export function classToPlain<T>(object: T, options?: ClassTransformOptions): Record<string, any>;
export function classToPlain<T>(object: T[], options?: ClassTransformOptions): Record<string, any>[];
export function classToPlain<T>(
  object: T | T[],
  options?: ClassTransformOptions
): Record<string, any> | Record<string, any>[] {
  return classTransformer.instanceToPlain(object, options);
}

/**
 * Converts class (constructor) object to plain (literal) object. Also works with arrays.
 */
export function instanceToPlain<T>(object: T, options?: ClassTransformOptions): Record<string, any>;
export function instanceToPlain<T>(object: T[], options?: ClassTransformOptions): Record<string, any>[];
export function instanceToPlain<T>(
  object: T | T[],
  options?: ClassTransformOptions
): Record<string, any> | Record<string, any>[] {
  return classTransformer.instanceToPlain(object, options);
}

/**
 * Converts class (constructor) object to plain (literal) object.
 * Uses given plain object as source object (it means fills given plain object with data from class object).
 * Also works with arrays.
 *
 * @deprecated This function is being removed.
 */
export function classToPlainFromExist<T>(
  object: T,
  plainObject: Record<string, any>,
  options?: ClassTransformOptions
): Record<string, any>;
export function classToPlainFromExist<T>(
  object: T,
  plainObjects: Record<string, any>[],
  options?: ClassTransformOptions
): Record<string, any>[];
export function classToPlainFromExist<T>(
  object: T,
  plainObject: Record<string, any> | Record<string, any>[],
  options?: ClassTransformOptions
): Record<string, any> | Record<string, any>[] {
  return classTransformer.classToPlainFromExist(object, plainObject, options);
}

/**
 * Converts plain (literal) object to class (constructor) object. Also works with arrays.
 *
 * @deprecated Function name changed, use the `plainToInstance` method instead.
 */
export function plainToClass<T, V>(cls: ClassConstructor<T>, plain: V[], options?: ClassTransformOptions): T[];
export function plainToClass<T, V>(cls: ClassConstructor<T>, plain: V, options?: ClassTransformOptions): T;
export function plainToClass<T, V>(cls: ClassConstructor<T>, plain: V | V[], options?: ClassTransformOptions): T | T[] {
  return classTransformer.plainToInstance(cls, plain as any, options);
}

/**
 * Converts plain (literal) object to class (constructor) object. Also works with arrays.
 */
export function plainToInstance<T, V>(cls: ClassConstructor<T>, plain: V[], options?: ClassTransformOptions): T[];
export function plainToInstance<T, V>(cls: ClassConstructor<T>, plain: V, options?: ClassTransformOptions): T;
export function plainToInstance<T, V>(
  cls: ClassConstructor<T>,
  plain: V | V[],
  options?: ClassTransformOptions
): T | T[] {
  return classTransformer.plainToInstance(cls, plain as any, options);
}

/**
 * Converts plain (literal) object to class (constructor) object.
 * Uses given object as source object (it means fills given object with data from plain object).
 *  Also works with arrays.
 *
 * @deprecated This function is being removed. The current implementation is incorrect as it modifies the source object.
 */
export function plainToClassFromExist<T, V>(clsObject: T[], plain: V[], options?: ClassTransformOptions): T[];
export function plainToClassFromExist<T, V>(clsObject: T, plain: V, options?: ClassTransformOptions): T;
export function plainToClassFromExist<T, V>(clsObject: T, plain: V | V[], options?: ClassTransformOptions): T | T[] {
  return classTransformer.plainToClassFromExist(clsObject, plain, options);
}

/**
 * Converts class (constructor) object to new class (constructor) object. Also works with arrays.
 */
export function instanceToInstance<T>(object: T, options?: ClassTransformOptions): T;
export function instanceToInstance<T>(object: T[], options?: ClassTransformOptions): T[];
export function instanceToInstance<T>(object: T | T[], options?: ClassTransformOptions): T | T[] {
  return classTransformer.instanceToInstance(object, options);
}

/**
 * Converts class (constructor) object to plain (literal) object.
 * Uses given plain object as source object (it means fills given plain object with data from class object).
 * Also works with arrays.
 *
 * @deprecated This function is being removed. The current implementation is incorrect as it modifies the source object.
 */
export function classToClassFromExist<T>(object: T, fromObject: T, options?: ClassTransformOptions): T;
export function classToClassFromExist<T>(object: T, fromObjects: T[], options?: ClassTransformOptions): T[];
export function classToClassFromExist<T>(object: T, fromObject: T | T[], options?: ClassTransformOptions): T | T[] {
  return classTransformer.classToClassFromExist(object, fromObject, options);
}

/**
 * Serializes given object to a JSON string.
 *
 * @deprecated This function is being removed. Please use
 * ```
 * JSON.stringify(instanceToPlain(object, options))
 * ```
 */
export function serialize<T>(object: T, options?: ClassTransformOptions): string;
export function serialize<T>(object: T[], options?: ClassTransformOptions): string;
export function serialize<T>(object: T | T[], options?: ClassTransformOptions): string {
  return classTransformer.serialize(object, options);
}

/**
 * Deserializes given JSON string to a object of the given class.
 *
 * @deprecated This function is being removed. Please use the following instead:
 * ```
 * plainToInstance(cls, JSON.parse(json), options)
 * ```
 */
export function deserialize<T>(cls: ClassConstructor<T>, json: string, options?: ClassTransformOptions): T {
  return classTransformer.deserialize(cls, json, options);
}

/**
 * Deserializes given JSON string to an array of objects of the given class.
 *
 * @deprecated This function is being removed. Please use the following instead:
 * ```
 * JSON.parse(json).map(value => plainToInstance(cls, value, options))
 * ```
 *
 */
export function deserializeArray<T>(cls: ClassConstructor<T>, json: string, options?: ClassTransformOptions): T[] {
  return classTransformer.deserializeArray(cls, json, options);
}
