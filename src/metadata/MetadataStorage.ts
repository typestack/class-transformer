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

    private _typeMetadatas = new Map<Function, Map<string, TypeMetadata>>();
    private _transformMetadatas = new Map<Function, Map<string, TransformMetadata[]>>();
    private _exposeMetadatas = new Map<Function, Map<string, ExposeMetadata>>();
    private _excludeMetadatas = new Map<Function, Map<string, ExcludeMetadata>>();

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    addTypeMetadata(metadata: TypeMetadata) {
        if (!this._typeMetadatas.has(metadata.target)) {
            this._typeMetadatas.set(metadata.target, new Map<string, TypeMetadata>());
        }
        this._typeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
    }

    addTransformMetadata(metadata: TransformMetadata) {
        if (!this._transformMetadatas.has(metadata.target)) {
            this._transformMetadatas.set(metadata.target, new Map<string, TransformMetadata[]>());
        }
        if (!this._transformMetadatas.get(metadata.target).has(metadata.propertyName)) {
            this._transformMetadatas.get(metadata.target).set(metadata.propertyName, []);
        }
        this._transformMetadatas.get(metadata.target).get(metadata.propertyName).push(metadata);
    }

    addExposeMetadata(metadata: ExposeMetadata) {
        if (!this._exposeMetadatas.has(metadata.target)) {
            this._exposeMetadatas.set(metadata.target, new Map<string, ExposeMetadata>());
        }
        this._exposeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
    }

    addExcludeMetadata(metadata: ExcludeMetadata) {
        if (!this._excludeMetadatas.has(metadata.target)) {
            this._excludeMetadatas.set(metadata.target, new Map<string, ExcludeMetadata>());
        }
        this._excludeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
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
                    return transformationType === "classToClass" ||  transformationType === "plainToClass";
                }
                if (metadata.options.toPlainOnly === true) {
                    return transformationType === "classToPlain";
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
        const excludeMap = this._excludeMetadatas.get(target);
        const exclude = excludeMap && excludeMap.get(undefined);
        const exposeMap = this._exposeMetadatas.get(target);
        const expose = exposeMap && exposeMap.get(undefined);
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
                    return transformationType === "classToClass" ||  transformationType === "plainToClass";
                }
                if (metadata.options.toPlainOnly === true) {
                    return transformationType === "classToPlain";
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
                    return transformationType === "classToClass" ||  transformationType === "plainToClass";
                }
                if (metadata.options.toPlainOnly === true) {
                    return transformationType === "classToPlain";
                }

                return true;
            })
            .map(metadata => metadata.propertyName);
    }

    clear() {
        this._typeMetadatas.clear();
        this._exposeMetadatas.clear();
        this._excludeMetadatas.clear();
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private getMetadata<T extends { target: Function, propertyName: string }>(
        metadatas: Map<Function, Map<String, T>>,
        target: Function): T[] {
        let metadataFromTargetMap = metadatas.get(target);
        let metadataFromTarget: T[];
        if (metadataFromTargetMap) {
            metadataFromTarget = Array.from(metadataFromTargetMap.values()).filter(meta => meta.propertyName !== undefined);
        }
        return metadataFromTarget || [];
    }

    private findMetadata<T extends { target: Function, propertyName: string }>(metadatas: Map<Function, Map<string, T>>, target: Function, propertyName: string): T {
        let metadataFromTargetMap = metadatas.get(target);
        let metadataFromTarget: T;
        if (metadataFromTargetMap) {
            metadataFromTarget = metadataFromTargetMap.get(propertyName);  
        }
        return metadataFromTarget;
    }

    private findMetadatas<T extends { target: Function, propertyName: string }>(metadatas: Map<Function, Map<string, T[]>>, target: Function, propertyName: string): T[] {
        let metadataFromTargetMap = metadatas.get(target);
        let metadataFromTarget: T[];
        if (metadataFromTargetMap) {
            metadataFromTarget = metadataFromTargetMap.get(propertyName);    
        }
        return metadataFromTarget && metadataFromTarget.reverse() || [];
    }
}
