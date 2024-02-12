import { Nested, Transform } from '../../src/decorators';
import * as moment from 'moment';

export class User {
  id: number;

  name: string;

  @Nested(Date)
  @Transform(value => value.toString(), { toPlainOnly: true })
  @Transform(value => moment(value), { toClassOnly: true })
  date: Date;
}
