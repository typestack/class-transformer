import { ClassTransformOptions } from "../interfaces/class-transform-options.interface";

/**
 * These are the default options used by any transformation operation.
 */
export const defaultOptions: Partial<ClassTransformOptions> = {
  enableCircularCheck: false,
  enableImplicitConversion: false,
  excludeExtraneousValues: false,
  excludePrefixes: undefined,
  exposeDefaultValues: false,
  exposeUnsetFields: true,
  groups: undefined,
  ignoreDecorators: false,
  strategy: undefined,
  targetMaps: undefined,
  version: undefined,
};
