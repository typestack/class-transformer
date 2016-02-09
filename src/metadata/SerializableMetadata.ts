export class SerializableMetadata {
    private _target: Function;
    private _params: any[];

    constructor(target: Function, params: any[]) {
        this._target = target;
        this._params = params;
    }

    get target() {
        return this._target;
    }

    get params() {
        return this._params;
    }

}