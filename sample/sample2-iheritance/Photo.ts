import {Type, Skip} from "../../src/Decorators";
import {Album} from "./Album";
import {Authorable} from "./Authorable";

export class Photo extends Authorable {

    id: string;

    filename: string;

    description: string;

    @Skip({ onSerialize: false, onDeserialize: false }) // this will ignore skipping inherited from Authorable class
    authorEmail: string;

    @Type(() => Album)
    albums: Album[];

}