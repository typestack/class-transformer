import { defaultMetadataStorage } from "../storage";
import { TransformFnParams, TransformOptions } from "../interfaces";

/**
 * Defines a custom logic for value transformation.
 *
 * Can be applied to properties only.
 */
export function transform(
  transformFn: (params: TransformFnParams) => any,
  options: TransformOptions = {},
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
