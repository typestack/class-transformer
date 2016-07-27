import {Album} from "./Album";
import {AlbumArray} from "./AlbumArray";
import {Type} from "../../src/decorators";

export class Photo {

    id: string;

    filename: string;

    description: string;

    tags: string[];

    @Type(() => Album)
    albums: AlbumArray;

}