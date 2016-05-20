import {PropertyMetadata} from "./PropertyMetadata";

export class TypeMetadata extends PropertyMetadata {

    private _reflectedType: any;
    private _typeFunction: (obj?: any) => Function;
    private _isArray: boolean;

    constructor(target: Function, key: string, reflectedType: any, typeFunction: () => Function, isArray: boolean) {
        super(target, key);
        this._reflectedType = reflectedType;
        this._typeFunction = typeFunction;
        this._isArray = isArray;
    }

    get typeFunction() {
        return this._typeFunction;
    }

    get reflectedType() {
        return this._reflectedType;
    }

    get isArray() {
        return this._isArray;
    }

}