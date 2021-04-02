import { defaultMetadataStorage } from '../storage';
import { AliasOptions } from '../interfaces';

/**
 * Adds an alias (alternative name) to a property.
 * Used for constructorToPlain transformation.
 *
 * Can be applied to properties.
 */
export function Alias(options: AliasOptions = {}): PropertyDecorator & ClassDecorator {
  return function (object: any, propertyName?: string | Symbol): void {
    defaultMetadataStorage.addAliasMetadata({
      target: object instanceof Function ? object : object.constructor,
      propertyName: propertyName as string,
      options,
    });
  };
}
