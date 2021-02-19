import { ClassConstructor, DecoratorMetaDataBag } from '.';

/**
 * This object stores all the metadata collected from a class definition.
 */
export interface ClassDescriptor<T> {
  /**
   * The constructor of the given class.
   */
  classCtr: ClassConstructor<T>;

  /**
   * Metadata assigned directly to the class.
   */
  classMetadata: DecoratorMetaDataBag<T>;

  /**
   * Metadata collected from the properties of the class.
   */
  propertyMetadata: {
    [propertyName: string]: DecoratorMetaDataBag<T>;
  };
}
