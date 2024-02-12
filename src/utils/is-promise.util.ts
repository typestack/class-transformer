export function isPromise<T>(p: any): p is Promise<T> {
  return p !== null && typeof p === "object" && typeof p.then === "function";
}
