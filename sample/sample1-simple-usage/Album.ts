import { Nested, Exclude } from '../../src/decorators';
import { Photo } from './Photo';

export class Album {
  id: string;

  @Exclude()
  name: string;

  @Nested(Photo)
  photos: Photo[];
}
