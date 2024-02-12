import 'reflect-metadata';
import {
  instanceToInstance,
  classToClassFromExist,
  instanceToPlain,
  classToPlainFromExist,
  plainToInstance,
  plainToClassFromExist,
} from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { exclude, expose, nested } from '../../src/decorators';

describe('specifying target maps', () => {
  it('should convert instance of the given object to plain javascript object and should expose all properties since its a default behaviour', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;
      lastName: string;
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const fromExistUser = new User();
    fromExistUser.id = 1;

    const plainUser = instanceToPlain(user);
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });

    const existUser = { id: 1, age: 27 };
    const plainUser2 = classToPlainFromExist(user, existUser);
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      id: 1,
      age: 27,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
    expect(plainUser2).toEqual(existUser);

    const transformedUser = plainToInstance(User, fromPlainUser);
    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
    expect(fromExistTransformedUser).toBeInstanceOf(User);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });

    const classToClassUser = instanceToInstance(user);
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser).not.toBe(user);
    expect(classToClassUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('should exclude all objects marked with @exclude() decorator', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;
      lastName: string;
      @exclude()
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const fromExistUser = new User();
    fromExistUser.id = 1;

    const plainUser: any = instanceToPlain(user);
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
    expect(plainUser.password).toBeUndefined();

    const existUser = { id: 1, age: 27, password: 'yayayaya' };
    const plainUser2 = classToPlainFromExist(user, existUser);
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      id: 1,
      age: 27,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'yayayaya',
    });
    expect(plainUser2).toEqual(existUser);

    const transformedUser = plainToInstance(User, fromPlainUser);
    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
    expect(fromExistTransformedUser).toBeInstanceOf(User);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classToClassUser = instanceToInstance(user);
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser).not.toEqual(user);
    expect(classToClassUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
  });

  it('should exclude all properties from object if whole class is marked with @exclude() decorator', () => {
    defaultMetadataStorage.clear();

    @exclude()
    class User {
      id: number;
      firstName: string;
      lastName: string;
      password: string;
    }

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const fromExistUser = new User();
    fromExistUser.id = 1;

    const plainUser: any = instanceToPlain(user);
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({});
    expect(plainUser.firstName).toBeUndefined();
    expect(plainUser.lastName).toBeUndefined();
    expect(plainUser.password).toBeUndefined();

    const existUser = { id: 1, age: 27 };
    const plainUser2 = classToPlainFromExist(user, existUser);
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      id: 1,
      age: 27,
    });
    expect(plainUser2).toEqual(existUser);

    const transformedUser = plainToInstance(User, fromPlainUser);
    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser).toEqual({});

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
    expect(fromExistTransformedUser).toBeInstanceOf(User);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
    });

    const classToClassUser = instanceToInstance(user);
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser).not.toEqual(user);
    expect(classToClassUser).toEqual({});

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
    });
  });

  it('should exclude all properties from object if whole class is marked with @exclude() decorator, but include properties marked with @expose() decorator', () => {
    defaultMetadataStorage.clear();

    @exclude()
    class User {
      id: number;

      @expose()
      firstName: string;

      @expose()
      lastName: string;

      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const fromExistUser = new User();
    fromExistUser.id = 1;

    const plainUser: any = instanceToPlain(user);
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
    expect(plainUser.password).toBeUndefined();

    const existUser = { id: 1, age: 27 };
    const plainUser2 = classToPlainFromExist(user, existUser);
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      id: 1,
      age: 27,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
    expect(plainUser2).toEqual(existUser);

    const transformedUser = plainToInstance(User, fromPlainUser);
    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
    expect(fromExistTransformedUser).toBeInstanceOf(User);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classToClassUser = instanceToInstance(user);
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser).not.toEqual(user);
    expect(classToClassUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
  });

  it('should exclude all properties from object if its defined via transformation options, but include properties marked with @expose() decorator', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;

      @expose()
      firstName: string;

      @expose()
      lastName: string;

      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const fromExistUser = new User();
    fromExistUser.id = 1;

    const plainUser: any = instanceToPlain(user, { strategy: 'excludeAll' });
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
    expect(plainUser.password).toBeUndefined();

    const existUser = { id: 1, age: 27 };
    const plainUser2 = classToPlainFromExist(user, existUser, { strategy: 'excludeAll' });
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      id: 1,
      age: 27,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
    expect(plainUser2).toEqual(existUser);

    const transformedUser = plainToInstance(User, fromPlainUser, { strategy: 'excludeAll' });
    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser, { strategy: 'excludeAll' });
    expect(fromExistTransformedUser).toBeInstanceOf(User);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classToClassUser = instanceToInstance(user, { strategy: 'excludeAll' });
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser).not.toEqual(user);
    expect(classToClassUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser, { strategy: 'excludeAll' });
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
  });

  it('should expose all properties from object if its defined via transformation options, but exclude properties marked with @exclude() decorator', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;

      @exclude()
      lastName: string;

      @exclude()
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const fromExistUser = new User();
    fromExistUser.id = 1;

    const plainUser: any = instanceToPlain(user, { strategy: 'exposeAll' });
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      firstName: 'Umed',
    });
    expect(plainUser.lastName).toBeUndefined();
    expect(plainUser.password).toBeUndefined();

    const existUser = { id: 1, age: 27 };
    const plainUser2 = classToPlainFromExist(user, existUser, { strategy: 'exposeAll' });
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      id: 1,
      age: 27,
      firstName: 'Umed',
    });
    expect(plainUser2).toEqual(existUser);

    const transformedUser = plainToInstance(User, fromPlainUser, { strategy: 'exposeAll' });
    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser).toEqual({
      firstName: 'Umed',
    });

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser, { strategy: 'exposeAll' });
    expect(fromExistTransformedUser).toBeInstanceOf(User);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
      firstName: 'Umed',
    });

    const classToClassUser = instanceToInstance(user, { strategy: 'exposeAll' });
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser).not.toEqual(user);
    expect(classToClassUser).toEqual({
      firstName: 'Umed',
    });

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser, { strategy: 'exposeAll' });
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
      firstName: 'Umed',
    });
  });

  it('should convert values to specific types if they are set via @nested decorator', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;

      @nested(String)
      firstName: string;

      @nested(String)
      lastName: string;

      @nested(Number)
      password: number;

      @nested(Boolean)
      isActive: boolean;

      @nested(Date)
      registrationDate: Date;

      @nested(String)
      lastVisitDate: string;
    }

    const date = new Date();
    const user = new User();
    user.firstName = 321 as any;
    user.lastName = 123 as any;
    user.password = '123' as any;
    user.isActive = '1' as any;
    user.registrationDate = date.toString() as any;
    user.lastVisitDate = date as any;

    const fromPlainUser = {
      firstName: 321,
      lastName: 123,
      password: '123',
      isActive: '1',
      registrationDate: date.toString(),
      lastVisitDate: date,
    };

    const fromExistUser = new User();
    fromExistUser.id = 1;

    const plainUser: any = instanceToPlain(user, { strategy: 'exposeAll' });
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      firstName: '321',
      lastName: '123',
      password: 123,
      isActive: true,
      registrationDate: new Date(date.toString()),
      lastVisitDate: date.toString(),
    });

    const existUser = { id: 1, age: 27 };
    const plainUser2 = classToPlainFromExist(user, existUser, { strategy: 'exposeAll' });
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      id: 1,
      age: 27,
      firstName: '321',
      lastName: '123',
      password: 123,
      isActive: true,
      registrationDate: new Date(date.toString()),
      lastVisitDate: date.toString(),
    });
    expect(plainUser2).toEqual(existUser);

    const transformedUser = plainToInstance(User, fromPlainUser, { strategy: 'exposeAll' });
    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser).toEqual({
      firstName: '321',
      lastName: '123',
      password: 123,
      isActive: true,
      registrationDate: new Date(date.toString()),
      lastVisitDate: date.toString(),
    });

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser, { strategy: 'exposeAll' });
    expect(fromExistTransformedUser).toBeInstanceOf(User);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
      firstName: '321',
      lastName: '123',
      password: 123,
      isActive: true,
      registrationDate: new Date(date.toString()),
      lastVisitDate: date.toString(),
    });

    const classToClassUser = instanceToInstance(user, { strategy: 'exposeAll' });
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser).not.toEqual(user);
    expect(classToClassUser).toEqual({
      firstName: '321',
      lastName: '123',
      password: 123,
      isActive: true,
      registrationDate: new Date(date.toString()),
      lastVisitDate: date.toString(),
    });

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser, { strategy: 'exposeAll' });
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
      firstName: '321',
      lastName: '123',
      password: 123,
      isActive: true,
      registrationDate: new Date(date.toString()),
      lastVisitDate: date.toString(),
    });
  });

  it('should transform nested objects too and make sure their decorators are used too', () => {
    defaultMetadataStorage.clear();

    class Photo {
      id: number;
      name: string;

      @exclude()
      filename: string;

      uploadDate: Date;
    }

    class User {
      firstName: string;
      lastName: string;

      @exclude()
      password: string;

      photo: Photo; // type should be automatically guessed
    }

    const photo = new Photo();
    photo.id = 1;
    photo.name = 'Me';
    photo.filename = 'iam.jpg';
    photo.uploadDate = new Date();

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';
    user.photo = photo;

    const plainUser: any = instanceToPlain(user, { strategy: 'exposeAll' });
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser.photo).not.toBeInstanceOf(Photo);
    expect(plainUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        name: 'Me',
        uploadDate: photo.uploadDate,
      },
    });
    expect(plainUser.password).toBeUndefined();
    expect(plainUser.photo.filename).toBeUndefined();
    expect(plainUser.photo.uploadDate).toEqual(photo.uploadDate);
    expect(plainUser.photo.uploadDate).not.toBe(photo.uploadDate);

    const existUser = { id: 1, age: 27, photo: { id: 2, description: 'photo' } };
    const plainUser2: any = classToPlainFromExist(user, existUser, { strategy: 'exposeAll' });
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2.photo).not.toBeInstanceOf(Photo);
    expect(plainUser2).toEqual({
      id: 1,
      age: 27,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        name: 'Me',
        uploadDate: photo.uploadDate,
        description: 'photo',
      },
    });
    expect(plainUser2).toEqual(existUser);
    expect(plainUser2.password).toBeUndefined();
    expect(plainUser2.photo.filename).toBeUndefined();
    expect(plainUser2.photo.uploadDate).toEqual(photo.uploadDate);
    expect(plainUser2.photo.uploadDate).not.toBe(photo.uploadDate);
  });

  it('should transform nested objects too and make sure given type is used instead of automatically guessed one', () => {
    defaultMetadataStorage.clear();

    class Photo {
      id: number;
      name: string;

      @exclude()
      filename: string;
    }

    class ExtendedPhoto implements Photo {
      id: number;

      @exclude()
      name: string;

      filename: string;
    }

    class User {
      id: number;
      firstName: string;
      lastName: string;

      @exclude()
      password: string;

      @nested(ExtendedPhoto) // force specific type
      photo: Photo;
    }

    const photo = new Photo();
    photo.id = 1;
    photo.name = 'Me';
    photo.filename = 'iam.jpg';

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';
    user.photo = photo;

    const plainUser: any = instanceToPlain(user);
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        filename: 'iam.jpg',
      },
    });
    expect(plainUser.password).toBeUndefined();
    expect(plainUser.photo.name).toBeUndefined();
  });

  it('should convert given plain object to class instance object', () => {
    defaultMetadataStorage.clear();

    class Photo {
      id: number;
      name: string;

      @exclude()
      filename: string;

      metadata: string;
      uploadDate: Date;
    }

    class User {
      id: number;
      firstName: string;
      lastName: string;

      @exclude()
      password: string;

      @nested(Photo)
      photo: Photo;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';
    user.photo = new Photo();
    user.photo.id = 1;
    user.photo.name = 'Me';
    user.photo.filename = 'iam.jpg';
    user.photo.uploadDate = new Date();

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      photo: {
        id: 1,
        name: 'Me',
        filename: 'iam.jpg',
        uploadDate: new Date(),
      },
    };

    const fromExistUser = new User();
    fromExistUser.id = 1;
    const fromExistPhoto = new Photo();
    fromExistPhoto.metadata = 'taken by Camera';
    fromExistUser.photo = fromExistPhoto;

    const transformedUser = plainToInstance(User, fromPlainUser);
    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser.photo).toBeInstanceOf(Photo);
    expect(transformedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        name: 'Me',
        uploadDate: fromPlainUser.photo.uploadDate,
      },
    });

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
    expect(fromExistTransformedUser).toEqual(fromExistUser);
    expect(fromExistTransformedUser.photo).toEqual(fromExistPhoto);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        name: 'Me',
        metadata: 'taken by Camera',
        uploadDate: fromPlainUser.photo.uploadDate,
      },
    });

    const classToClassUser = instanceToInstance(user);
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser.photo).toBeInstanceOf(Photo);
    expect(classToClassUser).not.toEqual(user);
    expect(classToClassUser).not.toEqual(user.photo);
    expect(classToClassUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        name: 'Me',
        uploadDate: user.photo.uploadDate,
      },
    });

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser.photo).toBeInstanceOf(Photo);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).not.toEqual(user.photo);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        name: 'Me',
        metadata: 'taken by Camera',
        uploadDate: user.photo.uploadDate,
      },
    });
  });

  it('should expose only properties that match given group', () => {
    defaultMetadataStorage.clear();

    class Photo {
      id: number;

      @expose({
        groups: ['user', 'guest'],
      })
      filename: string;

      @expose({
        groups: ['admin'],
      })
      status: number;

      metadata: string;
    }

    class User {
      id: number;
      firstName: string;

      @expose({
        groups: ['user', 'guest'],
      })
      lastName: string;

      @expose({
        groups: ['user'],
      })
      password: string;

      @expose({
        groups: ['admin'],
      })
      isActive: boolean;

      @nested(Photo)
      photo: Photo;

      @expose({
        groups: ['admin'],
      })
      @nested(Photo)
      photos: Photo[];
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';
    user.isActive = false;
    user.photo = new Photo();
    user.photo.id = 1;
    user.photo.filename = 'myphoto.jpg';
    user.photo.status = 1;
    user.photos = [user.photo];

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      isActive: false,
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
        status: 1,
      },
      photos: [
        {
          id: 1,
          filename: 'myphoto.jpg',
          status: 1,
        },
      ],
    };

    const fromExistUser = new User();
    fromExistUser.id = 1;
    fromExistUser.photo = new Photo();
    fromExistUser.photo.metadata = 'taken by Camera';

    const plainUser1: any = instanceToPlain(user);
    expect(plainUser1).not.toBeInstanceOf(User);
    expect(plainUser1).toEqual({
      firstName: 'Umed',
      photo: {
        id: 1,
      },
    });
    expect(plainUser1.lastName).toBeUndefined();
    expect(plainUser1.password).toBeUndefined();
    expect(plainUser1.isActive).toBeUndefined();

    const plainUser2: any = instanceToPlain(user, { groups: ['user'] });
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });
    expect(plainUser2.isActive).toBeUndefined();

    const transformedUser2 = plainToInstance(User, fromPlainUser, { groups: ['user'] });
    expect(transformedUser2).toBeInstanceOf(User);
    expect(transformedUser2.photo).toBeInstanceOf(Photo);
    expect(transformedUser2).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });

    const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser, { groups: ['user'] });
    expect(fromExistTransformedUser).toEqual(fromExistUser);
    expect(fromExistTransformedUser.photo).toEqual(fromExistUser.photo);
    expect(fromExistTransformedUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      photo: {
        id: 1,
        metadata: 'taken by Camera',
        filename: 'myphoto.jpg',
      },
    });

    const classToClassUser = instanceToInstance(user, { groups: ['user'] });
    expect(classToClassUser).toBeInstanceOf(User);
    expect(classToClassUser.photo).toBeInstanceOf(Photo);
    expect(classToClassUser).not.toEqual(user);
    expect(classToClassUser).not.toEqual(user.photo);
    expect(classToClassUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });

    const classToClassFromExistUser = classToClassFromExist(user, fromExistUser, { groups: ['user'] });
    expect(classToClassFromExistUser).toBeInstanceOf(User);
    expect(classToClassFromExistUser.photo).toBeInstanceOf(Photo);
    expect(classToClassFromExistUser).not.toEqual(user);
    expect(classToClassFromExistUser).not.toEqual(user.photo);
    expect(classToClassFromExistUser).toEqual(fromExistUser);
    expect(classToClassFromExistUser).toEqual({
      id: 1,
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      photo: {
        id: 1,
        metadata: 'taken by Camera',
        filename: 'myphoto.jpg',
      },
    });

    const plainUser3: any = instanceToPlain(user, { groups: ['guest'] });
    expect(plainUser3).not.toBeInstanceOf(User);
    expect(plainUser3).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });
    expect(plainUser3.password).toBeUndefined();
    expect(plainUser3.isActive).toBeUndefined();

    const transformedUser3 = plainToInstance(User, fromPlainUser, { groups: ['guest'] });
    expect(transformedUser3).toBeInstanceOf(User);
    expect(transformedUser3.photo).toBeInstanceOf(Photo);
    expect(transformedUser3).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });

    const plainUser4: any = instanceToPlain(user, { groups: ['admin'] });
    expect(plainUser4).not.toBeInstanceOf(User);
    expect(plainUser4).toEqual({
      firstName: 'Umed',
      isActive: false,
      photo: {
        id: 1,
        status: 1,
      },
      photos: [
        {
          id: 1,
          status: 1,
        },
      ],
    });
    expect(plainUser4.lastName).toBeUndefined();
    expect(plainUser4.password).toBeUndefined();

    const transformedUser4 = plainToInstance(User, fromPlainUser, { groups: ['admin'] });
    expect(transformedUser4).toBeInstanceOf(User);
    expect(transformedUser4.photo).toBeInstanceOf(Photo);
    expect(transformedUser4.photos[0]).toBeInstanceOf(Photo);
    expect(transformedUser4).toEqual({
      firstName: 'Umed',
      isActive: false,
      photo: {
        id: 1,
        status: 1,
      },
      photos: [
        {
          id: 1,
          status: 1,
        },
      ],
    });

    const plainUser5: any = instanceToPlain(user, { groups: ['admin', 'user'] });
    expect(plainUser5).not.toBeInstanceOf(User);
    expect(plainUser5).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      isActive: false,
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
        status: 1,
      },
      photos: [
        {
          id: 1,
          filename: 'myphoto.jpg',
          status: 1,
        },
      ],
    });

    const transformedUser5 = plainToInstance(User, fromPlainUser, { groups: ['admin', 'user'] });
    expect(transformedUser5).toBeInstanceOf(User);
    expect(transformedUser5).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      isActive: false,
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
        status: 1,
      },
      photos: [
        {
          id: 1,
          filename: 'myphoto.jpg',
          status: 1,
        },
      ],
    });
  });

  it('should expose only properties that match given version', () => {
    defaultMetadataStorage.clear();

    class Photo {
      id: number;

      @expose({
        since: 1.5,
        until: 2,
      })
      filename: string;

      @expose({
        since: 2,
      })
      status: number;
    }

    class User {
      @expose({
        since: 1,
        until: 2,
      })
      firstName: string;

      @expose({
        since: 0.5,
      })
      lastName: string;

      @exclude()
      password: string;

      @nested(Photo)
      photo: Photo;

      @expose({
        since: 3,
      })
      @nested(Photo)
      photos: Photo[];
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';
    user.photo = new Photo();
    user.photo.id = 1;
    user.photo.filename = 'myphoto.jpg';
    user.photo.status = 1;
    user.photos = [user.photo];

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
        status: 1,
      },
      photos: [
        {
          id: 1,
          filename: 'myphoto.jpg',
          status: 1,
        },
      ],
    };

    const plainUser1: any = instanceToPlain(user);
    expect(plainUser1).not.toBeInstanceOf(User);
    expect(plainUser1).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
        status: 1,
      },
      photos: [
        {
          id: 1,
          filename: 'myphoto.jpg',
          status: 1,
        },
      ],
    });

    const transformedUser1 = plainToInstance(User, fromPlainUser);
    expect(transformedUser1).toBeInstanceOf(User);
    expect(transformedUser1.photo).toBeInstanceOf(Photo);
    expect(transformedUser1.photos[0]).toBeInstanceOf(Photo);
    expect(transformedUser1).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
        status: 1,
      },
      photos: [
        {
          id: 1,
          filename: 'myphoto.jpg',
          status: 1,
        },
      ],
    });

    const plainUser2: any = instanceToPlain(user, { version: 0.3 });
    expect(plainUser2).not.toBeInstanceOf(User);
    expect(plainUser2).toEqual({
      photo: {
        id: 1,
      },
    });

    const transformedUser2 = plainToInstance(User, fromPlainUser, { version: 0.3 });
    expect(transformedUser2).toBeInstanceOf(User);
    expect(transformedUser2.photo).toBeInstanceOf(Photo);
    expect(transformedUser2).toEqual({
      photo: {
        id: 1,
      },
    });

    const plainUser3: any = instanceToPlain(user, { version: 0.5 });
    expect(plainUser3).not.toBeInstanceOf(User);
    expect(plainUser3).toEqual({
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
      },
    });

    const transformedUser3 = plainToInstance(User, fromPlainUser, { version: 0.5 });
    expect(transformedUser3).toBeInstanceOf(User);
    expect(transformedUser3.photo).toBeInstanceOf(Photo);
    expect(transformedUser3).toEqual({
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
      },
    });

    const plainUser4: any = instanceToPlain(user, { version: 1 });
    expect(plainUser4).not.toBeInstanceOf(User);
    expect(plainUser4).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
      },
    });

    const transformedUser4 = plainToInstance(User, fromPlainUser, { version: 1 });
    expect(transformedUser4).toBeInstanceOf(User);
    expect(transformedUser4.photo).toBeInstanceOf(Photo);
    expect(transformedUser4).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
      },
    });

    const plainUser5: any = instanceToPlain(user, { version: 1.5 });
    expect(plainUser5).not.toBeInstanceOf(User);
    expect(plainUser5).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });

    const transformedUser5 = plainToInstance(User, fromPlainUser, { version: 1.5 });
    expect(transformedUser5).toBeInstanceOf(User);
    expect(transformedUser5.photo).toBeInstanceOf(Photo);
    expect(transformedUser5).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        filename: 'myphoto.jpg',
      },
    });

    const plainUser6: any = instanceToPlain(user, { version: 2 });
    expect(plainUser6).not.toBeInstanceOf(User);
    expect(plainUser6).toEqual({
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        status: 1,
      },
    });

    const transformedUser6 = plainToInstance(User, fromPlainUser, { version: 2 });
    expect(transformedUser6).toBeInstanceOf(User);
    expect(transformedUser6.photo).toBeInstanceOf(Photo);
    expect(transformedUser6).toEqual({
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        status: 1,
      },
    });

    const plainUser7: any = instanceToPlain(user, { version: 3 });
    expect(plainUser7).not.toBeInstanceOf(User);
    expect(plainUser7).toEqual({
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        status: 1,
      },
      photos: [
        {
          id: 1,
          status: 1,
        },
      ],
    });

    const transformedUser7 = plainToInstance(User, fromPlainUser, { version: 3 });
    expect(transformedUser7).toBeInstanceOf(User);
    expect(transformedUser7.photo).toBeInstanceOf(Photo);
    expect(transformedUser7.photos[0]).toBeInstanceOf(Photo);
    expect(transformedUser7).toEqual({
      lastName: 'Khudoiberdiev',
      photo: {
        id: 1,
        status: 1,
      },
      photos: [
        {
          id: 1,
          status: 1,
        },
      ],
    });
  });

  it('should expose method and accessors that have @expose()', () => {
    defaultMetadataStorage.clear();

    class User {
      firstName: string;
      lastName: string;

      @exclude()
      password: string;

      @expose()
      get name(): string {
        return this.firstName + ' ' + this.lastName;
      }

      @expose()
      getName(): string {
        return this.firstName + ' ' + this.lastName;
      }
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const fromPlainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const plainUser: any = instanceToPlain(user);
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      name: 'Umed Khudoiberdiev',
      getName: 'Umed Khudoiberdiev',
    });

    const transformedUser = plainToInstance(User, fromPlainUser);
    expect(transformedUser).toBeInstanceOf(User);
    const likeUser = new User();
    likeUser.firstName = 'Umed';
    likeUser.lastName = 'Khudoiberdiev';
    expect(transformedUser).toEqual(likeUser);
  });

  it('should expose with alternative name if its given', () => {
    defaultMetadataStorage.clear();

    class User {
      @expose({ name: 'myName' })
      firstName: string;

      @expose({ name: 'secondName' })
      lastName: string;

      @exclude()
      password: string;

      @expose()
      get name(): string {
        return this.firstName + ' ' + this.lastName;
      }

      @expose({ name: 'fullName' })
      getName(): string {
        return this.firstName + ' ' + this.lastName;
      }
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const fromPlainUser = {
      myName: 'Umed',
      secondName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const plainUser: any = instanceToPlain(user);
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      myName: 'Umed',
      secondName: 'Khudoiberdiev',
      name: 'Umed Khudoiberdiev',
      fullName: 'Umed Khudoiberdiev',
    });

    const transformedUser = plainToInstance(User, fromPlainUser);
    expect(transformedUser).toBeInstanceOf(User);
    const likeUser = new User();
    likeUser.firstName = 'Umed';
    likeUser.lastName = 'Khudoiberdiev';
    expect(transformedUser).toEqual(likeUser);
  });

  it('should exclude all prefixed properties if prefix is given', () => {
    defaultMetadataStorage.clear();

    class Photo {
      id: number;
      $filename: string;
      status: number;
    }

    class User {
      $system: string;
      _firstName: string;
      _lastName: string;

      @exclude()
      password: string;

      @nested(Photo)
      photo: Photo;

      @expose()
      get name(): string {
        return this._firstName + ' ' + this._lastName;
      }
    }

    const user = new User();
    user.$system = '@#$%^&*token(*&^%$#@!';
    user._firstName = 'Umed';
    user._lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';
    user.photo = new Photo();
    user.photo.id = 1;
    user.photo.$filename = 'myphoto.jpg';
    user.photo.status = 1;

    const fromPlainUser = {
      $system: '@#$%^&*token(*&^%$#@!',
      _firstName: 'Khudoiberdiev',
      _lastName: 'imnosuperman',
      password: 'imnosuperman',
      photo: {
        id: 1,
        $filename: 'myphoto.jpg',
        status: 1,
      },
    };

    const plainUser: any = instanceToPlain(user, { excludePrefixes: ['_', '$'] });
    expect(plainUser).not.toBeInstanceOf(User);
    expect(plainUser).toEqual({
      name: 'Umed Khudoiberdiev',
      photo: {
        id: 1,
        status: 1,
      },
    });

    const transformedUser = plainToInstance(User, fromPlainUser, { excludePrefixes: ['_', '$'] });
    expect(transformedUser).toBeInstanceOf(User);
    const likeUser = new User();
    likeUser.photo = new Photo();
    likeUser.photo.id = 1;
    likeUser.photo.status = 1;
    expect(transformedUser).toEqual(likeUser);
  });

  it('should be able to transform array too', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;
      lastName: string;

      @exclude()
      password: string;

      @expose()
      get name(): string {
        return this.firstName + ' ' + this.lastName;
      }
    }

    const user1 = new User();
    user1.firstName = 'Umed';
    user1.lastName = 'Khudoiberdiev';
    user1.password = 'imnosuperman';

    const user2 = new User();
    user2.firstName = 'Dima';
    user2.lastName = 'Zotov';
    user2.password = 'imnomesser';

    const users = [user1, user2];

    const plainUsers: any = instanceToPlain(users);
    expect(plainUsers).toEqual([
      {
        firstName: 'Umed',
        lastName: 'Khudoiberdiev',
        name: 'Umed Khudoiberdiev',
      },
      {
        firstName: 'Dima',
        lastName: 'Zotov',
        name: 'Dima Zotov',
      },
    ]);

    const fromPlainUsers = [
      {
        firstName: 'Umed',
        lastName: 'Khudoiberdiev',
        name: 'Umed Khudoiberdiev',
      },
      {
        firstName: 'Dima',
        lastName: 'Zotov',
        name: 'Dima Zotov',
      },
    ];

    const existUsers = [
      { id: 1, age: 27 },
      { id: 2, age: 30 },
    ];
    const plainUser2 = classToPlainFromExist(users, existUsers);
    expect(plainUser2).toEqual([
      {
        id: 1,
        age: 27,
        firstName: 'Umed',
        lastName: 'Khudoiberdiev',
        name: 'Umed Khudoiberdiev',
      },
      {
        id: 2,
        age: 30,
        firstName: 'Dima',
        lastName: 'Zotov',
        name: 'Dima Zotov',
      },
    ]);

    const transformedUser = plainToInstance(User, fromPlainUsers);

    expect(transformedUser[0]).toBeInstanceOf(User);
    expect(transformedUser[1]).toBeInstanceOf(User);
    const likeUser1 = new User();
    likeUser1.firstName = 'Umed';
    likeUser1.lastName = 'Khudoiberdiev';

    const likeUser2 = new User();
    likeUser2.firstName = 'Dima';
    likeUser2.lastName = 'Zotov';
    expect(transformedUser).toEqual([likeUser1, likeUser2]);

    const classToClassUsers = instanceToInstance(users);
    expect(classToClassUsers[0]).toBeInstanceOf(User);
    expect(classToClassUsers[1]).toBeInstanceOf(User);
    expect(classToClassUsers[0]).not.toEqual(user1);
    expect(classToClassUsers[1]).not.toEqual(user1);

    const classUserLike1 = new User();
    classUserLike1.firstName = 'Umed';
    classUserLike1.lastName = 'Khudoiberdiev';

    const classUserLike2 = new User();
    classUserLike2.firstName = 'Dima';
    classUserLike2.lastName = 'Zotov';

    expect(classToClassUsers).toEqual([classUserLike1, classUserLike2]);

    const fromExistUser1 = new User();
    fromExistUser1.id = 1;

    const fromExistUser2 = new User();
    fromExistUser2.id = 2;

    const fromExistUsers = [fromExistUser1, fromExistUser2];

    const classToClassFromExistUser = classToClassFromExist(users, fromExistUsers);
    expect(classToClassFromExistUser[0]).toBeInstanceOf(User);
    expect(classToClassFromExistUser[1]).toBeInstanceOf(User);
    expect(classToClassFromExistUser[0]).not.toEqual(user1);
    expect(classToClassFromExistUser[1]).not.toEqual(user1);
    expect(classToClassFromExistUser).toEqual(fromExistUsers);

    const fromExistUserLike1 = new User();
    fromExistUserLike1.id = 1;
    fromExistUserLike1.firstName = 'Umed';
    fromExistUserLike1.lastName = 'Khudoiberdiev';

    const fromExistUserLike2 = new User();
    fromExistUserLike2.id = 2;
    fromExistUserLike2.firstName = 'Dima';
    fromExistUserLike2.lastName = 'Zotov';

    expect(classToClassFromExistUser).toEqual([fromExistUserLike1, fromExistUserLike2]);
  });
});
