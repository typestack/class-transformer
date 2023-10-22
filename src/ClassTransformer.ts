import { ClassTransformOptions } from './interfaces';
import { TransformOperationExecutor } from './TransformOperationExecutor';
import { TransformationType } from './enums';
import { ClassConstructor } from './interfaces';
import { defaultOptions } from './constants/default-options.constant';
import { instanceToPlainAsync } from './utils';

export class ClassTransformer {
  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Converts class (constructor) object to plain (literal) object. Also works with arrays.
   */
  instanceToPlain<T extends Record<string, any>>(object: T, options?: ClassTransformOptions): Record<string, any>;
  instanceToPlain<T extends Record<string, any>>(object: T[], options?: ClassTransformOptions): Record<string, any>[];
  instanceToPlain<T extends Record<string, any>>(
    object: T | T[],
    options?: ClassTransformOptions
  ): Record<string, any> | Record<string, any>[] {
    const executor = new TransformOperationExecutor(TransformationType.CLASS_TO_PLAIN, {
      ...defaultOptions,
      ...options,
    });
    return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
  }

  /**
   * Converts class (constructor) object to plain (literal) object with support to promise values resolution
   */

  instanceToPlainAsync<T extends Record<string, any>>(object: T, options?: ClassTransformOptions): Record<string, any>;
  instanceToPlainAsync<T extends Record<string, any>>(
    object: T[],
    options?: ClassTransformOptions
  ): Record<string, any>[];
  instanceToPlainAsync<T extends Record<string, any>>(
    object: T | T[],
    options?: ClassTransformOptions
  ): Record<string, any> | Record<string, any>[] {
    const executor = new TransformOperationExecutor(TransformationType.CLASS_TO_PLAIN, {
      ...defaultOptions,
      ...options,
    });
    return instanceToPlainAsync(
      executor.transform(undefined, object, undefined, undefined, undefined, undefined),
      this.instanceToPlain
    );
  }

  /**
   * Converts class (constructor) object to plain (literal) object.
   * Uses given plain object as source object (it means fills given plain object with data from class object).
   * Also works with arrays.
   */
  classToPlainFromExist<T extends Record<string, any>, P>(
    object: T,
    plainObject: P,
    options?: ClassTransformOptions
  ): T;
  classToPlainFromExist<T extends Record<string, any>, P>(
    object: T,
    plainObjects: P[],
    options?: ClassTransformOptions
  ): T[];
  classToPlainFromExist<T extends Record<string, any>, P>(
    object: T,
    plainObject: P | P[],
    options?: ClassTransformOptions
  ): T | T[] {
    const executor = new TransformOperationExecutor(TransformationType.CLASS_TO_PLAIN, {
      ...defaultOptions,
      ...options,
    });
    return executor.transform(plainObject, object, undefined, undefined, undefined, undefined);
  }

  /**
   * Converts plain (literal) object to class (constructor) object. Also works with arrays.
   */
  plainToInstance<T extends Record<string, any>, V extends Array<any>>(
    cls: ClassConstructor<T>,
    plain: V,
    options?: ClassTransformOptions
  ): T[];
  plainToInstance<T extends Record<string, any>, V>(
    cls: ClassConstructor<T>,
    plain: V,
    options?: ClassTransformOptions
  ): T;
  plainToInstance<T extends Record<string, any>, V>(
    cls: ClassConstructor<T>,
    plain: V | V[],
    options?: ClassTransformOptions
  ): T | T[] {
    const executor = new TransformOperationExecutor(TransformationType.PLAIN_TO_CLASS, {
      ...defaultOptions,
      ...options,
    });
    return executor.transform(undefined, plain, cls, undefined, undefined, undefined);
  }

  /**
   * Converts plain (literal) object to class (constructor) object.
   * Uses given object as source object (it means fills given object with data from plain object).
   * Also works with arrays.
   */
  plainToClassFromExist<T extends Record<string, any>, V extends Array<any>>(
    clsObject: T,
    plain: V,
    options?: ClassTransformOptions
  ): T;
  plainToClassFromExist<T extends Record<string, any>, V>(clsObject: T, plain: V, options?: ClassTransformOptions): T[];
  plainToClassFromExist<T extends Record<string, any>, V>(
    clsObject: T,
    plain: V | V[],
    options?: ClassTransformOptions
  ): T | T[] {
    const executor = new TransformOperationExecutor(TransformationType.PLAIN_TO_CLASS, {
      ...defaultOptions,
      ...options,
    });
    return executor.transform(clsObject, plain, undefined, undefined, undefined, undefined);
  }

  /**
   * Converts class (constructor) object to new class (constructor) object. Also works with arrays.
   */
  instanceToInstance<T>(object: T, options?: ClassTransformOptions): T;
  instanceToInstance<T>(object: T[], options?: ClassTransformOptions): T[];
  instanceToInstance<T>(object: T | T[], options?: ClassTransformOptions): T | T[] {
    const executor = new TransformOperationExecutor(TransformationType.CLASS_TO_CLASS, {
      ...defaultOptions,
      ...options,
    });
    return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
  }

  /**
   * Converts class (constructor) object to plain (literal) object.
   * Uses given plain object as source object (it means fills given plain object with data from class object).
   * Also works with arrays.
   */
  classToClassFromExist<T>(object: T, fromObject: T, options?: ClassTransformOptions): T;
  classToClassFromExist<T>(object: T, fromObjects: T[], options?: ClassTransformOptions): T[];
  classToClassFromExist<T>(object: T, fromObject: T | T[], options?: ClassTransformOptions): T | T[] {
    const executor = new TransformOperationExecutor(TransformationType.CLASS_TO_CLASS, {
      ...defaultOptions,
      ...options,
    });
    return executor.transform(fromObject, object, undefined, undefined, undefined, undefined);
  }

  /**
   * Serializes given object to a JSON string.
   */
  serialize<T>(object: T, options?: ClassTransformOptions): string;
  serialize<T>(object: T[], options?: ClassTransformOptions): string;
  serialize<T>(object: T | T[], options?: ClassTransformOptions): string {
    return JSON.stringify(this.instanceToPlain(object, options));
  }

  /**
   * Deserializes given JSON string to a object of the given class.
   */
  deserialize<T>(cls: ClassConstructor<T>, json: string, options?: ClassTransformOptions): T {
    const jsonObject: T = JSON.parse(json);
    return this.plainToInstance(cls, jsonObject, options);
  }

  /**
   * Deserializes given JSON string to an array of objects of the given class.
   */
  deserializeArray<T>(cls: ClassConstructor<T>, json: string, options?: ClassTransformOptions): T[] {
    const jsonObject: any[] = JSON.parse(json);
    return this.plainToInstance(cls, jsonObject, options);
  }
}
