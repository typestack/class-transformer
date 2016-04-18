import {Type, Skip} from "../../src/decorators";
import {Photo} from "./Photo";
import {Authorable} from "./Authorable";

export class Album extends Authorable {

    id: string;

    @Skip()
    name: string;

    @Type(() => Photo)
    photos: Photo[];

}