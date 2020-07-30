import { ClassTransformer } from '../ClassTransformer';
import { ClassTransformOptions } from '../interfaces';

/**
 * Transform the object from class to plain object and return only with the exposed properties.
 */
export function TransformClassToPlain(params?: ClassTransformOptions): Function {
  return function (target: Function, propertyKey: string, descriptor: PropertyDescriptor): void {
    const classTransformer: ClassTransformer = new ClassTransformer();
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]): Record<string, any> {
      const result: any = originalMethod.apply(this, args);
      const isPromise =
        !!result && (typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function';
      return isPromise
        ? result.then((data: any) => classTransformer.classToPlain(data, params))
        : classTransformer.classToPlain(result, params);
    };
  };
}
