import 'reflect-metadata';
import { instanceToPlain, plainToInstance } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { Alias } from '../../src/decorators/alias.decorator';

describe('alias functionality', () => {
  it('Tests alias instanceToPlain', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;

      @Alias({ name: 'fn' })
      firstName: string;
    }

    const instance = new User();
    instance.id = 123;
    instance.firstName = 'Alex';

    const plain = instanceToPlain(instance, {
      useAliases: true,
    });

    expect(plain.id).toEqual(123);
    expect(plain.firstName).toEqual(undefined);
    expect(plain.fn).toEqual('Alex');
  });

  it('Tests alias plainToInstance', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;

      @Alias({ name: 'fn' })
      firstName: string;
    }

    const plain = {
      id: 123,
      fn: 'Alex',
    };

    const instance = plainToInstance(User, plain, {
      useAliases: true,
    });

    expect(instance.id).toEqual(123);
    expect(instance.firstName).toEqual('Alex');
  });
});
