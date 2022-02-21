import { IValuePatch } from './value.patch.interface';

export class AddPropertyPatch implements IValuePatch<Record<string, any>> {
  public constructor(public propertyKey: string, public value: any) {}

  public apply(value: unknown): void {
    value[this.propertyKey] = this.value;
  }
}
