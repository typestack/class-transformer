import 'reflect-metadata';
import { classToPlain, plainToClass } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { Exclude, Expose } from '../../src/decorators';

describe('filtering by transformation option', () => {
  it('@Exclude with toPlainOnly set to true then it should be excluded only during classToPlain and classToPlainFromExist operations', () => {
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

    const plainedUser = classToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classedUser = plainToClass(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('@Exclude with toClassOnly set to true then it should be excluded only during plainToClass and plainToClassFromExist operations', () => {
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

    const classedUser = plainToClass(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const plainedUser = classToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('@Expose with toClassOnly set to true then it should be excluded only during classToPlain and classToPlainFromExist operations', () => {
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

    const plainedUser = classToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classedUser = plainToClass(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('@Expose with toPlainOnly set to true then it should be excluded only during classToPlain and classToPlainFromExist operations', () => {
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

    const plainedUser = classToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });

    const classedUser = plainToClass(User, plainUser);
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

    expect(classToPlain(new User(), { exposeUnsetFields: false })).toEqual({});
    expect(classToPlain(new User(), { exposeUnsetFields: true })).toEqual({
      firstName: undefined,
      lastName: undefined,
    });

    const classedUser = plainToClass(User, { exposeUnsetFields: false });
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: undefined,
      lastName: undefined,
    });
  });
});
