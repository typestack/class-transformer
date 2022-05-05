import 'reflect-metadata';
import { instanceToPlain, plainToInstance } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { Alias, Exclude, Expose } from '../../src/decorators';

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

  it('@Expose with toClassOnly set to true and a name then it should be exposed renamed when transformed to instance', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Expose()
      firstName: string;

      @Expose()
      lastName: string;

      @Expose({ name: 'pwd', toClassOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      pwd: 'imnosuperman',
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

  it('@Expose with toPlainOnly set to true and a name then it should be exposed renamed when transformed to plain', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Expose()
      firstName: string;

      @Expose()
      lastName: string;

      @Expose({ name: 'pwd', toPlainOnly: true })
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
      pwd: 'imnosuperman',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
  });

  it('@Expose with toPlainOnly set to true and a name plus another @Expose with toClassOnly set to true and a name then it should be renamed appropriatly based on operation type', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Expose()
      firstName: string;

      @Expose()
      lastName: string;

      @Expose({ toPlainOnly: true })
      @Expose({ name: 'toClassPassword', toClassOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      toClassPassword: 'imnosuperman',
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
      password: 'imnosuperman',
    });
  });

  it('@Alias with className only should only rename property when converted to plain', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Alias({ to: 'first_name' })
      firstName: string;
    }

    const user = new User();
    user.firstName = 'Umed';

    const plainUser = {
      firstName: 'Umed',
      first_name: 'WRONG',
    };

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      first_name: 'Umed',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
    });
  });

  it('@Alias with className only should only rename property when converted to plain', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Alias({ from: 'first_name' })
      firstName: string;
    }

    const user = new User();
    user.firstName = 'Umed';

    const plainUser = {
      first_name: 'Umed',
      firstName: 'WRONG',
    };

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
    });
  });

  it('@Alias with both className and plainName should rename property on transform', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Alias({ from: 'user_reference', to: 'userReference' })
      reference: string;
    }

    const user = new User();
    user.reference = 'userRef';

    const plainUser = {
      user_reference: 'userRef',
      userReference: 'WRONG',
      reference: 'WRONG',
    };

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      userReference: 'userRef',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      reference: 'userRef',
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
