import { Album } from './Album';

export class AlbumArray extends Array<Album> {
  findByName(name: string) {
    return this.find(album => album.name === name);
  }
}
