import { ClassTransformOptions } from './interfaces';
import { TransformOperationExecutor } from './TransformOperationExecutor';
import { TransformationType } from './enums';
import { ClassConstructor } from './interfaces';
import { defaultOptions } from './constants/default-options.constant';

export class ClassTransformer {
  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Converts class (constructor) object to plain (literal) object. Also works with arrays.
   */
  instanceToPlain<T extends Record<string, any>>(object: T, options?: ClassTransformOptions): Record<string, any>;
  instanceToPlain<T extends Record<string, any>>(
    object: Array<T>,
    options?: ClassTransformOptions
  ): Array<Record<string, any>>;
  instanceToPlain<T extends Record<string, any>>(
    object: T | Array<T>,
    options?: ClassTransformOptions
  ): Record<string, any> | Record<string, any>[] {
    const executor = new TransformOperationExecutor(TransformationType.CLASS_TO_PLAIN, {
      ...defaultOptions,
      ...options,
    });
    return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
  }

  /**
   * Converts plain (literal) object to class (constructor) object. Also works with arrays.
   */
  plainToInstance<T extends Record<string, any>, V extends Array<any>>(
    cls: ClassConstructor<T>,
    plain: V,
    options?: ClassTransformOptions
  ): Array<T>;
  plainToInstance<T extends Record<string, any>, V>(
    cls: ClassConstructor<T>,
    plain: V,
    options?: ClassTransformOptions
  ): T;
  plainToInstance<T extends Record<string, any>, V>(
    cls: ClassConstructor<T>,
    plain: V | Array<V>,
    options?: ClassTransformOptions
  ): T | Array<T> {
    const executor = new TransformOperationExecutor(TransformationType.PLAIN_TO_CLASS, {
      ...defaultOptions,
      ...options,
    });
    return executor.transform(undefined, plain, cls, undefined, undefined, undefined);
  }

  /**
   * Converts class (constructor) object to new class (constructor) object. Also works with arrays.
   */
  instanceToInstance<T>(object: T, options?: ClassTransformOptions): T;
  instanceToInstance<T>(object: Array<T>, options?: ClassTransformOptions): Array<T>;
  instanceToInstance<T>(object: T | Array<T>, options?: ClassTransformOptions): T | Array<T> {
    const executor = new TransformOperationExecutor(TransformationType.CLASS_TO_CLASS, {
      ...defaultOptions,
      ...options,
    });
    return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
  }
}
