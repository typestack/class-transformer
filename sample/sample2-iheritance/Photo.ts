import { nested, exclude } from "../../src/decorators";
import { Album } from "./Album";
import { Authorable } from "./Authorable";

export class Photo extends Authorable {
  id: string;
  filename: string;
  description: string;
  @exclude() authorEmail: string; // this decoration will ignore skipping inherited from Authorable class
  @nested(Album) albums: Array<Album>;
}
