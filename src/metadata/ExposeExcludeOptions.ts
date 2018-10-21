
export interface TransformOptions {
    since?: number;
    until?: number;
    groups?: string[];
    toClassOnly?: boolean;
    toPlainOnly?: boolean;
}

export interface TypeOptions {
    discriminator?: Discriminator;
    /**
     * Is false by default.
     */
    keepDiscriminatorProperty?: boolean;
}

export interface TypeHelpOptions {
    newObject: any;
    object: Object;
    property: string;
}

export interface ExposeOptions {
    name?: string;
    since?: number;
    until?: number;
    groups?: string[];
    toClassOnly?: boolean;
    toPlainOnly?: boolean;
}

export interface ExcludeOptions {
    toClassOnly?: boolean;
    toPlainOnly?: boolean;
}

export interface Discriminator {
    property: string;
    subTypes: JsonSubType[];
}

export interface JsonSubType {
    value: new (...args: any[]) => any;
    name: string;
}