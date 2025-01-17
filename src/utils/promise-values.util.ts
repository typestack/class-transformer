function promisesTracker(value: any, promises: Promise<any>[]) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] instanceof Promise) {
        promises.push(value[i]);
      } else {
        promisesTracker(value, promises);
      }
    }
  }

  if (value instanceof Object) {
    for (const key of Object.keys(value)) {
      if (value[key] instanceof Promise) {
        promises.push(value[key]);
      } else {
        promisesTracker(value[key], promises);
      }
    }
  }

  return value;
}

async function resolvePromises(value: any) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] instanceof Promise) {
        value[i] = await value[i];
      } else {
        value[i] = await resolvePromises(value[i]);
      }
    }
  }

  if (value instanceof Object) {
    for (const key of Object.keys(value)) {
      if (value[key] instanceof Promise) {
        value[key] = await value[key];
      } else {
        value[key] = await resolvePromises(value[key]);
      }
    }
  }

  return value;
}

export async function instanceToPlainAsync(value: any, instanceToPlainMethod: any): Promise<Record<string, any>> {
  const valuesPromises: Promise<any>[] = [];

  promisesTracker(instanceToPlainMethod(value), valuesPromises);
  await Promise.all(valuesPromises);

  return resolvePromises(value);
}
