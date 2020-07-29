import { TransformOptions } from './ExposeExcludeOptions';
import { TransformationType } from '../TransformOperationExecutor';

export class TransformMetadata {
  constructor(
    public target: Function,
    public propertyName: string,
    public transformFn: (value: any, obj: any, transformationType: TransformationType) => any,
    public options: TransformOptions
  ) {}
}
