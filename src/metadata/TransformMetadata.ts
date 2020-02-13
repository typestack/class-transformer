import {TransformOptions} from "./ExposeExcludeOptions";
import {TransformationType} from "../TransformOperationExecutor";

export class TransformMetadata {

    constructor(public target: Function,
                public propertyName: string,
                public transformFn: (value: any, key: string, obj: any, transformationType: TransformationType) => any,
                public options: TransformOptions) {
    }

}
