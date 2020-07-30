import { defaultMetadataStorage } from '../storage';
import { ExposeOptions } from '../interfaces';

/**
 * Marks property as included in the process of transformation. By default it includes the property for both
 * constructorToPlain and plainToConstructor transformations, however you can specify on which of transformation types
 * you want to skip this property.
 */
export function Expose(options: ExposeOptions = {}) {
  return function (object: Record<string, any> | Function, propertyName: string): void {
    defaultMetadataStorage.addExposeMetadata({
      target: object instanceof Function ? object : object.constructor,
      propertyName,
      options,
    });
  };
}
