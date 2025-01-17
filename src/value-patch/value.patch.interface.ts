export interface IValuePatch<ValueType> {
  apply(value: ValueType): void;
}
