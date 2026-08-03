import { plainToClass, plainToInstance } from '../../src';

class User {
  name: string;
}

describe('readonly array overloads', () => {
  it('returns an array type for readonly input arrays', () => {
    const rawUsers: readonly { name: string }[] = [{ name: 'Bob' }];

    const usersFromInstance: User[] = plainToInstance(User, rawUsers);
    const usersFromClass: User[] = plainToClass(User, rawUsers);

    expect(usersFromInstance).toHaveLength(1);
    expect(usersFromInstance[0]).toBeInstanceOf(User);
    expect(usersFromInstance[0].name).toBe('Bob');
    expect(usersFromClass[0]).toBeInstanceOf(User);
    expect(usersFromClass[0].name).toBe('Bob');
  });
});
