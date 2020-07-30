import { TypeMetadata, ExposeMetadata, ExcludeMetadata, TransformMetadata } from '.';

/**
 * Information assigned to a class property or class (constructor) via decorators.
 */
export interface DecoratorMetaDataBag<T> {
  /**
   * Optional metadata assigned through the @Expose decorator.
   */
  expose: ExposeMetadata[];

  /**
   * Optional metadata assigned through the @Exclude decorator.
   */
  exclude: ExcludeMetadata[];
  /**
   * Optional metadata assigned through the @Transform decorator. This value is always
   * undefined for bags belonging to classes. (The decorator is a `PropertyDecorator`.)
   */
  transform: TransformMetadata | undefined;

  /**
   * Metadata assigned through the @Type decorator. This value is always
   * undefined for bags belonging to classes. (The decorator is a `PropertyDecorator`.)
   */
  type: TypeMetadata<T> | undefined;
}
