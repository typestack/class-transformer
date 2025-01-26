/**
 * Possible transformation options for the @Alias decorator.
 */
export interface AliasOptions {
  /**
   * Name of property on the source object to read from
   */
  from?: string;
  /**
   * Name of property on the target object to expose as
   */
  to?: string;
}
