import { AliasOptions } from '..';

/**
 * This object represents metadata assigned to a property via the @Alias decorator.
 */
export interface AliasMetadata {
  target: Function;

  /**
   * The property name this metadata belongs to on the target (only property).
   */
  propertyName: string | undefined;

  /**
   * Options passed to the @Alias operator for this property.
   */
  options: AliasOptions;
}
