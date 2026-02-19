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
  private _exposeMetadatas = new Map<Function, Map<string, ExposeMetadata>>();
  private _excludeMetadatas = new Map<Function, Map<string, ExcludeMetadata>>();
  private _ancestorsMap = new Map<Function, Function[]>();
  private _transformMetadatasCache = new Map<Function, Map<string, Map<TransformationType, TransformMetadata[]>>>();
  private _exposedPropertiesCache = new Map<Function, Map<TransformationType, string[]>>();
  private _excludedPropertiesCache = new Map<Function, Map<TransformationType, string[]>>();
  private _exposeCustomNameCache = new Map<Function, Map<string, ExposeMetadata>>();
  private _typeMetadataCache = new Map<Function, Map<string, TypeMetadata>>();
  private _exposeMetadataCache = new Map<Function, Map<string, ExposeMetadata>>();
  private _excludeMetadataCache = new Map<Function, Map<string, ExcludeMetadata>>();
  private _hasTransformMetadatasCache = new Map<Function, boolean>();

  // -------------------------------------------------------------------------
  // Adder Methods
  // -------------------------------------------------------------------------

  addTypeMetadata(metadata: TypeMetadata): void {
    if (!this._typeMetadatas.has(metadata.target)) {
      this._typeMetadatas.set(metadata.target, new Map<string, TypeMetadata>());
    }
    this._typeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
    this.clearCaches();
  }

  addTransformMetadata(metadata: TransformMetadata): void {
    if (!this._transformMetadatas.has(metadata.target)) {
      this._transformMetadatas.set(metadata.target, new Map<string, TransformMetadata[]>());
    }
    if (!this._transformMetadatas.get(metadata.target).has(metadata.propertyName)) {
      this._transformMetadatas.get(metadata.target).set(metadata.propertyName, []);
    }
    this._transformMetadatas.get(metadata.target).get(metadata.propertyName).push(metadata);
    this.clearCaches();
  }

  addExposeMetadata(metadata: ExposeMetadata): void {
    if (!this._exposeMetadatas.has(metadata.target)) {
      this._exposeMetadatas.set(metadata.target, new Map<string, ExposeMetadata>());
    }
    this._exposeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
    this.clearCaches();
  }

  addExcludeMetadata(metadata: ExcludeMetadata): void {
    if (!this._excludeMetadatas.has(metadata.target)) {
      this._excludeMetadatas.set(metadata.target, new Map<string, ExcludeMetadata>());
    }
    this._excludeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
    this.clearCaches();
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  findTransformMetadatas(
    target: Function,
    propertyName: string,
    transformationType: TransformationType
  ): TransformMetadata[] {
    let targetCache = this._transformMetadatasCache.get(target);
    if (!targetCache) {
      targetCache = new Map<string, Map<TransformationType, TransformMetadata[]>>();
      this._transformMetadatasCache.set(target, targetCache);
    }
    let propertyCache = targetCache.get(propertyName);
    if (!propertyCache) {
      propertyCache = new Map<TransformationType, TransformMetadata[]>();
      targetCache.set(propertyName, propertyCache);
    } else if (propertyCache.has(transformationType)) {
      return propertyCache.get(transformationType);
    }

    const filteredMetadatas = this.findMetadatas(this._transformMetadatas, target, propertyName).filter(metadata => {
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
    propertyCache.set(transformationType, filteredMetadatas);
    return filteredMetadatas;
  }

  hasTransformMetadatas(target: Function): boolean {
    if (this._hasTransformMetadatasCache.has(target)) {
      return this._hasTransformMetadatasCache.get(target);
    }

    const targetMap = this._transformMetadatas.get(target);
    if (targetMap) {
      for (const metadatas of targetMap.values()) {
        if (metadatas && metadatas.length > 0) {
          this._hasTransformMetadatasCache.set(target, true);
          return true;
        }
      }
    }

    for (const ancestor of this.getAncestors(target)) {
      const ancestorMap = this._transformMetadatas.get(ancestor);
      if (!ancestorMap) continue;
      for (const metadatas of ancestorMap.values()) {
        if (metadatas && metadatas.length > 0) {
          this._hasTransformMetadatasCache.set(target, true);
          return true;
        }
      }
    }

    this._hasTransformMetadatasCache.set(target, false);
    return false;
  }

  findExcludeMetadata(target: Function, propertyName: string): ExcludeMetadata {
    return this.findMetadataCached(this._excludeMetadatas, this._excludeMetadataCache, target, propertyName);
  }

  findExposeMetadata(target: Function, propertyName: string): ExposeMetadata {
    return this.findMetadataCached(this._exposeMetadatas, this._exposeMetadataCache, target, propertyName);
  }

  findExposeMetadataByCustomName(target: Function, name: string): ExposeMetadata {
    let exposeByCustomName = this._exposeCustomNameCache.get(target);
    if (!exposeByCustomName) {
      exposeByCustomName = new Map<string, ExposeMetadata>();
      this._exposeCustomNameCache.set(target, exposeByCustomName);
      for (const metadata of this.getExposedMetadatas(target)) {
        if (metadata.options && metadata.options.name) {
          exposeByCustomName.set(metadata.options.name, metadata);
        }
      }
    }
    return exposeByCustomName.get(name);
  }

  findTypeMetadata(target: Function, propertyName: string): TypeMetadata {
    return this.findMetadataCached(this._typeMetadatas, this._typeMetadataCache, target, propertyName);
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
    return this.getMetadata(this._exposeMetadatas, target);
  }

  getExcludedMetadatas(target: Function): ExcludeMetadata[] {
    return this.getMetadata(this._excludeMetadatas, target);
  }

  getExposedProperties(target: Function, transformationType: TransformationType): string[] {
    let cachedByTarget = this._exposedPropertiesCache.get(target);
    if (!cachedByTarget) {
      cachedByTarget = new Map<TransformationType, string[]>();
      this._exposedPropertiesCache.set(target, cachedByTarget);
    } else if (cachedByTarget.has(transformationType)) {
      return cachedByTarget.get(transformationType);
    }

    const exposedProperties = this.getExposedMetadatas(target)
      .filter(metadata => {
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
      .map(metadata => metadata.propertyName);
    cachedByTarget.set(transformationType, exposedProperties);
    return exposedProperties;
  }

  getExcludedProperties(target: Function, transformationType: TransformationType): string[] {
    let cachedByTarget = this._excludedPropertiesCache.get(target);
    if (!cachedByTarget) {
      cachedByTarget = new Map<TransformationType, string[]>();
      this._excludedPropertiesCache.set(target, cachedByTarget);
    } else if (cachedByTarget.has(transformationType)) {
      return cachedByTarget.get(transformationType);
    }

    const excludedProperties = this.getExcludedMetadatas(target)
      .filter(metadata => {
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
      .map(metadata => metadata.propertyName);
    cachedByTarget.set(transformationType, excludedProperties);
    return excludedProperties;
  }

  clear(): void {
    this._typeMetadatas.clear();
    this._transformMetadatas.clear();
    this._exposeMetadatas.clear();
    this._excludeMetadatas.clear();
    this._ancestorsMap.clear();
    this.clearCaches();
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  private getMetadata<T extends { target: Function; propertyName: string }>(
    metadatas: Map<Function, Map<string, T>>,
    target: Function
  ): T[] {
    const metadataFromAncestorsAndTarget: T[] = [];
    for (const ancestor of this.getAncestors(target)) {
      const ancestorMetadataMap = metadatas.get(ancestor);
      if (ancestorMetadataMap) {
        for (const metadata of ancestorMetadataMap.values()) {
          if (metadata.propertyName !== undefined) {
            metadataFromAncestorsAndTarget.push(metadata);
          }
        }
      }
    }
    const metadataFromTargetMap = metadatas.get(target);
    if (metadataFromTargetMap) {
      for (const metadata of metadataFromTargetMap.values()) {
        if (metadata.propertyName !== undefined) {
          metadataFromAncestorsAndTarget.push(metadata);
        }
      }
    }
    return metadataFromAncestorsAndTarget;
  }

  private findMetadata<T extends { target: Function; propertyName: string }>(
    metadatas: Map<Function, Map<string, T>>,
    target: Function,
    propertyName: string
  ): T {
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

  private findMetadatas<T extends { target: Function; propertyName: string }>(
    metadatas: Map<Function, Map<string, T[]>>,
    target: Function,
    propertyName: string
  ): T[] {
    const metadataFromTargetMap = metadatas.get(target);
    const metadataFromTarget: T[] = metadataFromTargetMap ? metadataFromTargetMap.get(propertyName) || [] : [];
    const metadataFromAncestorsTarget: T[] = [];
    for (const ancestor of this.getAncestors(target)) {
      const ancestorMetadataMap = metadatas.get(ancestor);
      if (ancestorMetadataMap) {
        const ancestorMetadatas = ancestorMetadataMap.get(propertyName);
        if (ancestorMetadatas) {
          metadataFromAncestorsTarget.push(...ancestorMetadatas);
        }
      }
    }
    const reversedMetadatas: T[] = [];
    for (let index = metadataFromAncestorsTarget.length - 1; index >= 0; index--) {
      reversedMetadatas.push(metadataFromAncestorsTarget[index]);
    }
    for (let index = metadataFromTarget.length - 1; index >= 0; index--) {
      reversedMetadatas.push(metadataFromTarget[index]);
    }
    return reversedMetadatas;
  }

  private findMetadataCached<T extends { target: Function; propertyName: string }>(
    metadatas: Map<Function, Map<string, T>>,
    cache: Map<Function, Map<string, T>>,
    target: Function,
    propertyName: string
  ): T {
    let byProperty = cache.get(target);
    if (!byProperty) {
      byProperty = new Map<string, T>();
      cache.set(target, byProperty);
    } else if (byProperty.has(propertyName)) {
      return byProperty.get(propertyName);
    }

    const metadata = this.findMetadata(metadatas, target, propertyName);
    byProperty.set(propertyName, metadata);
    return metadata;
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
    return this._ancestorsMap.get(target);
  }

  private clearCaches(): void {
    this._transformMetadatasCache.clear();
    this._exposedPropertiesCache.clear();
    this._excludedPropertiesCache.clear();
    this._exposeCustomNameCache.clear();
    this._typeMetadataCache.clear();
    this._exposeMetadataCache.clear();
    this._excludeMetadataCache.clear();
    this._hasTransformMetadatasCache.clear();
  }
}
