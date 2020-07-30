import { TypeHelpOptions, TypeOptions } from '../interfaces';

export class TypeMetadata {
  constructor(
    public target: Function,
    public propertyName: string,
    public reflectedType: any,
    public typeFunction: (options?: TypeHelpOptions) => Function,
    public options: TypeOptions
  ) {}
}
