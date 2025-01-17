import { TransformationType } from '../../enums';
import { ClassTransformOptions } from '../class-transformer-options.interface';

export interface TransformFnParams<T extends Record<string, any> = any, K extends keyof T = any> {
  value: T[K];
  key: string;
  obj: T;
  type: TransformationType;
  options: ClassTransformOptions;
}
