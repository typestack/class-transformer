export class TypeMetadata {

    constructor(public target: Function,
                public propertyName: string,
                public reflectedType: any,
                public typeFunction: (object?: Object) => Function,
                public isArray: boolean) {
    }

}