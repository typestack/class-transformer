import { defaultMetadataStorage } from '../storage';
import { TypeOptions } from '../interfaces';

/**
 * Specifies the type of the nested property.
 * The given class parameter is used by `class-transformer` library
 * to transform plain objects into class instances.
 * A discriminator can be given in the options.
 *
 * Can be applied to properties only.
 * For class properties of primitive types,
 * this decorator is not needed.
 */
export function Nested(classConstructor: new (...args: any[]) => any, options: TypeOptions = {}): PropertyDecorator {
  return function (target: any, propertyName: string | Symbol): void {
    const reflectedType = (Reflect as any).getMetadata('design:type', target, propertyName);
    defaultMetadataStorage.addTypeMetadata({
      target: target.constructor,
      propertyName: propertyName as string,
      reflectedType,
      classConstructor,
      options,
    });
  };
}
