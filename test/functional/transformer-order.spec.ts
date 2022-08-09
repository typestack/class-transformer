import 'reflect-metadata';
import { plainToInstance } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { Expose, Transform } from '../../src/decorators';

describe('applying several transformations', () => {
  beforeEach(() => defaultMetadataStorage.clear());
  afterEach(() => defaultMetadataStorage.clear());

  it('should keep the order of the applied decorators after several plainToInstance() calls', () => {
    class User {
      @Transform(() => 'Jonathan')
      @Transform(() => 'John')
      @Expose()
      name: string;
    }

    const firstUser = plainToInstance(User, { name: 'Joe' });
    expect(firstUser.name).toEqual('John');

    // Prior to this pull request [#355](https://github.com/typestack/class-transformer/pull/355)
    // the order of the transformations was reversed after every `plainToInstance()` call
    // So after consecutive calls `User#name` would be "John" - "Jonathan" - "John" - "Jonathan"...
    // This test ensures the last transformation is always the last one to be applied
    const secondUser = plainToInstance(User, { name: 'Joe' });
    expect(secondUser.name).toEqual('John');
  });
});
