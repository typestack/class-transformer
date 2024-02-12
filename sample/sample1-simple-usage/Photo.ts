import { nested } from "../../src/decorators";
import { Album } from "./Album";
import { User } from "./User";

export class Photo {
  id: string;
  filename: string;
  description: string;
  tags: Array<string>;
  @nested(User) author: User;
  @nested(Album) albums: Array<Album>;

  get name() {
    return this.id + "_" + this.filename;
  }

  getAlbums() {
    console.log("this is not serialized/deserialized");
    return this.albums;
  }
}
