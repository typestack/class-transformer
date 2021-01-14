import 'reflect-metadata';
import { defaultMetadataStorage } from '../../src/storage';
import { plainToClass, Type, classToPlain } from '../../src';

describe('promise field', () => {
  it('should transform plan to class with promise field', async () => {
    defaultMetadataStorage.clear();

    class PromiseClass {
      promise: Promise<string>;
    }

    const plain = {
      promise: Promise.resolve('hi'),
    };

    const instance = plainToClass(PromiseClass, plain);
    expect(instance.promise).toBeInstanceOf(Promise);
    const value = await instance.promise;
    expect(value).toBe('hi');
  });

  it('should transform class with promise field to plain', async () => {
    class PromiseClass {
      promise: Promise<string>;

      constructor(promise: Promise<any>) {
        this.promise = promise;
      }
    }

    const instance = new PromiseClass(Promise.resolve('hi'));
    const plain = classToPlain(instance) as any;
    expect(plain).toHaveProperty('promise');
    const value = await plain.promise;
    expect(value).toBe('hi');
  });

  it('should clone promise result', async () => {
    defaultMetadataStorage.clear();

    class PromiseClass {
      promise: Promise<string[]>;
    }

    const array = ['hi', 'my', 'name'];
    const plain = {
      promise: Promise.resolve(array),
    };

    const instance = plainToClass(PromiseClass, plain);
    const value = await instance.promise;
    expect(value).toEqual(array);

    // modify transformed array to prove it's not referencing original array
    value.push('is');
    expect(value).not.toEqual(array);
  });

  it('should support Type decorator', async () => {
    class PromiseClass {
      @Type(() => InnerClass)
      promise: Promise<InnerClass>;
    }

    class InnerClass {
      position: string;

      constructor(position: string) {
        this.position = position;
      }
    }

    const plain = {
      promise: Promise.resolve(new InnerClass('developer')),
    };

    const instance = plainToClass(PromiseClass, plain);
    const value = await instance.promise;
    expect(value).toBeInstanceOf(InnerClass);
    expect(value.position).toBe('developer');
  });
});
