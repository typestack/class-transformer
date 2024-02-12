import 'reflect-metadata';
import { plainToInstance, Transform, Type } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';

describe('inheritence', () => {
  it('decorators should work inside a base class', () => {
    defaultMetadataStorage.clear();

    class Contact {
      @Transform(({ value }) => value.toUpperCase())
      name: string;
      @Nested(Date)
      birthDate: Date;
    }

    class User extends Contact {
      @Nested(Number)
      id: number;
      email: string;
    }

    class Student extends User {
      @Transform(({ value }) => value.toUpperCase())
      university: string;
    }

    const plainStudent = {
      name: 'Johny Cage',
      university: 'mit',
      birthDate: new Date(1967, 2, 1).toDateString(),
      id: 100,
      email: 'johnny.cage@gmail.com',
    };

    const classedStudent = plainToInstance(Student, plainStudent);
    expect(classedStudent.name).toEqual('JOHNY CAGE');
    expect(classedStudent.university).toEqual('MIT');
    expect(classedStudent.birthDate.getTime()).toEqual(new Date(1967, 2, 1).getTime());
    expect(classedStudent.id).toEqual(plainStudent.id);
    expect(classedStudent.email).toEqual(plainStudent.email);
  });
});
