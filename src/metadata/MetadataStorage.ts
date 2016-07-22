import {TypeMetadata} from "./TypeMetadata";
import {ExposeMetadata} from "./ExposeMetadata";
import {ExcludeMetadata} from "./ExcludeMetadata";

/**
 * Storage all library metadata.
 */
export class MetadataStorage {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _typeMetadatas: TypeMetadata[] = [];
    private _exposeMetadatas: ExposeMetadata[] = [];
    private _excludeMetadatas: ExcludeMetadata[] = [];

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    addTypeMetadata(metadata: TypeMetadata) {
        this._typeMetadatas.push(metadata);
    }

    addExposeMetadata(metadata: ExposeMetadata) {
        this._exposeMetadatas.push(metadata);
    }

    addExcludeMetadata(metadata: ExcludeMetadata) {
        this._excludeMetadatas.push(metadata);
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    findExcludeMetadata(target: Function, propertyName: string): ExcludeMetadata {
        return this.findMetadata(this._excludeMetadatas, target, propertyName);
    }

    findExposeMetadata(target: Function, propertyName: string): ExposeMetadata {
        return this.findMetadata(this._exposeMetadatas, target, propertyName);
    }

    findTypeMetadata(target: Function, propertyName: string) {
        return this.findMetadata(this._typeMetadatas, target, propertyName);
    }

    getStrategy(target: Function): "excludeAll"|"exposeAll"|"none" {
        const exclude = this._excludeMetadatas.find(metadata => metadata.target === target && metadata.propertyName === undefined);
        const expose = this._exposeMetadatas.find(metadata => metadata.target === target && metadata.propertyName === undefined);
        if ((exclude && expose) || (!exclude && !expose)) return "none";
        return exclude ? "excludeAll" : "exposeAll";
    }

    getExposedMetadatas(target: Function): ExposeMetadata[] {
        return this.getMetadata(this._exposeMetadatas, target);
    }

    getExcludedMetadatas(target: Function): ExcludeMetadata[] {
        return this.getMetadata(this._excludeMetadatas, target);
    }

    getExposedProperties(target: Function): string[] {
        return this.getExposedMetadatas(target).map(metadata => metadata.propertyName);
    }

    getExcludedProperties(target: Function): string[] {
        return this.getExcludedMetadatas(target).map(metadata => metadata.propertyName);
    }

    clear() {
        this._typeMetadatas = [];
        this._exposeMetadatas = [];
        this._excludeMetadatas = [];
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private getMetadata<T extends { target: Function, propertyName: string }>(metadatas: T[], target: Function): T[] {
        const metadataFromTarget = metadatas.filter(meta => meta.target === target && meta.propertyName !== undefined);
        const metadataFromChildren = metadatas.filter(meta => target.prototype instanceof meta.target && meta.propertyName !== undefined);
        return metadataFromChildren.concat(metadataFromTarget);
    }

    private findMetadata<T extends { target: Function, propertyName: string }>(metadatas: T[], target: Function, propertyName: string): T {
        const metadataFromTarget = metadatas.find(meta => meta.target === target && meta.propertyName === propertyName);
        const metadataFromChildren = metadatas.find(meta => target.prototype instanceof meta.target && meta.propertyName === propertyName);
        return metadataFromTarget || metadataFromChildren;
    }

}