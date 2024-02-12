import { Album } from './Album';
import { AlbumArray } from './AlbumArray';
import { nested } from '../../src/decorators';

export class Photo {
  id: string;

  filename: string;

  description: string;

  tags: string[];

  @nested(Album)
  albums: AlbumArray;
}
