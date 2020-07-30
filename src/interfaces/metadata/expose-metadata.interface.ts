import { ExposeOptions } from '..';

/**
 * This object represents metadata assigned to a property via the @Expose decorator.
 */
export interface ExposeMetadata {
  target: Function;

  /**
   * The property name this metadata belongs to on the target (class).
   */
  propertyName: string;

  /**
   * Options passed to the @Expose operator for this property.
   */
  options: ExposeOptions;
}
