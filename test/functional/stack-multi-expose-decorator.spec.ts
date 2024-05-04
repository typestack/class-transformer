/* eslint-disable @typescript-eslint/naming-convention */
import 'reflect-metadata';
import { instanceToPlain, plainToInstance, Transform, Exclude, Expose } from '../../src';
import { defaultMetadataStorage } from '../../src/storage';

describe('stack multi expose decorator', () => {
  /**
   * test-case for issue #378
   */
  it('handling groups with stacked @Expose decorators', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Expose({ toClassOnly: true, groups: ['create', 'update'] })
      @Expose({ toPlainOnly: true })
      public email?: string;

      @Expose({ toClassOnly: true, groups: ['create', 'update'] })
      @Expose({ toPlainOnly: true })
      public firstName?: string;

      @Expose({ toClassOnly: true, groups: ['create'] })
      @Expose({ toPlainOnly: true })
      public password?: string;
    }

    const plainUser = {
      email: 'email@example.com',
      firstName: 'John',
      password: '12345',
    };
    const instance = plainToInstance(User, plainUser, { groups: ['update'] });
    expect(instance).toEqual({
      firstName: 'John',
      email: 'email@example.com',
    });

    const user = new User();
    user.email = 'email@example.com';
    user.firstName = 'John';
    user.password = '12345';
    const plain = instanceToPlain(user);
    expect(plain).toEqual({
      firstName: 'John',
      password: '12345',
      email: 'email@example.com',
    });
  });

  it('Stacking @Expose decorator with "name" option only on decorator with "toClassOnly" option', () => {
    defaultMetadataStorage.clear();

    class User {
      @Expose({ toClassOnly: true, name: 'inputName' })
      @Expose({ toPlainOnly: true })
      name: string;

      @Expose({ toPlainOnly: true })
      @Expose({ toClassOnly: true, name: 'inputFamily' })
      family: string;
    }

    const plainUser = {
      inputName: 'Mohammad',
      inputFamily: 'Hassani',
    };

    const classedUser = plainToInstance(User, plainUser, { excludeExtraneousValues: true });
    expect(classedUser).toEqual({
      name: 'Mohammad',
      family: 'Hassani',
    });
  });

  it('Stacking @Expose decorator with "name" option only on decorator with "toPlainOnly" option', () => {
    defaultMetadataStorage.clear();

    class User {
      @Expose({ toClassOnly: true })
      @Expose({ toPlainOnly: true, name: 'outputName' })
      name: string;

      @Expose({ toPlainOnly: true, name: 'outputFamily' })
      @Expose({ toClassOnly: true })
      family: string;
    }

    const plainUser = {
      name: 'Hassan',
      family: 'Hosseini',
    };

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser.name).toEqual('Hassan');
    expect(classedUser.family).toEqual('Hosseini');

    const plainedUser = instanceToPlain(classedUser);
    expect(plainedUser).not.toBeInstanceOf(User);
    expect(plainedUser).toEqual({
      outputName: 'Hassan',
      outputFamily: 'Hosseini',
    });
  });

  it('versions should work with stacked @Expose decorators too', () => {
    defaultMetadataStorage.clear();

    class User {
      @Expose({ since: 2, name: 'inputName_since2' })
      @Expose({ until: 1, name: 'inputName_until1' })
      name: string;

      @Expose({ since: 2 })
      @Expose({ since: 0, until: 1 })
      family: string;

      id: number;
    }

    const plainUser = {
      id: 1,
      inputName_until1: 'Mohammad',
      inputName_since2: 'Ahmad',
      family: 'Mohammadi',
    };

    const classedUser1 = plainToInstance(User, plainUser, { version: 0 });
    expect(classedUser1).toBeInstanceOf(User);
    expect(classedUser1.name).toBe('Mohammad');
    expect(classedUser1.family).toBe('Mohammadi');

    const classedUser2 = plainToInstance(User, plainUser, { version: 1 });
    expect(classedUser2).toBeInstanceOf(User);
    expect(classedUser2).not.toHaveProperty('name');
    expect(classedUser2).not.toHaveProperty('family');

    const classedUser3 = plainToInstance(User, plainUser, { version: 2 });
    expect(classedUser3).toBeInstanceOf(User);
    expect(classedUser3.name).toBe('Ahmad');
    expect(classedUser3.family).toBe('Mohammadi');
  });

  it('also, versions and groups work with stacked @Expose decorators', () => {
    defaultMetadataStorage.clear();

    class User {
      @Expose({ toClassOnly: true, groups: ['create', 'update'] })
      @Expose({ toPlainOnly: true })
      firstName: string;

      @Expose({ toClassOnly: true, since: 2, name: 'lastName' })
      @Expose({ toClassOnly: true, since: 1, until: 2, name: 'familyName' })
      @Expose({ toClassOnly: true, until: 1, name: 'surname' })
      @Expose({ toPlainOnly: true })
      lastName: string;

      @Transform(({ value }) => (value ? '*'.repeat(value.length) : value))
      @Expose({ name: 'password', since: 2 })
      @Expose({ name: 'secretKey', toClassOnly: true, since: 1, until: 2, groups: ['create', 'update'] })
      @Expose({ name: 'secretKey', toClassOnly: true, until: 1, groups: ['create'] })
      password: string;

      id: number;
    }

    const plainUser1 = {
      id: 1,
      firstName: 'Mohammad',
      surname: 'Ahmadi',
      password: '12345',
    };

    const classedUser1 = plainToInstance(User, plainUser1, { version: 0, groups: ['update'] });
    expect(classedUser1).toBeInstanceOf(User);
    expect(classedUser1.id).toBe(1);
    expect(classedUser1.firstName).toBe('Mohammad');
    expect(classedUser1.lastName).toBe('Ahmadi');
    expect(classedUser1.password).toBeUndefined();

    const plainUser2 = {
      id: 2,
      firstName: 'Mohammad',
      familyName: 'Ahmadi',
      password: '12345',
    };

    const classedUser2 = plainToInstance(User, plainUser2, { version: 1, groups: ['create'] });
    expect(classedUser2).toBeInstanceOf(User);
    expect(classedUser2.id).toBe(2);
    expect(classedUser2.firstName).toBe('Mohammad');
    expect(classedUser2.lastName).toBe('Ahmadi');
    expect(classedUser2.password).toBeUndefined();

    const plainUser3 = {
      id: 3,
      firstName: 'Mohammad',
      familyName: 'Ahmadi',
      password: '12345',
    };

    const classedUser3 = plainToInstance(User, plainUser3, { version: 2 });
    expect(classedUser3).toBeInstanceOf(User);
    expect(classedUser3.id).toBe(3);
    expect(classedUser3.firstName).toBeUndefined();
    expect(classedUser3.lastName).toBeUndefined();
    expect(classedUser3.password).toBe('*****');
  });

  it('handling wrong "toClassOnly" and "toPlainOnly" options', () => {
    defaultMetadataStorage.clear();

    const plainUser = {
      name: 'Mohammad',
      family: 'Mohammadi',
      gender: 'male',
    };

    expect(() => {
      class User {
        @Expose()
        name: string;

        @Expose({ toClassOnly: true, toPlainOnly: false })
        @Expose({ toClassOnly: false, toPlainOnly: true })
        family: string;

        @Expose({ toClassOnly: true, toPlainOnly: true })
        gender: string;
      }
      plainToInstance(User, plainUser);
    }).not.toThrowError();

    expect(() => {
      class User {
        @Expose({ toClassOnly: false })
        name: string;
      }
      plainToInstance(User, plainUser);
    }).toThrowError();

    expect(() => {
      class User {
        @Expose({ toPlainOnly: false })
        name: string;
      }
      plainToInstance(User, plainUser);
    }).toThrowError();

    expect(() => {
      class User {
        @Expose({ toClassOnly: false, toPlainOnly: false })
        name: string;
      }
      plainToInstance(User, plainUser);
    }).toThrowError();
  });

  it('handling conflict between stacked decorators.', () => {
    defaultMetadataStorage.clear();

    const plainUser = {
      name: 'Mohammad',
      family: 'Mohammadi',
      gender: 'male',
    };

    expect(() => {
      class User {
        @Expose({ since: 2, name: 'firstName' })
        @Expose({ since: 0, until: 2, name: 'name', groups: ['update'] })
        @Expose({ since: 0, until: 1 })
        @Expose({ until: 0, name: 'lastName' })
        name: string;
      }
      plainToInstance(User, plainUser);
    }).not.toThrowError();

    expect(() => {
      class User {
        @Expose()
        @Expose({ until: 0, name: 'lastName' })
        name: string;
      }
      plainToInstance(User, plainUser);
    }).toThrowError();

    expect(() => {
      class User {
        @Expose({ since: 1, until: 2, name: 'lastName' })
        @Expose({ since: 0, until: 2, name: 'firstName' })
        name: string;
      }
      plainToInstance(User, plainUser);
    }).toThrowError();
  });
});
