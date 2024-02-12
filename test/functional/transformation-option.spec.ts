import 'reflect-metadata';
import { instanceToPlain, plainToInstance } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { exclude, expose } from '../../src/decorators';

describe('filtering by transformation option', () => {
  it('@exclude with toPlainOnly set to true then it should be excluded only during instanceToPlain and classToPlainFromExist operations', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;
      lastName: string;

      @exclude({ toPlainOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('@exclude with toClassOnly set to true then it should be excluded only during plainToInstance and plainToClassFromExist operations', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;
      lastName: string;

      @exclude({ toClassOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('@expose with toClassOnly set to true then it should be excluded only during instanceToPlain and classToPlainFromExist operations', () => {
    defaultMetadataStorage.clear();

    @exclude()
    class User {
      @expose()
      firstName: string;

      @expose()
      lastName: string;

      @expose({ toClassOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('@expose with toPlainOnly set to true then it should be excluded only during instanceToPlain and classToPlainFromExist operations', () => {
    defaultMetadataStorage.clear();

    @exclude()
    class User {
      @expose()
      firstName: string;

      @expose()
      lastName: string;

      @expose({ toPlainOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
  });

  it('should ignore undefined properties when exposeUnsetFields is set to false during class to plain', () => {
    defaultMetadataStorage.clear();

    @exclude()
    class User {
      @expose()
      firstName: string;

      @expose()
      lastName: string;
    }

    expect(instanceToPlain(new User(), { exposeUnsetFields: false })).toEqual({});
    expect(instanceToPlain(new User(), { exposeUnsetFields: true })).toEqual({
      firstName: undefined,
      lastName: undefined,
    });

    const classedUser = plainToInstance(User, { exposeUnsetFields: false });
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: undefined,
      lastName: undefined,
    });
  });
});
