import { defaultMetadataStorage } from '../storage';
import { TransformOptions } from '../interfaces';
import { TransformMetadata } from '../metadata/TransformMetadata';
import { TransformationType } from '../enums';

/**
 * Defines a custom logic for value transformation.
 */
export function Transform(
  transformFn: (value: any, obj: any, transformationType: TransformationType) => any,
  options: TransformOptions = {}
) {
  return function (target: any, key: string): void {
    const metadata = new TransformMetadata(target.constructor, key, transformFn, options);
    defaultMetadataStorage.addTransformMetadata(metadata);
  };
}
