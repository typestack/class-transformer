import {Type, Exclude} from "../../src/decorators";
import {Album} from "./Album";
import {Authorable} from "./Authorable";

export class Photo extends Authorable {

    id: string;

    filename: string;

    description: string;

    @Exclude() // this will ignore skipping inherited from Authorable class
    authorEmail: string;

    @Type(() => Album)
    albums: Album[];

}