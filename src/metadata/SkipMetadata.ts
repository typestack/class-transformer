import {PropertyMetadata} from "./PropertyMetadata";

export interface SkipOptions {
    constructorToPlain?: boolean;
    plainToConstructor?: boolean;
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

    get isConstructorToPlain() {
        return !this._options || (this._options && this._options.constructorToPlain);
    }

    get isPlainToConstructor() {
        return !this._options || (this._options && this._options.plainToConstructor);
    }

}