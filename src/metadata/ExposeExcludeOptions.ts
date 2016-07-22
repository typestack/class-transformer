
export interface ExposeOptions {
    name?: string;
    since?: number;
    until?: number;
    groups?: string[];
    readonly?: boolean;
    writeonly?: boolean;
}

export interface ExcludeOptions {
    readonly?: boolean;
    writeonly?: boolean;
}
