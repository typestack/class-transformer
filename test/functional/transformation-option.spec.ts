import 'reflect-metadata';
import { instanceToPlain, plainToInstance } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { Exclude, Expose } from '../../src/decorators';

describe('filtering by transformation option', () => {
  it('@Exclude with toPlainOnly set to true then it should be excluded only during instanceToPlain and classToPlainFromExist operations', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;
      lastName: string;

      @Exclude({ toPlainOnly: true })
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

  it('@Exclude with toClassOnly set to true then it should be excluded only during plainToInstance and plainToClassFromExist operations', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;
      lastName: string;

      @Exclude({ toClassOnly: true })
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

  it('@Expose with toClassOnly set to true then it should be excluded only during instanceToPlain and classToPlainFromExist operations', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Expose()
      firstName: string;

      @Expose()
      lastName: string;

      @Expose({ toClassOnly: true })
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

  it('@Expose with toPlainOnly set to true then it should be excluded only during instanceToPlain and classToPlainFromExist operations', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Expose()
      firstName: string;

      @Expose()
      lastName: string;

      @Expose({ toPlainOnly: true })
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

    @Exclude()
    class User {
      @Expose()
      firstName: string;

      @Expose()
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
