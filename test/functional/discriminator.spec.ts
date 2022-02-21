import 'reflect-metadata';
import { Exclude, Expose, instanceToInstance, instanceToPlain, plainToInstance, Transform, Type } from '../../src';
import { defaultMetadataStorage } from '../../src/storage';

function before(strategy: 'expose' | 'exclude') {
  defaultMetadataStorage.clear();
  if (strategy === 'exclude') {
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
      @Transform(({ value }) => value.toUpperCase())
      specialAbility: string;
    }

    class Person {
      @Type(() => Hobby, {
        discriminator: {
          property: '__type',
          subTypes: [
            { value: Sports, name: 'sports' },
            { value: Relaxing, name: 'relax' },
            { value: Programming, name: 'program' },
          ],
        },
      })
      public hobby?: Hobby | Hobby[] | null;

      public name: string;
    }
    return {
      Hobby,
      Sports,
      Relaxing,
      Programming,
      Person,
    } as const;
  } else {
    @Exclude()
    abstract class Hobby {
      @Expose()
      public name: string;
    }

    @Exclude()
    class Sports extends Hobby {
      // Empty
    }

    @Exclude()
    class Relaxing extends Hobby {
      // Empty
    }

    @Exclude()
    class Programming extends Hobby {
      @Expose()
      @Transform(({ value }) => value.toUpperCase())
      specialAbility: string;
    }

    class Person {
      @Expose()
      @Type(() => Hobby, {
        discriminator: {
          property: '__type',
          subTypes: [
            { value: Sports, name: 'sports' },
            { value: Relaxing, name: 'relax' },
            { value: Programming, name: 'program' },
          ],
        },
      })
      public hobby?: Hobby | Hobby[] | null;

      @Expose()
      public name: string;
    }
    return {
      Hobby,
      Sports,
      Relaxing,
      Programming,
      Person,
    } as const;
  }
}

describe('discriminator-based transform: expose-all', () => {
  it('should transform nullish instance fields', () => {
    const { Person } = before('expose');

    const createPlain = () =>
      ({
        name: 'John Doe',
        hobby: null,
      } as const);

    const createClass = () => {
      const person = new Person();
      person.name = 'John Doe';
      person.hobby = null;
      return person;
    };

    const _classToPlain = () => instanceToPlain(createClass());
    const _plainToClass = () => plainToInstance(Person, createPlain());
    const _classToClass = () => instanceToInstance(createClass());

    expect(_classToPlain).not.toThrow();
    expect(_classToPlain()).toStrictEqual(createPlain());

    expect(_plainToClass).not.toThrow();
    expect(_plainToClass()).toBeInstanceOf(Person);
    expect(_plainToClass()).toStrictEqual(createClass());

    expect(_classToClass).not.toThrow();
    expect(_classToClass()).toBeInstanceOf(Person);
    expect(_classToClass()).toStrictEqual(createClass());
  });

  it('should transform array fields with nullish items', () => {
    const { Person } = before('expose');

    const createPlain = () =>
      ({
        name: 'John Doe',
        hobby: [null],
      } as const);

    const createClass = () => {
      const person = new Person();
      person.name = 'John Doe';
      person.hobby = [null];
      return person;
    };

    const _classToPlain = () => instanceToPlain(createClass());
    const _plaintToClass = () => plainToInstance(Person, createPlain());
    const _classToClass = () => instanceToInstance(createClass());

    expect(_classToPlain).not.toThrow();
    expect(_classToPlain()).toStrictEqual(createPlain());

    expect(_plaintToClass).not.toThrow();
    expect(_plaintToClass()).toBeInstanceOf(Person);
    expect(_plaintToClass()).toStrictEqual(createClass());

    expect(_classToClass).not.toThrow();
    expect(_classToClass()).toBeInstanceOf(Person);
    expect(_classToClass()).toStrictEqual(createClass());
  });

  it('should add discriminator to plain fields', () => {
    const { Person, Relaxing, Sports } = before('expose');

    const person1 = new Person();
    person1.name = 'John Doe';
    person1.hobby = new Relaxing();
    person1.hobby.name = 'Books';

    expect(instanceToPlain(person1)).toStrictEqual({
      name: 'John Doe',
      hobby: {
        __type: 'relax',
        name: 'Books',
      },
    });

    const person2 = new Person();
    person2.name = 'Jane Doe';
    person2.hobby = new Sports();
    person2.hobby.name = 'Cycling';

    expect(instanceToPlain(person2)).toStrictEqual({
      name: 'Jane Doe',
      hobby: {
        __type: 'sports',
        name: 'Cycling',
      },
    });
  });

  it('should add discriminator to plain items', () => {
    const { Person, Relaxing, Sports } = before('expose');

    const person1 = new Person();
    person1.name = 'John Doe';
    const hobby1 = new Relaxing();
    hobby1.name = 'Books';
    person1.hobby = [hobby1];

    expect(instanceToPlain(person1)).toStrictEqual({
      name: 'John Doe',
      hobby: [
        {
          __type: 'relax',
          name: 'Books',
        },
      ],
    });

    const person2 = new Person();
    person2.name = 'Jane Doe';
    const hobby2 = new Sports();
    hobby2.name = 'Cycling';
    person2.hobby = [hobby2];

    expect(instanceToPlain(person2)).toStrictEqual({
      name: 'Jane Doe',
      hobby: [
        {
          __type: 'sports',
          name: 'Cycling',
        },
      ],
    });
  });

  it('should not change source object', () => {
    const { Person, Relaxing } = before('expose');

    const createInstance = () => {
      const person = new Person();
      person.name = 'John Doe';
      person.hobby = new Relaxing();
      person.hobby.name = 'Books';
      return person;
    };

    const person = createInstance();
    instanceToPlain(person);
    expect(person).toStrictEqual(createInstance());
  });
});

