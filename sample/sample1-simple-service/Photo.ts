import {Type} from "../../src/Decorators";
import {Album} from "./Album";
import {User} from "./User";

export class Photo {

    id: string;

    filename: string;

    description: string;

    @Type(() => User)
    author: User;

    @Type(() => Album)
    albums: Album[];

}