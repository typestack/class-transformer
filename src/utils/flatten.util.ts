export function flatten<T>(arrayOfArrays: T[][]): T[] {
  return ([] as T[]).concat.apply([], arrayOfArrays);
}
