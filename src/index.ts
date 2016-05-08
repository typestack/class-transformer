import {
    ConstructorUtils,
    ConstructorFunction,
    PlainToConstructorOptions,
    ConstructorToPlainOptions
} from "./ConstructorUtils";

export * from "./ConstructorUtils";
export * from "./decorators";

const constructorUtils = new ConstructorUtils();
export default constructorUtils;

export function constructorToPlain<T>(object: T, options?: ConstructorToPlainOptions) {
    return constructorUtils.constructorToPlain(object, options);
}

export function plainToConstructor<T>(cls: ConstructorFunction<T>, json: Object, options?: PlainToConstructorOptions): T {
    return constructorUtils.plainToConstructor(cls, json, options);
}

export function plainToConstructorArray<T>(cls: ConstructorFunction<T>, json: Object[], options?: PlainToConstructorOptions): T[] {
    return constructorUtils.plainToConstructorArray(cls, json, options);
}