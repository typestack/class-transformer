import { TransformationType } from "../../enums";
import { ClassTransformOptions } from "../class-transform-options.interface";

export interface TransformFnParams {
  value: any;
  key: string;
  obj: any;
  type: TransformationType;
  options: ClassTransformOptions;
}
