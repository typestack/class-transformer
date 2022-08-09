import 'reflect-metadata';
import { instanceToPlain } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { Exclude, Expose } from '../../src/decorators';

describe('ignoring specific decorators', () => {
  it('when ignoreDecorators is set to true it should ignore all decorators', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;

      @Expose({ name: 'lala' })
      firstName: string;

      @Expose({ groups: ['user'] })
      lastName: string;

      @Exclude()
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainedUser = instanceToPlain(user, { ignoreDecorators: true });
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });
});
