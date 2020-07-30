import { defaultMetadataStorage } from '../storage';
import { ExposeMetadata } from '../metadata/ExposeMetadata';
import { ExposeOptions } from '../interfaces';

/**
 * Marks property as included in the process of transformation. By default it includes the property for both
 * constructorToPlain and plainToConstructor transformations, however you can specify on which of transformation types
 * you want to skip this property.
 */
export function Expose(options?: ExposeOptions) {
  return function (object: Record<string, any> | Function, propertyName?: string): void {
    const metadata = new ExposeMetadata(
      object instanceof Function ? object : object.constructor,
      propertyName,
      options || {}
    );
    defaultMetadataStorage.addExposeMetadata(metadata);
  };
}
