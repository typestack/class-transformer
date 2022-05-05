import { TypeMetadata, ExposeMetadata, ExcludeMetadata, TransformMetadata } from './interfaces';
import { TransformationType } from './enums';

/**
 * Storage all library metadata.
 */
export class MetadataStorage {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  private _typeMetadatas = new Map<Function, Map<string, TypeMetadata>>();
  private _transformMetadatas = new Map<Function, Map<string, TransformMetadata[]>>();
  private _exposeMetadatas = new Map<Function, Map<string | undefined, ExposeMetadata[]>>();
  private _excludeMetadatas = new Map<Function, Map<string | undefined, ExcludeMetadata>>();
  private _ancestorsMap = new Map<Function, Function[]>();

  // -------------------------------------------------------------------------
  // Adder Methods
  // -------------------------------------------------------------------------

  addTypeMetadata(metadata: TypeMetadata): void {
    if (!this._typeMetadatas.has(metadata.target)) {
      this._typeMetadatas.set(metadata.target, new Map<string, TypeMetadata>());
    }
    this._typeMetadatas.get(metadata.target)!.set(metadata.propertyName, metadata);
  }

  addTransformMetadata(metadata: TransformMetadata): void {
    if (!this._transformMetadatas.has(metadata.target)) {
      this._transformMetadatas.set(metadata.target, new Map<string, TransformMetadata[]>());
    }
    const properties = this._transformMetadatas.get(metadata.target)!;
    if (!properties.has(metadata.propertyName)) {
      properties.set(metadata.propertyName, []);
    }
    properties.get(metadata.propertyName)!.push(metadata);
  }

  addExposeMetadata(metadata: ExposeMetadata): void {
    if (!this._exposeMetadatas.has(metadata.target)) {
      this._exposeMetadatas.set(metadata.target, new Map<string, ExposeMetadata[]>());
    }
    const properties = this._exposeMetadatas.get(metadata.target)!;
    if (!properties.has(metadata.propertyName)) {
      properties.set(metadata.propertyName, []);
    }
    properties.get(metadata.propertyName)!.push(metadata);
  }

  addExcludeMetadata(metadata: ExcludeMetadata): void {
    if (!this._excludeMetadatas.has(metadata.target)) {
      this._excludeMetadatas.set(metadata.target, new Map<string, ExcludeMetadata>());
    }
    this._excludeMetadatas.get(metadata.target)!.set(metadata.propertyName, metadata);
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  findTransformMetadatas(
    target: Function,
    propertyName: string,
    transformationType: TransformationType
  ): TransformMetadata[] {
    return this.findMetadatas(this._transformMetadatas, target, propertyName).filter(metadata => {
      if (!metadata.options) return true;
      if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true) return true;

      if (metadata.options.toClassOnly === true) {
        return (
          transformationType === TransformationType.CLASS_TO_CLASS ||
          transformationType === TransformationType.PLAIN_TO_CLASS
        );
      }
      if (metadata.options.toPlainOnly === true) {
        return transformationType === TransformationType.CLASS_TO_PLAIN;
      }

      return true;
    });
  }

  findExcludeMetadata(target: Function, propertyName: string): ExcludeMetadata | undefined {
    return this.findMetadata(this._excludeMetadatas, target, propertyName);
  }

