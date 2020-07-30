import { ExcludeOptions } from '../interfaces';

export class ExcludeMetadata {
  constructor(public target: Function, public propertyName: string, public options: ExcludeOptions) {}
}
