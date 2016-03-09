import {Type, Skip} from "../../src/Decorators";
import {User} from "./User";

export class Authorable {
    
    authorName: string;

    @Skip()
    authorEmail: string;
    
    @Type(() => User)
    author: User;

}