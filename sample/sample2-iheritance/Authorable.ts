import { Nested, Exclude } from '../../src/decorators';
import { User } from './User';

export class Authorable {
  authorName: string;

  @Exclude()
  authorEmail: string;

  @Nested(User)
  author: User;
}
