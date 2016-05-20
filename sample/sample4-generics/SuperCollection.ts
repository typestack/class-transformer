import {Type, Skip} from "../../src/decorators";

export class SuperCollection<T> {
    
    @Skip()
    private type: Function;

    @Type((object: SuperCollection<T>) => object.type)
    items: T[];
    
    count: number;
    
    constructor(type: Function) {
        this.type = type;
    }
    
}