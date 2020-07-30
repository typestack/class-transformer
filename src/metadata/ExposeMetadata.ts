import { ExposeOptions } from '../interfaces';

export class ExposeMetadata {
  constructor(public target: Function, public propertyName: string, public options: ExposeOptions) {}
}
