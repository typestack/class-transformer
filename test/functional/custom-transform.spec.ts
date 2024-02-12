/* eslint-disable @typescript-eslint/camelcase */
import 'reflect-metadata';
import {
  instanceToInstance,
  instanceToPlain,
  ClassTransformOptions,
  plainToInstance,
  TransformFnParams,
} from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { expose, transform, nested } from '../../src/decorators';
import { TransformationType } from '../../src/enums';

describe('custom transformation decorator', () => {
  it('@expose decorator with "name" option should work with @transform decorator', () => {
    defaultMetadataStorage.clear();

    class User {
      @expose({ name: 'user_name' })
      @transform(({ value }) => value.toUpperCase())
      name: string;
    }

    const plainUser = {
      user_name: 'Johny Cage',
    };

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser.name).toEqual('JOHNY CAGE');
  });

  it('@transform decorator logic should be executed depend of toPlainOnly and toClassOnly set', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      name: string;

      @transform(({ value }) => value.toString(), { toPlainOnly: true })
      @transform(({ value }) => 'custom-transformed', { toClassOnly: true })
      date: Date;
    }

    const plainUser = {
      id: 1,
      name: 'Johny Cage',
      date: new Date().valueOf(),
    };

    const user = new User();
    user.id = 1;
    user.name = 'Johny Cage';
    user.date = new Date();

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser.id).toEqual(1);
    expect(classedUser.name).toEqual('Johny Cage');
    expect(classedUser.date).toBe('custom-transformed');

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).not.toBeInstanceOf(User);
    expect(plainedUser).toEqual({
      id: 1,
      name: 'Johny Cage',
      date: user.date.toString(),
    });
  });

  it('versions and groups should work with @transform decorator too', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      name: string;

      @nested(Date)
      @transform(({ value }) => 'custom-transformed-version-check', { since: 1, until: 2 })
      date: Date;

      @nested(Date)
      @transform(({ value }) => value.toString(), { groups: ['user'] })
      lastVisitDate: Date;
    }

    const plainUser = {
      id: 1,
      name: 'Johny Cage',
      date: new Date().valueOf(),
      lastVisitDate: new Date().valueOf(),
    };

    const classedUser1 = plainToInstance(User, plainUser);
    expect(classedUser1).toBeInstanceOf(User);
    expect(classedUser1.id).toEqual(1);
    expect(classedUser1.name).toEqual('Johny Cage');
    expect(classedUser1.date).toBe('custom-transformed-version-check');

    const classedUser2 = plainToInstance(User, plainUser, { version: 0.5 });
    expect(classedUser2).toBeInstanceOf(User);
    expect(classedUser2.id).toEqual(1);
    expect(classedUser2.name).toEqual('Johny Cage');
    expect(classedUser2.date).toBeInstanceOf(Date);

    const classedUser3 = plainToInstance(User, plainUser, { version: 1 });
    expect(classedUser3).toBeInstanceOf(User);
    expect(classedUser3.id).toEqual(1);
    expect(classedUser3.name).toEqual('Johny Cage');
    expect(classedUser3.date).toBe('custom-transformed-version-check');

    const classedUser4 = plainToInstance(User, plainUser, { version: 2 });
    expect(classedUser4).toBeInstanceOf(User);
    expect(classedUser4.id).toEqual(1);
    expect(classedUser4.name).toEqual('Johny Cage');
    expect(classedUser4.date).toBeInstanceOf(Date);

    const classedUser5 = plainToInstance(User, plainUser, { groups: ['user'] });
    expect(classedUser5).toBeInstanceOf(User);
    expect(classedUser5.id).toEqual(1);
    expect(classedUser5.name).toEqual('Johny Cage');
    expect(classedUser5.lastVisitDate).toEqual(new Date(plainUser.lastVisitDate).toString());
  });

  it('@transform decorator callback should be given correct arguments', () => {
    defaultMetadataStorage.clear();

    let keyArg: string;
    let objArg: any;
    let typeArg: TransformationType;
    let optionsArg: ClassTransformOptions;

    function transformCallback({ value, key, obj, type, options }: TransformFnParams): any {
      keyArg = key;
      objArg = obj;
      typeArg = type;
      optionsArg = options;
      return value;
    }

    class User {
      @transform(transformCallback, { toPlainOnly: true })
      @transform(transformCallback, { toClassOnly: true })
      name: string;
    }

    const plainUser = {
      name: 'Johny Cage',
    };
    const options: ClassTransformOptions = {
      groups: ['user', 'user.email'],
      version: 2,
    };

    plainToInstance(User, plainUser, options);
    expect(keyArg).toBe('name');
    expect(objArg).toEqual(plainUser);
    expect(typeArg).toEqual(TransformationType.PLAIN_TO_CLASS);
    expect(optionsArg.groups).toBe(options.groups);
    expect(optionsArg.version).toBe(options.version);

    const user = new User();
    user.name = 'Johny Cage';
    optionsArg = undefined;

    instanceToPlain(user, options);
    expect(keyArg).toBe('name');
    expect(objArg).toEqual(user);
    expect(typeArg).toEqual(TransformationType.CLASS_TO_PLAIN);
    expect(optionsArg.groups).toBe(options.groups);
    expect(optionsArg.version).toBe(options.version);
  });

  let model: any;
  it('should serialize json into model instance of class Person', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      const json = {
        name: 'John Doe',
        address: {
          street: 'Main Street 25',
          tel: '5454-534-645',
          zip: 10353,
          country: 'West Samoa',
        },
        age: 25,
        hobbies: [
          { type: 'sport', name: 'sailing' },
          { type: 'relax', name: 'reading' },
          { type: 'sport', name: 'jogging' },
          { type: 'relax', name: 'movies' },
        ],
      };
      class Hobby {
        public type: string;
        public name: string;
      }
      class Address {
        public street: string;

        @expose({ name: 'tel' })
        public telephone: string;

        public zip: number;

        public country: string;
      }
      class Person {
        public name: string;

        @nested(Address)
        public address: Address;

        @nested(Hobby)
        @transform(({ value }) => value.filter((hobby: any) => hobby.type === 'sport'), { toClassOnly: true })
        public hobbies: Hobby[];

        public age: number;
      }
      model = plainToInstance(Person, json);
      expect(model instanceof Person);
      expect(model.address instanceof Address);
      model.hobbies.forEach((hobby: Hobby) => expect(hobby instanceof Hobby && hobby.type === 'sport'));
    }).not.toThrow();
  });

  it('should serialize json into model instance of class Person with different possibilities for type of one property (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      const json = {
        name: 'John Doe',
        hobby: { __type: 'program', name: 'typescript coding', specialAbility: 'testing' },
      };

      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [
              { value: Sports, name: 'sports' },
              { value: Relaxing, name: 'relax' },
              { value: Programming, name: 'program' },
            ],
          },
        })
        public hobby: any;
      }

      const expectedHobby = { name: 'typescript coding', specialAbility: 'TESTING' };

      const model: Person = plainToInstance(Person, json);
      expect(model).toBeInstanceOf(Person);
      expect(model.hobby).toBeInstanceOf(Programming);
      expect(model.hobby).not.toHaveProperty('__type');
      expect(model.hobby).toHaveProperty('specialAbility', 'TESTING');
    }).not.toThrow();
  });

  it('should serialize json into model instance of class Person with different types in array (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      const json = {
        name: 'John Doe',
        hobbies: [
          { __type: 'program', name: 'typescript coding', specialAbility: 'testing' },
          { __type: 'relax', name: 'sun' },
        ],
      };

      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [
              { value: Sports, name: 'sports' },
              { value: Relaxing, name: 'relax' },
              { value: Programming, name: 'program' },
            ],
          },
        })
        public hobbies: any[];
      }

      const model: Person = plainToInstance(Person, json);
      expect(model).toBeInstanceOf(Person);
      expect(model.hobbies[0]).toBeInstanceOf(Programming);
      expect(model.hobbies[1]).toBeInstanceOf(Relaxing);
      expect(model.hobbies[0]).not.toHaveProperty('__type');
      expect(model.hobbies[1]).not.toHaveProperty('__type');
      expect(model.hobbies[1]).toHaveProperty('name', 'sun');
      expect(model.hobbies[0]).toHaveProperty('specialAbility', 'TESTING');
    }).not.toThrow();
  });

  it('should serialize json into model instance of class Person with different possibilities for type of one property AND keeps discriminator property (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      const json = {
        name: 'John Doe',
        hobby: { __type: 'program', name: 'typescript coding', specialAbility: 'testing' },
      };

      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [
              { value: Sports, name: 'sports' },
              { value: Relaxing, name: 'relax' },
              { value: Programming, name: 'program' },
            ],
          },
          keepDiscriminatorProperty: true,
        })
        public hobby: any;
      }

      const model: Person = plainToInstance(Person, json);
      expect(model).toBeInstanceOf(Person);
      expect(model.hobby).toBeInstanceOf(Programming);
      expect(model.hobby).toHaveProperty('__type');
      expect(model.hobby).toHaveProperty('specialAbility', 'TESTING');
    }).not.toThrow();
  });

  it('should serialize json into model instance of class Person with different types in array AND keeps discriminator property (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      const json = {
        name: 'John Doe',
        hobbies: [
          { __type: 'program', name: 'typescript coding', specialAbility: 'testing' },
          { __type: 'relax', name: 'sun' },
        ],
      };

      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [
              { value: Sports, name: 'sports' },
              { value: Relaxing, name: 'relax' },
              { value: Programming, name: 'program' },
            ],
          },
          keepDiscriminatorProperty: true,
        })
        public hobbies: any[];
      }

      const model: Person = plainToInstance(Person, json);
      expect(model).toBeInstanceOf(Person);
      expect(model.hobbies[0]).toBeInstanceOf(Programming);
      expect(model.hobbies[1]).toBeInstanceOf(Relaxing);
      expect(model.hobbies[0]).toHaveProperty('__type');
      expect(model.hobbies[1]).toHaveProperty('__type');
      expect(model.hobbies[1]).toHaveProperty('name', 'sun');
      expect(model.hobbies[0]).toHaveProperty('specialAbility', 'TESTING');
    }).not.toThrow();
  });

  it('should deserialize class Person into json with different possibilities for type of one property (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [
              { value: Sports, name: 'sports' },
              { value: Relaxing, name: 'relax' },
              { value: Programming, name: 'program' },
            ],
          },
        })
        public hobby: any;
      }

      const model: Person = new Person();
      const program = new Programming();
      program.name = 'typescript coding';
      program.specialAbility = 'testing';
      model.name = 'John Doe';
      model.hobby = program;
      const json: any = instanceToPlain(model);
      expect(json).not.toBeInstanceOf(Person);
      expect(json.hobby).toHaveProperty('__type', 'program');
    }).not.toThrow();
  });

  it('should deserialize class Person into json with different types in array (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [
              { value: Sports, name: 'sports' },
              { value: Relaxing, name: 'relax' },
              { value: Programming, name: 'program' },
            ],
          },
        })
        public hobbies: any[];
      }

      const model: Person = new Person();
      const sport = new Sports();
      sport.name = 'Football';
      const program = new Programming();
      program.name = 'typescript coding';
      program.specialAbility = 'testing';
      model.name = 'John Doe';
      model.hobbies = [sport, program];
      const json: any = instanceToPlain(model);
      expect(json).not.toBeInstanceOf(Person);
      expect(json.hobbies[0]).toHaveProperty('__type', 'sports');
      expect(json.hobbies[1]).toHaveProperty('__type', 'program');
    }).not.toThrow();
  });

  /**
   * test-case for issue #520
   */
  it('should deserialize undefined union type to undefined', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [
              { value: Sports, name: 'sports' },
              { value: Relaxing, name: 'relax' },
              { value: Programming, name: 'program' },
            ],
          },
        })
        public hobby: Hobby;
      }

      const model: Person = new Person();
      const sport = new Sports();
      sport.name = 'Football';
      const program = new Programming();
      program.name = 'typescript coding';
      program.specialAbility = 'testing';
      model.name = 'John Doe';
      // NOTE: hobby remains undefined
      model.hobby = undefined;
      const json: any = instanceToPlain(model);
      expect(json).not.toBeInstanceOf(Person);
      expect(json.hobby).toBeUndefined();
    }).not.toThrow();
  });

  it('should transform class Person into class OtherPerson with different possibilities for type of one property (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [
              { value: Sports, name: 'sports' },
              { value: Relaxing, name: 'relax' },
              { value: Programming, name: 'program' },
            ],
          },
        })
        public hobby: any;
      }

      const model: Person = new Person();
      const program = new Programming();
      program.name = 'typescript coding';
      program.specialAbility = 'testing';
      model.name = 'John Doe';
      model.hobby = program;
      const person: Person = instanceToInstance(model);
      expect(person).toBeInstanceOf(Person);
      expect(person.hobby).not.toHaveProperty('__type');
    }).not.toThrow();
  });

  it('should transform class Person into class OtherPerson with different types in array (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [
              { value: Sports, name: 'sports' },
              { value: Relaxing, name: 'relax' },
              { value: Programming, name: 'program' },
            ],
          },
        })
        public hobbies: any[];
      }

      const model: Person = new Person();
      const sport = new Sports();
      sport.name = 'Football';
      const program = new Programming();
      program.name = 'typescript coding';
      program.specialAbility = 'testing';
      model.name = 'John Doe';
      model.hobbies = [sport, program];
      const person: Person = instanceToInstance(model);
      expect(person).toBeInstanceOf(Person);
      expect(person.hobbies[0]).not.toHaveProperty('__type');
      expect(person.hobbies[1]).not.toHaveProperty('__type');
    }).not.toThrow();
  });

  it('should serialize json into model instance of class Person with different possibilities for type of one property AND uses default as fallback (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      const json = {
        name: 'John Doe',
        hobby: { __type: 'program', name: 'typescript coding', specialAbility: 'testing' },
      };

      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [],
          },
        })
        public hobby: any;
      }

      const model: Person = plainToInstance(Person, json);
      expect(model).toBeInstanceOf(Person);
      expect(model.hobby).toBeInstanceOf(Hobby);
      expect(model.hobby).not.toHaveProperty('__type');
      expect(model.hobby).toHaveProperty('specialAbility', 'testing');
    }).not.toThrow();
  });

  it('should serialize json into model instance of class Person with different types in array AND uses default as fallback (polymorphism)', () => {
    defaultMetadataStorage.clear();
    expect(() => {
      const json = {
        name: 'John Doe',
        hobbies: [
          { __type: 'program', name: 'typescript coding', specialAbility: 'testing' },
          { __type: 'relax', name: 'sun' },
        ],
      };

      abstract class Hobby {
        public name: string;
      }

      class Sports extends Hobby {
        // Empty
      }

      class Relaxing extends Hobby {
        // Empty
      }

      class Programming extends Hobby {
        @transform(({ value }) => value.toUpperCase())
        specialAbility: string;
      }

      class Person {
        public name: string;

        @nested(Hobby, {
          discriminator: {
            property: '__type',
            subTypes: [],
          },
        })
        public hobbies: any[];
      }

      const model: Person = plainToInstance(Person, json);
      expect(model).toBeInstanceOf(Person);
      expect(model.hobbies[0]).toBeInstanceOf(Hobby);
      expect(model.hobbies[1]).toBeInstanceOf(Hobby);
      expect(model.hobbies[0]).not.toHaveProperty('__type');
      expect(model.hobbies[1]).not.toHaveProperty('__type');
      expect(model.hobbies[1]).toHaveProperty('name', 'sun');
      expect(model.hobbies[0]).toHaveProperty('specialAbility', 'testing');
    }).not.toThrow();
  });

  it('should serialize a model into json', () => {
    expect(() => {
      instanceToPlain(model);
    }).not.toThrow();
  });
});
