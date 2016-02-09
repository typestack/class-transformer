import {PropertyMetadata} from "./PropertyMetadata";

export interface SkipOptions {
    onSerialize: boolean;
    onDeserialize: boolean;
}

export class SkipMetadata extends PropertyMetadata {

    private _options: SkipOptions;

    constructor(target: Function, key: string, options: SkipOptions) {
        super(target, key);
        this._options = options;
    }

    get options() {
        return this._options;
    }

    get isOnSerialize() {
        return !this._options || (this._options && this._options.onSerialize);
    }

    get isOnDeserialize() {
        return !this._options || (this._options && this._options.onDeserialize);
    }

}