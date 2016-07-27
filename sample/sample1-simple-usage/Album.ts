import {Type, Exclude} from "../../src/decorators";
import {Photo} from "./Photo";

export class Album {

    id: string;

    @Exclude()
    name: string;

    @Type(() => Photo)
    photos: Photo[];

}