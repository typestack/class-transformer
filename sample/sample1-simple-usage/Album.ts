import {Type, Skip} from "../../src/Decorators";
import {Photo} from "./Photo";

export class Album {

    id: string;

    @Skip()
    name: string;

    @Type(() => Photo)
    photos: Photo[];

}