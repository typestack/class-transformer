import { instanceToPlain } from '..';

class FutureValue<T> {
  constructor(private promise: Promise<T>) {}

  public async getValue(): Promise<T> {
    return await this.promise;
  }
}

function futureValuesWrapper(value: any, promises: Promise<any>[]) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] instanceof Promise) {
        promises.push(value[i]);
        value[i] = new FutureValue(value[i]);
      } else {
        value[i] = futureValuesWrapper(value[i], promises);
      }
    }
  }

  if (value instanceof Object) {
    for (const key of Object.keys(value)) {
      if (value[key] instanceof Promise) {
        promises.push(value[key]);
        value[key] = new FutureValue(value[key]);
      } else {
        value[key] = futureValuesWrapper(value[key], promises);
      }
    }
  }

  return value;
}

async function futureValuesUnwrapper(value: any) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] instanceof FutureValue) {
        value[i] = await value[i].getValue();
      } else {
        value[i] = await futureValuesUnwrapper(value[i]);
      }
    }
  }

  if (value instanceof Object) {
    for (const key of Object.keys(value)) {
      if (value[key] instanceof FutureValue) {
        value[key] = await value[key].getValue();
      } else {
        value[key] = await futureValuesUnwrapper(value[key]);
      }
    }
  }

  return value;
}

export async function instanceToPlainAsync(valuex: any): Promise<Record<string, any>> {
  const valuesPromises: Promise<any>[] = [];

  const futureValues = futureValuesWrapper(instanceToPlain(valuex), valuesPromises);
  await Promise.all(valuesPromises);

  return futureValuesUnwrapper(futureValues);
}
