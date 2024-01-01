export function onlyUnique<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}
