import 'reflect-metadata';
import { instanceToPlain } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { exclude, expose } from '../../src/decorators';

describe('ignoring specific decorators', () => {
  it('when ignoreDecorators is set to true it should ignore all decorators', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;

      @expose({ name: 'lala' })
      firstName: string;

      @expose({ groups: ['user'] })
      lastName: string;

      @exclude()
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
