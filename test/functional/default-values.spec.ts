import { Expose, plainToInstance, Transform } from '../../src';

describe('expose default values', () => {
  class User {
    @Expose({ name: 'AGE' })
    @Transform(({ value }) => parseInt(value, 10))
    age: number;

    @Expose({ name: 'AGE_WITH_DEFAULT' })
    @Transform(({ value }) => parseInt(value, 10))
    ageWithDefault?: number = 18;

    @Expose({ name: 'FIRST_NAME' })
    firstName: string;

    @Expose({ name: 'FIRST_NAME_WITH_DEFAULT' })
    firstNameWithDefault?: string = 'default first name';

    @Transform(({ value }) => !!value)
    admin: boolean;

    @Transform(({ value }) => !!value)
    adminWithDefault?: boolean = false;

    lastName: string;

    lastNameWithDefault?: string = 'default last name';
  }

  it('should set default value if nothing provided', () => {
    const fromPlainUser = {};
    const transformedUser = plainToInstance(User, fromPlainUser, { exposeDefaultValues: true });

    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser).toEqual({
      age: undefined,
      ageWithDefault: 18,
      firstName: undefined,
      firstNameWithDefault: 'default first name',
      adminWithDefault: false,
      lastNameWithDefault: 'default last name',
    });
  });

  it('should take exposed values and ignore defaults', () => {
    const fromPlainUser = {};
    const transformedUser = plainToInstance(User, fromPlainUser);

    expect(transformedUser).toBeInstanceOf(User);
    expect(transformedUser).toEqual({
      age: NaN,
      ageWithDefault: NaN,
      firstName: undefined,
      firstNameWithDefault: undefined,
      adminWithDefault: false,
      lastNameWithDefault: 'default last name',
    });
  });
});
