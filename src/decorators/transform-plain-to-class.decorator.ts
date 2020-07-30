import { ClassTransformer } from '../ClassTransformer';
import { ClassTransformOptions } from '../ClassTransformOptions';
import { ClassConstructor } from '../interfaces';

/**
 * Return the class instance only with the exposed properties.
 */
export function TransformPlainToClass<T = unknown>(
  classType: ClassConstructor<T>,
  params?: ClassTransformOptions
): Function {
  return function (target: Function, propertyKey: string, descriptor: PropertyDescriptor): void {
    const classTransformer: ClassTransformer = new ClassTransformer();
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]): Record<string, any> {
      const result: any = originalMethod.apply(this, args);
      const isPromise =
        !!result && (typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function';
      return isPromise
        ? result.then((data: any) => classTransformer.plainToClass(classType, data, params))
        : classTransformer.plainToClass(classType, result, params);
    };
  };
}
