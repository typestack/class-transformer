import {Type, Skip} from "../../src/decorators";
import {Photo} from "./Photo";

export class Album {

    id: string;

    @Skip()
    name: string;

    @Type(() => Photo)
    photos: Photo[];

}