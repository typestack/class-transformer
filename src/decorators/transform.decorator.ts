import { defaultMetadataStorage } from '../storage';
import { TransformFnParams, TransformOptions } from '../interfaces';

/**
 * Defines a custom logic for value transformation.
 *
 * Can be applied to properties only.
 */
export function Transform<T extends Record<string, any> = any, K extends keyof T = any, R = any>(
  transformFn: (params: TransformFnParams<T, K>) => R,
  options: TransformOptions = {}
): PropertyDecorator {
  return function (target: any, propertyName: string | Symbol): void {
    defaultMetadataStorage.addTransformMetadata({
      target: target.constructor,
      propertyName: propertyName as string,
      transformFn,
      options,
    });
  };
}
