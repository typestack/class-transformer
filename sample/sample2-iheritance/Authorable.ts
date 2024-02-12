import { nested, exclude } from '../../src/decorators';
import { User } from './User';

export class Authorable {
  authorName: string;

  @exclude()
  authorEmail: string;

  @nested(User)
  author: User;
}
