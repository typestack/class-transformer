import {ExcludeOptions} from "./ExposeExcludeOptions";

export class ExcludeMetadata {

    constructor(public target: Function,
                public propertyName: string,
                public options: ExcludeOptions) {
    }

}