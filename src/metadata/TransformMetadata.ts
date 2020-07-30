import { TransformOptions } from '../interfaces';
import { TransformationType } from '../enums';

export class TransformMetadata {
  constructor(
    public target: Function,
    public propertyName: string,
    public transformFn: (value: any, obj: any, transformationType: TransformationType) => any,
    public options: TransformOptions
  ) {}
}
