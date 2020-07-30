import { defaultMetadataStorage } from '../storage';
import { ExcludeOptions } from '../interfaces';
import { ExcludeMetadata } from '../metadata/ExcludeMetadata';

/**
 * Marks property as excluded from the process of transformation. By default it excludes the property for both
 * constructorToPlain and plainToConstructor transformations, however you can specify on which of transformation types
 * you want to skip this property.
 */
export function Exclude(options?: ExcludeOptions) {
  return function (object: Record<string, any> | Function, propertyName?: string): void {
    const metadata = new ExcludeMetadata(
      object instanceof Function ? object : object.constructor,
      propertyName,
      options || {}
    );
    defaultMetadataStorage.addExcludeMetadata(metadata);
  };
}
