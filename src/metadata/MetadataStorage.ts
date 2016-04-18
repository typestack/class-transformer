import {TypeMetadata} from "./TypeMetadata";
import {SkipMetadata} from "./SkipMetadata";

/**
 * Storage all library metadata.
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
        const metadataFromTarget = this._skipMetadatas.find(meta => meta.target === target && meta.key === propertyName);
        const metadataFromChildren = this._skipMetadatas.find(meta => target.prototype instanceof meta.target && meta.key === propertyName);
        return metadataFromTarget || metadataFromChildren;
    }

    findTypeMetadata(target: Function, propertyName: string) {
        const metadataFromTarget = this._typeMetadatas.find(meta => meta.target === target && meta.key === propertyName);
        const metadataFromChildren = this._typeMetadatas.find(meta => target.prototype instanceof meta.target && meta.key === propertyName);
        return metadataFromTarget || metadataFromChildren;
    }

}

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export let defaultMetadataStorage = new MetadataStorage();