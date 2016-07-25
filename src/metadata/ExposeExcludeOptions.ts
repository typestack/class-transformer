
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
