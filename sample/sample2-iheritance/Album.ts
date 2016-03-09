import {Type, Skip} from "../../src/Decorators";
import {Photo} from "./Photo";
import {Authorable} from "./Authorable";

export class Album extends Authorable {

    id: string;

    @Skip()
    name: string;

    @Type(() => Photo)
    photos: Photo[];

}