/**
 * Caused when @Type decorator is missing on the class property.
 */
export class TypeMissingError extends Error {
    name = "TypeMissingError";

    constructor(cls: Function, key: string) {
        super();
        this.message = `To perform serialization/deserialization you need to provide a type for the property
using @Type decorator, however ${ (<any>cls).name }.${key} does not have a type provided.`;
    }

}