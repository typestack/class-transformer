import {TypeOptions} from "./ExposeExcludeOptions";

export class CatchNotExposedMetadata {

    constructor(public target: Function,
                public propertyName: string) {
    }

}
