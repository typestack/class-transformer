import { TransformationType } from '../../enums';

export interface TransformFnParams {
  value: any;
  key: string;
  obj: any;
  type: TransformationType;
}
