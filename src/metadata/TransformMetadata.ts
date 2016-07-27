import {TransformOptions} from "./ExposeExcludeOptions";

export class TransformMetadata {

    constructor(public target: Function,
                public propertyName: string,
                public transformFn: (value: any) => any,
                public options: TransformOptions) {
    }

}