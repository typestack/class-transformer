import { Type } from '../../src/decorators';

export class User {
  @Type(() => Number)
  id: number;

  firstName: string;

  lastName: string;

  @Type(() => Date)
  registrationDate: Date;
}
