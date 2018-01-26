import {TypeOptions} from "./ExposeExcludeOptions";

export class TypeMetadata {

    constructor(public target: Function,
                public propertyName: string,
                public reflectedType: any,
                public typeFunction: (options?: TypeOptions) => Function | DiscrimnatorFunction[]) {
    }

}

export type DiscrimnatorFunction = (value: any) => Function | false;