import { ClassTransformer } from './ClassTransformer';
import { ClassTransformOptions } from './interfaces';
import { ClassConstructor } from './interfaces';
import 'reflect-metadata';

export { ClassTransformer } from './ClassTransformer';
export * from './decorators';
export * from './interfaces';
export * from './enums';

const classTransformer = new ClassTransformer();

/**
 * Converts class (constructor) object to plain (literal) object. Also works with arrays.
 */
export function instanceToPlain<T>(object: T, options?: ClassTransformOptions): Record<string, any>;
export function instanceToPlain<T>(object: Array<T>, options?: ClassTransformOptions): Array<Record<string, any>>;
export function instanceToPlain<T>(
  object: T | Array<T>,
  options?: ClassTransformOptions
): Record<string, any> | Record<string, any>[] {
  return classTransformer.instanceToPlain(object, options);
}

/**
 * Converts plain (literal) object to class (constructor) object. Also works with arrays.
 */
export function plainToInstance<T, V>(
  cls: ClassConstructor<T>,
  plain: Array<V>,
  options?: ClassTransformOptions
): Array<T>;
export function plainToInstance<T, V>(cls: ClassConstructor<T>, plain: V, options?: ClassTransformOptions): T;
export function plainToInstance<T, V>(
  cls: ClassConstructor<T>,
  plain: V | Array<V>,
  options?: ClassTransformOptions
): T | Array<T> {
  return classTransformer.plainToInstance(cls, plain as any, options);
}

/**
 * Converts class (constructor) object to new class (constructor) object. Also works with arrays.
 */
export function instanceToInstance<T>(object: T, options?: ClassTransformOptions): T;
export function instanceToInstance<T>(object: Array<T>, options?: ClassTransformOptions): Array<T>;
export function instanceToInstance<T>(object: T | Array<T>, options?: ClassTransformOptions): T | Array<T> {
  return classTransformer.instanceToInstance(object, options);
}
