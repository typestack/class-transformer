import 'reflect-metadata';
import { defaultMetadataStorage } from '../../src/storage';
import { Expose } from '../../src/decorators';
import { instanceToPlainAsync } from '../../src/index';

describe('applying a transformation at a class that contains promise value', () => {
  beforeEach(() => defaultMetadataStorage.clear());
  afterEach(() => defaultMetadataStorage.clear());

  it('should resolve the promise value', async () => {
    class User {
      @Expose()
      name: Promise<string> = new Promise(resolve => {
        resolve('Jonathan');
      });
    }

    const plainUser = await instanceToPlainAsync(new User());
    expect(plainUser.name).toEqual('Jonathan');
  });
});
