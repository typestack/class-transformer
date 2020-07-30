import { defaultMetadataStorage } from '../storage';
import { ExcludeOptions } from '../interfaces';

/**
 * Marks property as excluded from the process of transformation. By default it excludes the property for both
 * constructorToPlain and plainToConstructor transformations, however you can specify on which of transformation types
 * you want to skip this property.
 */
export function Exclude(options: ExcludeOptions = {}): PropertyDecorator & ClassDecorator {
  /**
   * NOTE: The `propertyName` property must be marked as optional because
   * this decorator used both as a class and a property decorator and the
   * Typescript compiler will freak out if we make it mandatory as a class
   * decorator only receives one parameter.
   */
  return function (object: Record<string, any> | Function, propertyName?: string | Symbol): void {
    defaultMetadataStorage.addExcludeMetadata({
      target: object instanceof Function ? object : object.constructor,
      propertyName: propertyName as string,
      options,
    });
  };
}
