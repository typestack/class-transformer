import { defaultMetadataStorage } from '../storage';
import { TypeHelpOptions, TypeOptions } from '../interfaces';

/**
 * Specifies a type of the property.
 * The given TypeFunction can return a constructor. A discriminator can be given in the options.
 *
 * Can be applied to properties only.
 */
export function Type(
  typeFunction?: (type?: TypeHelpOptions) => Function,
  options: TypeOptions = {}
): PropertyDecorator {
  return function (target: any, propertyName: string | Symbol): void {
    const reflectedType = (Reflect as any).getMetadata('design:type', target, propertyName);
    defaultMetadataStorage.setMetaData({
      target: target.constructor,
      type: 'type',
      propertyName: propertyName as string,
      reflectedType,
      typeFunction,
      options,
    });
  };
}
