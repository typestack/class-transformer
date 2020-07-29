import { ExposeOptions } from './ExposeExcludeOptions';

export class ExposeMetadata {
  constructor(public target: Function, public propertyName: string, public options: ExposeOptions) {}
}
