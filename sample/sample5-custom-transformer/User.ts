import { nested, transform } from "../../src/decorators";
import * as moment from "moment";

export class User {
  id: number;

  name: string;

  @nested(Date)
  @transform((value) => value.toString(), { toPlainOnly: true })
  @transform((value) => moment(value), { toClassOnly: true })
  date: Date;
}
