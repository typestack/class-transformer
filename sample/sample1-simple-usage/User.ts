import { Type } from '../../src/decorators';

export class User {
  @Nested(Number)
  id: number;

  firstName: string;

  lastName: string;

  @Nested(Date)
  registrationDate: Date;
}