describe('discriminator-based transform: exclude-all', () => {
  it('should transform nullish instance fields', () => {
    const { Person } = before('expose');

    const createPlain = () =>
      ({
        name: 'John Doe',
        hobby: null,
      } as const);

    const createClass = () => {
      const person = new Person();
      person.name = 'John Doe';
      person.hobby = null;
      return person;
    };

    const _classToPlain = () => instanceToPlain(createClass());
    const _plainToClass = () => plainToInstance(Person, createPlain());
    const _classToClass = () => instanceToInstance(createClass());

    expect(_classToPlain).not.toThrow();
    expect(_classToPlain()).toStrictEqual(createPlain());

    expect(_plainToClass).not.toThrow();
    expect(_plainToClass()).toBeInstanceOf(Person);
    expect(_plainToClass()).toStrictEqual(createClass());

    expect(_classToClass).not.toThrow();
    expect(_classToClass()).toBeInstanceOf(Person);
    expect(_classToClass()).toStrictEqual(createClass());
  });

  it('should transform array fields with nullish items', () => {
    const { Person } = before('expose');

    const createPlain = () =>
      ({
        name: 'John Doe',
        hobby: [null],
      } as const);

    const createClass = () => {
      const person = new Person();
      person.name = 'John Doe';
      person.hobby = [null];
      return person;
    };

    const _classToPlain = () => instanceToPlain(createClass());
    const _plaintToClass = () => plainToInstance(Person, createPlain());
    const _classToClass = () => instanceToInstance(createClass());

    expect(_classToPlain).not.toThrow();
    expect(_classToPlain()).toStrictEqual(createPlain());

    expect(_plaintToClass).not.toThrow();
    expect(_plaintToClass()).toBeInstanceOf(Person);
    expect(_plaintToClass()).toStrictEqual(createClass());

    expect(_classToClass).not.toThrow();
    expect(_classToClass()).toBeInstanceOf(Person);
    expect(_classToClass()).toStrictEqual(createClass());
  });

  it('should add discriminator to plain fields', () => {
    const { Person, Relaxing, Sports } = before('expose');

    const person1 = new Person();
    person1.name = 'John Doe';
    person1.hobby = new Relaxing();
    person1.hobby.name = 'Books';

    expect(instanceToPlain(person1)).toStrictEqual({
      name: 'John Doe',
      hobby: {
        __type: 'relax',
        name: 'Books',
      },
    });

    const person2 = new Person();
    person2.name = 'Jane Doe';
    person2.hobby = new Sports();
    person2.hobby.name = 'Cycling';

    expect(instanceToPlain(person2)).toStrictEqual({
      name: 'Jane Doe',
      hobby: {
        __type: 'sports',
        name: 'Cycling',
      },
    });
  });

  it('should add discriminator to plain items', () => {
    const { Person, Relaxing, Sports } = before('expose');

    const person1 = new Person();
    person1.name = 'John Doe';
    const hobby1 = new Relaxing();
    hobby1.name = 'Books';
    person1.hobby = [hobby1];

    expect(instanceToPlain(person1)).toStrictEqual({
      name: 'John Doe',
      hobby: [
        {
          __type: 'relax',
          name: 'Books',
        },
      ],
    });

    const person2 = new Person();
    person2.name = 'Jane Doe';
    const hobby2 = new Sports();
    hobby2.name = 'Cycling';
    person2.hobby = [hobby2];

    expect(instanceToPlain(person2)).toStrictEqual({
      name: 'Jane Doe',
      hobby: [
        {
          __type: 'sports',
          name: 'Cycling',
        },
      ],
    });
  });

  it('should not change source object', () => {
    const { Person, Relaxing } = before('expose');

    const createInstance = () => {
      const person = new Person();
      person.name = 'John Doe';
      person.hobby = new Relaxing();
      person.hobby.name = 'Books';
      return person;
    };

    const person = createInstance();
    instanceToPlain(person);
    expect(person).toStrictEqual(createInstance());
  });
});
