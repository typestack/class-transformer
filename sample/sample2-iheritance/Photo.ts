import { nested, exclude } from '../../src/decorators';
import { Album } from './Album';
import { Authorable } from './Authorable';

export class Photo extends Authorable {
  id: string;

  filename: string;

  description: string;

  @exclude() // this will ignore skipping inherited from Authorable class
  authorEmail: string;

  @nested(Album)
  albums: Album[];
}
