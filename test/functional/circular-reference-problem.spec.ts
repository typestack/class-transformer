import 'reflect-metadata';
import { instanceToInstance, instanceToPlain, plainToInstance } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { TransformOperationExecutor } from '../../src/TransformOperationExecutor';

describe('circular reference problem', () => {
  it('should skip circular reference objects in instanceToPlain operation', () => {
    defaultMetadataStorage.clear();

    class Caption {
      text: string;
    }

    class Photo {
      id: number;
      filename: string;
      user: User;
      users: User[];
      caption: Caption;
    }

    class User {
      id: number;
      firstName: string;
      caption: Caption;
      photos: Photo[];
    }

    const photo1 = new Photo();
    photo1.id = 1;
    photo1.filename = 'me.jpg';

    const photo2 = new Photo();
    photo2.id = 2;
    photo2.filename = 'she.jpg';

    const caption = new Caption();
    caption.text = 'cool photo';

    const user = new User();
    user.caption = caption;
    user.firstName = 'Umed Khudoiberdiev';
    user.photos = [photo1, photo2];

    photo1.user = user;
    photo2.user = user;
    photo1.users = [user];
    photo2.users = [user];

    photo1.caption = caption;
    photo2.caption = caption;

    const plainUser = instanceToPlain(user, { enableCircularCheck: true });
    expect(plainUser).toEqual({
      firstName: 'Umed Khudoiberdiev',
      caption: { text: 'cool photo' },
      photos: [
        {
          id: 1,
          filename: 'me.jpg',
          users: [],
          caption: { text: 'cool photo' },
        },
        {
          id: 2,
          filename: 'she.jpg',
          users: [],
          caption: { text: 'cool photo' },
        },
      ],
    });
  });

  it('should not skip circular reference objects, but handle it correctly in instanceToInstance operation', () => {
    defaultMetadataStorage.clear();

    class Photo {
      id: number;
      filename: string;
      user: User;
      users: User[];
    }

    class User {
      id: number;
      firstName: string;
      photos: Photo[];
    }

    const photo1 = new Photo();
    photo1.id = 1;
    photo1.filename = 'me.jpg';

    const photo2 = new Photo();
    photo2.id = 2;
    photo2.filename = 'she.jpg';

    const user = new User();
    user.firstName = 'Umed Khudoiberdiev';
    user.photos = [photo1, photo2];

    photo1.user = user;
    photo2.user = user;
    photo1.users = [user];
    photo2.users = [user];

    const classUser = instanceToInstance(user, { enableCircularCheck: true });
    expect(classUser).not.toBe(user);
    expect(classUser).toBeInstanceOf(User);
    expect(classUser).toEqual(user);
  });

  describe('enableCircularCheck option', () => {
    class Photo {
      id: number;
      filename: string;
    }

    class User {
      id: number;
      firstName: string;
      photos: Photo[];
    }
    let isCircularSpy: jest.SpyInstance;
    const photo1 = new Photo();
    photo1.id = 1;
    photo1.filename = 'me.jpg';

    const user = new User();
    user.firstName = 'Umed Khudoiberdiev';
    user.photos = [photo1];

    beforeEach(() => {
      isCircularSpy = jest.spyOn(TransformOperationExecutor.prototype, 'isCircular' as any);
    });

    afterEach(() => {
      isCircularSpy.mockRestore();
    });

    it('enableCircularCheck option is undefined (default)', () => {
      plainToInstance<User, Record<string, any>>(User, user);
      expect(isCircularSpy).not.toHaveBeenCalled();
    });

    it('enableCircularCheck option is true', () => {
      plainToInstance<User, Record<string, any>>(User, user, { enableCircularCheck: true });
      expect(isCircularSpy).toHaveBeenCalled();
    });
  });
});
