import { nested } from "../../src/decorators";

export class User {
  @nested(Number)
  id: number;

  firstName: string;

  lastName: string;

  @nested(Date)
  registrationDate: Date;
}