  findExposeMetadata(
    target: Function,
    propertyName: string,
    transformationType: TransformationType
  ): ExposeMetadata | undefined {
    return this.findMetadatas(this._exposeMetadatas, target, propertyName).find(metadata => {
      if (!metadata.options) return true;
      if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true) return true;

      if (metadata.options.toClassOnly === true) {
        return (
          transformationType === TransformationType.CLASS_TO_CLASS ||
          transformationType === TransformationType.PLAIN_TO_CLASS
        );
      }
      if (metadata.options.toPlainOnly === true) {
        return transformationType === TransformationType.CLASS_TO_PLAIN;
      }

      return true;
    });
  }

  findExposeMetadataByCustomName(
    target: Function,
    name: string,
    transformType: TransformationType
  ): ExposeMetadata | undefined {
    return this.getExposedMetadatas(target).find(metadata => {
      return metadata.options && metadata.options.name === name;
    });
  }

  findTypeMetadata(target: Function, propertyName: string): TypeMetadata | undefined {
    return this.findMetadata(this._typeMetadatas, target, propertyName);
  }

  getStrategy(target: Function): 'excludeAll' | 'exposeAll' | 'none' {
    const excludeMap = this._excludeMetadatas.get(target);
    const exclude = excludeMap && excludeMap.get(undefined);
    const exposeMap = this._exposeMetadatas.get(target);
    const expose = exposeMap && exposeMap.get(undefined);
    if ((exclude && expose) || (!exclude && !expose)) return 'none';
    return exclude ? 'excludeAll' : 'exposeAll';
  }

  getExposedMetadatas(target: Function): ExposeMetadata[] {
    return this.getMetadatas(this._exposeMetadatas, target);
  }

  getExcludedMetadatas(target: Function): ExcludeMetadata[] {
    return this.getMetadata(this._excludeMetadatas, target);
  }

  getExposedProperties(target: Function, transformationType: TransformationType): string[] {
    return this.getExposedMetadatas(target)
      .filter(metadata => {
        if (!metadata.propertyName) return false;
        if (!metadata.options) return true;
        if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true) return true;

        if (metadata.options.toClassOnly === true) {
          return (
            transformationType === TransformationType.CLASS_TO_CLASS ||
            transformationType === TransformationType.PLAIN_TO_CLASS
          );
        }
        if (metadata.options.toPlainOnly === true) {
          return transformationType === TransformationType.CLASS_TO_PLAIN;
        }

        return true;
      })
      .map(metadata => metadata.propertyName!);
  }

  getExcludedProperties(target: Function, transformationType: TransformationType): string[] {
    return this.getExcludedMetadatas(target)
      .filter(metadata => {
        if (!metadata.propertyName) return false;
        if (!metadata.options) return true;
        if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true) return true;

        if (metadata.options.toClassOnly === true) {
          return (
            transformationType === TransformationType.CLASS_TO_CLASS ||
            transformationType === TransformationType.PLAIN_TO_CLASS
          );
        }
        if (metadata.options.toPlainOnly === true) {
          return transformationType === TransformationType.CLASS_TO_PLAIN;
        }

        return true;
      })
      .map(metadata => metadata.propertyName!);
  }

  clear(): void {
    this._typeMetadatas.clear();
    this._exposeMetadatas.clear();
    this._excludeMetadatas.clear();
    this._ancestorsMap.clear();
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  private getMetadata<T extends { target: Function; propertyName: string | undefined }>(
    metadatas: Map<Function, Map<string | undefined, T>>,
    target: Function
  ): T[] {
    const metadataFromTargetMap = metadatas.get(target);
    let metadataFromTarget: T[] | undefined = undefined;
    if (metadataFromTargetMap) {
      metadataFromTarget = Array.from(metadataFromTargetMap.values()).filter(meta => meta.propertyName !== undefined);
    }
    const metadataFromAncestors: T[] = [];
    for (const ancestor of this.getAncestors(target)) {
      const ancestorMetadataMap = metadatas.get(ancestor);
      if (ancestorMetadataMap) {
        const metadataFromAncestor = Array.from(ancestorMetadataMap.values()).filter(
          meta => meta.propertyName !== undefined
        );
        metadataFromAncestors.push(...metadataFromAncestor);
      }
    }
    return metadataFromAncestors.concat(metadataFromTarget || []);
  }

  private getMetadatas<T extends { target: Function; propertyName: string | undefined }>(
    metadatas: Map<Function, Map<string | undefined, T[]>>,
    target: Function
  ): T[] {
    const metadataFromTargetMap = metadatas.get(target);
    let metadataFromTarget: T[] | undefined = undefined;
    if (metadataFromTargetMap) {
      metadataFromTarget = Array.from(metadataFromTargetMap.values()).reduce(
        (acc, values) => acc.concat(values.filter(meta => meta.propertyName !== undefined)),
        []
      );
    }
    const metadataFromAncestors: T[] = [];
    for (const ancestor of this.getAncestors(target)) {
      const ancestorMetadataMap = metadatas.get(ancestor);
      if (ancestorMetadataMap) {
        const metadataFromAncestor = Array.from(ancestorMetadataMap.values()).reduce(
          (acc, values) => acc.concat(values.filter(meta => meta.propertyName !== undefined)),
          []
        );
        metadataFromAncestors.push(...metadataFromAncestor);
      }
    }
    return metadataFromAncestors.concat(metadataFromTarget || []);
  }

  private findMetadata<T extends { target: Function; propertyName: string | undefined }>(
    metadatas: Map<Function, Map<string | undefined, T>>,
    target: Function,
    propertyName: string
  ): T | undefined {
    const metadataFromTargetMap = metadatas.get(target);
    if (metadataFromTargetMap) {
      const metadataFromTarget = metadataFromTargetMap.get(propertyName);
      if (metadataFromTarget) {
        return metadataFromTarget;
      }
    }
    for (const ancestor of this.getAncestors(target)) {
      const ancestorMetadataMap = metadatas.get(ancestor);
      if (ancestorMetadataMap) {
        const ancestorResult = ancestorMetadataMap.get(propertyName);
        if (ancestorResult) {
          return ancestorResult;
        }
      }
    }
    return undefined;
  }

  private findMetadatas<T extends { target: Function; propertyName: string | undefined }>(
    metadatas: Map<Function, Map<string | undefined, T[]>>,
    target: Function,
    propertyName: string
  ): T[] {
    const metadataFromTargetMap = metadatas.get(target);
    let metadataFromTarget: T[] | undefined = undefined;
    if (metadataFromTargetMap) {
      metadataFromTarget = metadataFromTargetMap.get(propertyName);
    }
    const metadataFromAncestorsTarget: T[] = [];
    for (const ancestor of this.getAncestors(target)) {
      const ancestorMetadataMap = metadatas.get(ancestor);
      if (ancestorMetadataMap) {
        if (ancestorMetadataMap.has(propertyName)) {
          metadataFromAncestorsTarget.push(...ancestorMetadataMap.get(propertyName)!);
        }
      }
    }
    return metadataFromAncestorsTarget
      .slice()
      .reverse()
      .concat((metadataFromTarget || []).slice().reverse());
  }

  private getAncestors(target: Function): Function[] {
    if (!target) return [];
    if (!this._ancestorsMap.has(target)) {
      const ancestors: Function[] = [];
      for (
        let baseClass = Object.getPrototypeOf(target.prototype.constructor);
        typeof baseClass.prototype !== 'undefined';
        baseClass = Object.getPrototypeOf(baseClass.prototype.constructor)
      ) {
        ancestors.push(baseClass);
      }
      this._ancestorsMap.set(target, ancestors);
    }
    return this._ancestorsMap.get(target) || [];
  }
}
