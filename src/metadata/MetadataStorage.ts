import {TypeMetadata} from "./TypeMetadata";
import {ExposeMetadata} from "./ExposeMetadata";
import {ExcludeMetadata} from "./ExcludeMetadata";
import {TransformationType} from "../TransformOperationExecutor";
import {TransformMetadata} from "./TransformMetadata";

/**
 * Storage all library metadata.
 */
export class MetadataStorage {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _typeMetadatas: TypeMetadata[] = [];
    private _transformMetadatas: TransformMetadata[] = [];
    private _exposeMetadatas: ExposeMetadata[] = [];
    private _excludeMetadatas: ExcludeMetadata[] = [];

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    addTypeMetadata(metadata: TypeMetadata) {
        this._typeMetadatas.push(metadata);
    }

    addTransformMetadata(metadata: TransformMetadata) {
        this._transformMetadatas.push(metadata);
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

    findTransformMetadatas(target: Function, propertyName: string, transformationType: TransformationType): TransformMetadata[] {
        return this.findMetadatas(this._transformMetadatas, target, propertyName)
            .filter(metadata => {
                if (!metadata.options)
                    return true;
                if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
                    return true;

                if (metadata.options.toClassOnly === true) {
                    return transformationType === TransformationType.CLASS_TO_CLASS ||  transformationType === TransformationType.PLAIN_TO_CLASS;
                }
                if (metadata.options.toPlainOnly === true) {
                    return transformationType === TransformationType.CLASS_TO_PLAIN;
                }

                return true;
            });
    }

    findExcludeMetadata(target: Function, propertyName: string): ExcludeMetadata {
        return this.findMetadata(this._excludeMetadatas, target, propertyName);
    }

    findExposeMetadata(target: Function, propertyName: string): ExposeMetadata {
        return this.findMetadata(this._exposeMetadatas, target, propertyName);
    }

    findExposeMetadataByCustomName(target: Function, name: string): ExposeMetadata {
        return this.getExposedMetadatas(target).find(metadata => {
            return metadata.options && metadata.options.name === name;
        });
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

    getExposedProperties(target: Function, transformationType: TransformationType): string[] {
        return this.getExposedMetadatas(target)
            .filter(metadata => {
                if (!metadata.options)
                    return true;
                if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
                    return true;

                if (metadata.options.toClassOnly === true) {
                    return transformationType === TransformationType.CLASS_TO_CLASS ||  transformationType === TransformationType.PLAIN_TO_CLASS;
                }
                if (metadata.options.toPlainOnly === true) {
                    return transformationType === TransformationType.CLASS_TO_PLAIN;
                }

                return true;
            })
            .map(metadata => metadata.propertyName);
    }

    getExcludedProperties(target: Function, transformationType: TransformationType): string[] {
        return this.getExcludedMetadatas(target)
            .filter(metadata => {
                if (!metadata.options)
                    return true;
                if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
                    return true;

                if (metadata.options.toClassOnly === true) {
                    return transformationType === TransformationType.CLASS_TO_CLASS ||  transformationType === TransformationType.PLAIN_TO_CLASS;
                }
                if (metadata.options.toPlainOnly === true) {
                    return transformationType === TransformationType.CLASS_TO_PLAIN;
                }

                return true;
            })
            .map(metadata => metadata.propertyName);
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

    private findMetadatas<T extends { target: Function, propertyName: string }>(metadatas: T[], target: Function, propertyName: string): T[] {
        const metadataFromTarget = metadatas.filter(meta => meta.target === target && meta.propertyName === propertyName);
        const metadataFromChildren = metadatas.filter(meta => target.prototype instanceof meta.target && meta.propertyName === propertyName);
        return metadataFromChildren.reverse().concat(metadataFromTarget.reverse());
    }

}
