import {TypeMetadata} from "./TypeMetadata";
import {SkipMetadata} from "./SkipMetadata";

/**
 * Storage all serializer metadata.
 */
export class MetadataStorage {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _typeMetadatas: TypeMetadata[] = [];
    private _skipMetadatas: SkipMetadata[] = [];

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    addTypeMetadata(metadata: TypeMetadata) {
        this._typeMetadatas.push(metadata);
    }

    addSkipMetadata(metadata: SkipMetadata) {
        this._skipMetadatas.push(metadata);
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    findSkipMetadata(target: Function, propertyName: string) {
        return this._skipMetadatas.find(meta => meta.target === target && meta.key === propertyName);
    }

    findTypeMetadata(target: Function, propertyName: string) {
        return this._typeMetadatas.find(meta => meta.target === target && meta.key === propertyName);
    }

}

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export let defaultMetadataStorage = new MetadataStorage();