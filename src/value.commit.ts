import type { IValuePatch } from './value-patch';

export class ValueCommit<ValueType> {
  public readonly patches: Set<IValuePatch<ValueType>> = new Set();

  public constructor(public readonly guard: (value: unknown) => value is ValueType) {}

  public apply<T>(value: T): T {
    if (this.patches.size && this.guard(value)) {
      for (const patch of this.patches) {
        // console.trace('Patching', value, patch);
        patch.apply(value);
      }
    }
    return value;
  }
}
