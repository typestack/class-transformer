import {Skip} from "../../src/decorators";

export class User {

    id: number;
    
    firstName: string;
    
    lastName: string;
    
    @Skip()
    password: string;
    
    constructor(id: number, firstName: string, lastName: string, password: string) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
    }
    
    get name() {
        return this.firstName + " " + this.lastName;
    }

}