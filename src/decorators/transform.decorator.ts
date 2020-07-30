import { defaultMetadataStorage } from '../storage';
import { TransformOptions } from '../interfaces';
import { TransformationType } from '../enums';

/**
 * Defines a custom logic for value transformation.
 */
export function Transform(
  transformFn: (value: any, obj: any, transformationType: TransformationType) => any,
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
