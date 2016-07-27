import {Type, Exclude} from "../../src/decorators";
import {Photo} from "./Photo";
import {Authorable} from "./Authorable";

export class Album extends Authorable {

    id: string;

    @Exclude()
    name: string;

    @Type(() => Photo)
    photos: Photo[];

}