import {PropertyMetadata} from "./PropertyMetadata";

export class TypeMetadata extends PropertyMetadata {

    private _typeFunction: () => Function;
    private _isArray: boolean;

    constructor(target: Function, key: string, typeFunction: () => Function, isArray: boolean) {
        super(target, key);
        this._typeFunction = typeFunction;
        this._isArray = isArray;
    }

    get typeFunction() {
        return this._typeFunction;
    }

    get isArray() {
        return this._isArray;
    }

}