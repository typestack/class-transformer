import { defaultMetadataStorage } from '../storage';
import { TypeHelpOptions, TypeOptions } from '../interfaces';

/**
 * Specifies a type of the property.
 * The given TypeFunction can return a constructor. A discriminator can be given in the options.
 */
export function Type(typeFunction?: (type?: TypeHelpOptions) => Function, options: TypeOptions = {}) {
  return function (target: any, propertyName: string): void {
    const reflectedType = (Reflect as any).getMetadata('design:type', target, propertyName);
    defaultMetadataStorage.addTypeMetadata({
      target: target.constructor,
      propertyName,
      reflectedType,
      typeFunction,
      options,
    });
  };
}
