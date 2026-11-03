import 'reflect-metadata';
import { defaultMetadataStorage } from '../../src/storage';
import { plainToInstance, Type, instanceToPlain, Transform } from '../../src';

describe('promise field', () => {
  it('should transform plan to class with promise field', async () => {
    defaultMetadataStorage.clear();

    class PromiseClass {
      promise: Promise<string>;
    }

    const plain = {
      promise: Promise.resolve('hi'),
    };

    const instance = plainToInstance(PromiseClass, plain);
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
    const plain = instanceToPlain(instance) as any;
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

    const instance = plainToInstance(PromiseClass, plain);
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

    const instance = plainToInstance(PromiseClass, plain);
    const value = await instance.promise;
    expect(value).toBeInstanceOf(InnerClass);
    expect(value.position).toBe('developer');
  });
});

describe('promise transformation failures', () => {
  it('rejects the transformed promise when a nested transform throws', async () => {
    const failure = new Error('invalid nested value');
    class Child {
      @Transform(() => {
        throw failure;
      })
      value: string;
    }
    class Parent {
      @Type(() => Child)
      child: Promise<Child>;
    }
    const parent = plainToInstance(Parent, { child: Promise.resolve({ value: 'invalid' }) });
    await expect(parent.child).rejects.toBe(failure);
  });
});

it('preserves a rejected input promise', async () => {
  class Parent {
    value: Promise<string>;
  }
  const failure = new Error('failed to load value');
  const parent = plainToInstance(Parent, { value: Promise.reject(failure) });
  await expect(parent.value).rejects.toBe(failure);
});
