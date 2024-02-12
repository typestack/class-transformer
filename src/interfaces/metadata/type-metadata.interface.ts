import { TypeOptions } from '..';

/**
 * This object represents metadata assigned to a property via the @Nested decorator.
 */
export interface TypeMetadata {
  target: Function;

  /**
   * The property name this metadata belongs to on the target (property only).
   */
  propertyName: string;

  /**
   * The type guessed from assigned Reflect metadata ('design:type')
   */
  reflectedType: any;

  /**
   * The custom function provided by the user in the @Nested decorator which
   * returns the target type for the transformation.
   */
  classConstructor: new (...args: any[]) => any;

  /**
   * Options passed to the @Nested operator for this property.
   */
  options: TypeOptions;
}
