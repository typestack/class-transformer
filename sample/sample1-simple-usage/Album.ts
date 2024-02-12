import { nested, exclude } from "../../src/decorators";
import { Photo } from "./Photo";

export class Album {
  id: string;

  @exclude()
  name: string;

  @nested(Photo)
  photos: Array<Photo>;
}
