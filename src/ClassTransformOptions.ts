/**
 * Allows to specify a map of Types in the object without using @Type decorator.
 * This is useful when you have external classes.
 */
export interface TargetMap {

    /**
     * Target which Types are being specified.
     */
    target: Function;

    /**
     * List of properties and their Types.
     */
    properties: { [key: string]: Function };
}

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

    /**
     * If set to true then class transformer will ignore all @Expose and @Exclude decorators and what inside them.
     * This option is useful if you want to kinda clone your object but do not apply decorators affects.
     */
    ignoreDecorators?: boolean;

    /**
     * Target maps allows to set a Types of the transforming object without using @Type decorator.
     * This is useful when you are transforming external classes, or if you already have type metadata for
     * objects and you don't want to set it up again.
     */
    targetMaps?: TargetMap[];


    /**
     * If set to true then class transformer will not perform a circular check.
     * This option is useful when you know for sure that your types can't have a circular dependency. You usually use this option to boost the transform operation.
     */
    skipCircularCheck?: boolean;
}