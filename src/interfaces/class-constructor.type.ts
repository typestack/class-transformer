export type ClassConstructor<T> = {
  new (...args: any[]): T;
};
