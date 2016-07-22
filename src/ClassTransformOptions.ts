/**
 * Options to be passed during transformation.
 */
export interface ClassTransformOptions {

    /**
     * Exclusion strategy. By default exposeAll is used, which means that it will expose all properties are transformed
     * by default.
     */
    strategy?: "excludeAll"|"exposeAll";

    /**
     * Only properties with given groups gonna be transformed.
     */
    groups?: string[];

    /**
     * Only properties with "since" > version < "until" gonna be transformed.
     */
    version?: number;

    /**
     * Excludes properties with the given prefixes. For example, if you mark your private properties with "_" and "__"
     * you can set this option's value to ["_", "__"] and all private properties will be skipped.
     * This works only for "exposeAll" strategy.
     */
    excludePrefixes?: string[];

}