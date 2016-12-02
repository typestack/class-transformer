import {ClassTransformOptions} from "./ClassTransformOptions";
import {TransformOperationExecutor} from "./TransformOperationExecutor";

export type ClassType<T> = { new (...args: any[]): T; };

export class ClassTransformer {

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Converts class (constructor) object to plain (literal) object. Also works with arrays.
     */
    classToPlain<T extends Object>(object: T, options?: ClassTransformOptions): Object;
    classToPlain<T extends Object>(object: T[], options?: ClassTransformOptions): Object[];
    classToPlain<T extends Object>(object: T|T[], options?: ClassTransformOptions): Object|Object[] {
        const executor = new TransformOperationExecutor("classToPlain", options || {});
        return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
    }

    /**
     * Converts class (constructor) object to plain (literal) object.
     * Uses given plain object as source object (it means fills given plain object with data from class object).
     * Also works with arrays.
     */
    classToPlainFromExist<T extends Object, P>(object: T, plainObject: P, options?: ClassTransformOptions): T;
    classToPlainFromExist<T extends Object, P>(object: T, plainObjects: P[], options?: ClassTransformOptions): T[];
    classToPlainFromExist<T extends Object, P>(object: T, plainObject: P|P[], options?: ClassTransformOptions): T|T[] {
        const executor = new TransformOperationExecutor("classToPlain", options || {});
        return executor.transform(plainObject, object, undefined, undefined, undefined, undefined);
    }

    /**
     * Converts plain (literal) object to class (constructor) object. Also works with arrays.
     */
    plainToClass<T extends Object, V extends Array<any>>(cls: ClassType<T>, plain: V, options?: ClassTransformOptions): T[];
    plainToClass<T extends Object, V>(cls: ClassType<T>, plain: V, options?: ClassTransformOptions): T;
    plainToClass<T extends Object, V>(cls: ClassType<T>, plain: V|V[], options?: ClassTransformOptions): T|T[] {
        const executor = new TransformOperationExecutor("plainToClass", options || {});
        return executor.transform(undefined, plain, cls, undefined, undefined, undefined);
    }

    /**
     * Converts plain (literal) object to class (constructor) object.
     * Uses given object as source object (it means fills given object with data from plain object).
     * Also works with arrays.
     */
    plainToClassFromExist<T extends Object, V extends Array<any>>(clsObject: T, plain: V, options?: ClassTransformOptions): T;
    plainToClassFromExist<T extends Object, V>(clsObject: T, plain: V, options?: ClassTransformOptions): T[];
    plainToClassFromExist<T extends Object, V>(clsObject: T, plain: V|V[], options?: ClassTransformOptions): T|T[] {
        const executor = new TransformOperationExecutor("plainToClass", options || {});
        return executor.transform(clsObject, plain, undefined, undefined, undefined, undefined);
    }

    /**
     * Converts class (constructor) object to new class (constructor) object. Also works with arrays.
     */
    classToClass<T>(object: T, options?: ClassTransformOptions): T;
    classToClass<T>(object: T[], options?: ClassTransformOptions): T[];
    classToClass<T>(object: T|T[], options?: ClassTransformOptions): T|T[] {
        const executor = new TransformOperationExecutor("classToClass", options || {});
        return executor.transform(undefined, object, undefined, undefined, undefined, undefined);
    }

    /**
     * Converts class (constructor) object to plain (literal) object.
     * Uses given plain object as source object (it means fills given plain object with data from class object).
     * Also works with arrays.
     */
    classToClassFromExist<T>(object: T, fromObject: T, options?: ClassTransformOptions): T;
    classToClassFromExist<T>(object: T, fromObjects: T[], options?: ClassTransformOptions): T[];
    classToClassFromExist<T>(object: T, fromObject: T|T[], options?: ClassTransformOptions): T|T[] {
        const executor = new TransformOperationExecutor("classToClass", options || {});
        return executor.transform(fromObject, object, undefined, undefined, undefined, undefined);
    }

    /**
     * Serializes given object to a JSON string.
     */
    serialize<T>(object: T, options?: ClassTransformOptions): string;
    serialize<T>(object: T[], options?: ClassTransformOptions): string;
    serialize<T>(object: T|T[], options?: ClassTransformOptions): string {
        return JSON.stringify(this.classToPlain(object, options));
    }

    /**
     * Deserializes given JSON string to a object of the given class.
     */
    deserialize<T>(cls: ClassType<T>, json: string, options?: ClassTransformOptions): T {
        const jsonObject: T = JSON.parse(json);
        return this.plainToClass(cls, jsonObject, options);
    }

    /**
     * Deserializes given JSON string to an array of objects of the given class.
     */
    deserializeArray<T>(cls: ClassType<T>, json: string, options?: ClassTransformOptions): T[] {
        const jsonObject: any[] = JSON.parse(json);
        return this.plainToClass(cls, jsonObject, options);
    }

}