import { ClassTransformer } from '../ClassTransformer';
import { ClassTransformOptions, ClassConstructor } from '../interfaces';

/**
 * Return the class instance only with the exposed properties.
 *
 * Can be applied to functions and getters/setters only.
 */
export function transformPlainToInstance(
  classType: ClassConstructor<any>,
  params?: ClassTransformOptions
): MethodDecorator {
  return function (target: Record<string, any>, propertyKey: string | Symbol, descriptor: PropertyDescriptor): void {
    const classTransformer: ClassTransformer = new ClassTransformer();
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]): Record<string, any> {
      const result: any = originalMethod.apply(this, args);
      const isPromise =
        !!result && (typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function';
      return isPromise
        ? result.then((data: any) => classTransformer.plainToInstance(classType, data, params))
        : classTransformer.plainToInstance(classType, result, params);
    };
  };
}
