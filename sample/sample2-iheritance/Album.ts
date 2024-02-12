import { nested, exclude } from '../../src/decorators';
import { Photo } from './Photo';
import { Authorable } from './Authorable';

export class Album extends Authorable {
  id: string;
  @exclude() name: string;
  @nested(Photo) photos: Array<Photo>;
}
