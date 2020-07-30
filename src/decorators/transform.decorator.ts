import { defaultMetadataStorage } from '../storage';
import { TransformOptions } from '../interfaces';
import { TransformationType } from '../enums';

/**
 * Defines a custom logic for value transformation.
 */
export function Transform(
  transformFn: (value: any, obj: any, transformationType: TransformationType) => any,
  options: TransformOptions = {}
) {
  return function (target: any, propertyName: string): void {
    defaultMetadataStorage.addTransformMetadata({
      target: target.constructor,
      propertyName,
      transformFn,
      options,
    });
  };
}
