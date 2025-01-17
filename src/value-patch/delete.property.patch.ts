import { IValuePatch } from './value.patch.interface';

export class DeletePropertyPatch implements IValuePatch<Record<string, any>> {
  public constructor(public propertyKey: string) {}

  public apply(value: Record<string, any>): void {
    delete value[this.propertyKey];
  }
}
