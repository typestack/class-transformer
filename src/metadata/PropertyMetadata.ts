export abstract class PropertyMetadata {

    private _target: Function;
    private _key: string;

    constructor(target: Function, key: string) {
        this._target = target;
        this._key = key;
    }

    get target() {
        return this._target;
    }

    get key() {
        return this._key;
    }

}