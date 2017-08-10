import {TransformOptions} from "./ExposeExcludeOptions";

export class TransformMetadata {

    constructor(public target: Function,
                public propertyName: string,
                public transformFn: (value: any, obj: any) => any,
                public options: TransformOptions) {
    }

}
