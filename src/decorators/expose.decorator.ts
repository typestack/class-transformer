import { defaultMetadataStorage } from '../storage';
import { ExposeOptions } from '../interfaces';

/**
 * Marks the given class or property as included. By default the property is included in both
 * constructorToPlain and plainToConstructor transformations. It can be limited to only one direction
 * via using the `toPlainOnly` or `toClassOnly` option.
 *
 * Can be applied to class definitions and properties.
 */
export function Expose(options: ExposeOptions = {}): PropertyDecorator & ClassDecorator {
  /**
   * NOTE: The `propertyName` property must be marked as optional because
   * this decorator used both as a class and a property decorator and the
   * Typescript compiler will freak out if we make it mandatory as a class
   * decorator only receives one parameter.
   */
  return function (object: any, propertyName?: string | Symbol): void {
    defaultMetadataStorage.addExposeMetadata({
      target: object instanceof Function ? object : object.constructor,
      propertyName: propertyName as string,
      options,
    });
  };
}
