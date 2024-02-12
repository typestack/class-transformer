import { TransformOptions } from '..';
import { TransformFnParams } from './transform-fn-params.interface';

/**
 * This object represents metadata assigned to a property via the @transform decorator.
 */
export interface TransformMetadata {
  target: Function;

  /**
   * The property name this metadata belongs to on the target (property only).
   */
  propertyName: string;

  /**
   * The custom transformation function provided by the user in the @transform decorator.
   */
  transformFn: (params: TransformFnParams) => any;

  /**
   * Options passed to the @transform operator for this property.
   */
  options: TransformOptions;
}
