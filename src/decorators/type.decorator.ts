import { defaultMetadataStorage } from '../storage';
import { TypeMetadata } from '../metadata/TypeMetadata';
import { TypeHelpOptions, TypeOptions } from '../metadata/ExposeExcludeOptions';

/**
 * Specifies a type of the property.
 * The given TypeFunction can return a constructor. A discriminator can be given in the options.
 */
export function Type(typeFunction?: (type?: TypeHelpOptions) => Function, options: TypeOptions = {}) {
  return function (target: any, key: string): void {
    const type = (Reflect as any).getMetadata('design:type', target, key);
    const metadata = new TypeMetadata(target.constructor, key, type, typeFunction, options);
    defaultMetadataStorage.addTypeMetadata(metadata);
  };
}
