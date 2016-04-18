import {ArrayType} from "../../src/decorators";
import {Album} from "./Album";
import {AlbumArray} from "./AlbumArray";

export class Photo {

    id: string;

    filename: string;

    description: string;

    tags: string[];

    @ArrayType(() => Album)
    albums: AlbumArray;

}