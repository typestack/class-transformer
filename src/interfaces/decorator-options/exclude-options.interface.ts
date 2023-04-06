/**
 * Possible transformation options for the @Exclude decorator.
 */
export interface ExcludeOptions {
  /**
   * Exclude this property only when transforming from plain to class instance.
   */
  toClassOnly?: boolean;

  /**
   * Exclude this property only when transforming from class instance to plain object.
   */
  toPlainOnly?: boolean;
}
