import { TypeMetadata, ExposeMetadata, ExcludeMetadata, TransformMetadata } from './interfaces';
import { TransformationType } from './enums';
import { checkVersion, flatten, onlyUnique } from './utils';

/**
 * Storage all library metadata.
 */
export class MetadataStorage {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  private _typeMetadatas = new Map<Function, Map<string, TypeMetadata>>();
  private _transformMetadatas = new Map<Function, Map<string, TransformMetadata[]>>();
  private _exposeMetadatas = new Map<Function, Map<string, ExposeMetadata[]>>();
  private _excludeMetadatas = new Map<Function, Map<string, ExcludeMetadata[]>>();
  private _ancestorsMap = new Map<Function, Function[]>();

  // -------------------------------------------------------------------------
  // Static Methods
  // -------------------------------------------------------------------------

  private static checkMetadataTransformationType<
    T extends { options?: { toClassOnly?: boolean; toPlainOnly?: boolean } }
  >(transformationType: TransformationType, metadata: T): boolean {
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
  }

  // -------------------------------------------------------------------------
  // Adder Methods
  // -------------------------------------------------------------------------

  addTypeMetadata(metadata: TypeMetadata): void {
    if (!this._typeMetadatas.has(metadata.target)) {
      this._typeMetadatas.set(metadata.target, new Map<string, TypeMetadata>());
    }
    this._typeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
  }

  addTransformMetadata(metadata: TransformMetadata): void {
    if (!this._transformMetadatas.has(metadata.target)) {
      this._transformMetadatas.set(metadata.target, new Map<string, TransformMetadata[]>());
    }
    if (!this._transformMetadatas.get(metadata.target).has(metadata.propertyName)) {
      this._transformMetadatas.get(metadata.target).set(metadata.propertyName, []);
    }
    this._transformMetadatas.get(metadata.target).get(metadata.propertyName).push(metadata);
  }

  addExposeMetadata(metadata: ExposeMetadata): void {
    const { toPlainOnly, toClassOnly, name = metadata.propertyName } = metadata.options || {};

    /**
     * check if toPlainOnly and toClassOnly used correctly.
     */
    if (
      metadata.propertyName &&
      !(toPlainOnly === true || toClassOnly === true || (toClassOnly === undefined && toPlainOnly === undefined))
    ) {
      throw Error(
        `${metadata.propertyName}: At least one of "toPlainOnly" and "toClassOnly" options must be "true" or both must be "undefined"`
      );
    }

    if (!this._exposeMetadatas.has(metadata.target)) {
      this._exposeMetadatas.set(metadata.target, new Map<string, ExposeMetadata[]>());
    }
    if (!this._exposeMetadatas.get(metadata.target).has(metadata.propertyName)) {
      this._exposeMetadatas.get(metadata.target).set(metadata.propertyName, []);
    }
    const exposeArray = this._exposeMetadatas.get(metadata.target).get(metadata.propertyName);

    /**
     * check if the current @expose does not conflict with the former decorators.
     */
    const conflictedItemIndex = exposeArray!.findIndex(m => {
      const { name: n = m.propertyName, since: s, until: u, toPlainOnly: tpo, toClassOnly: tco } = m.options ?? {};

      /**
       * check whether the intervals intersect or not.
       */
      const s1 = s ?? Number.NEGATIVE_INFINITY;
      const u1 = u ?? Number.POSITIVE_INFINITY;
      const s2 = metadata.options?.since ?? Number.NEGATIVE_INFINITY;
      const u2 = metadata.options?.until ?? Number.POSITIVE_INFINITY;

      const intervalIntersection = s1 < u2 && s2 < u1;

      /**
       * check whether the current decorator's transformation types,
       * means "toPlainOnly" and "toClassOnly" options,
       * are common with the previous decorators or not.
       */
      const mType = tpo === undefined && tco === undefined ? 3 : (tpo ? 1 : 0) + (tco ? 2 : 0);
      const currentType =
        toPlainOnly === undefined && toClassOnly === undefined ? 3 : (toPlainOnly ? 1 : 0) + (toClassOnly ? 2 : 0);
      const commonInType = !!(mType & currentType);

      /**
       * check if the current "name" option
       * is different with the imported decorators or not.
       */
      const differentName = n !== name;

      return intervalIntersection && commonInType && differentName;
    });
    if (conflictedItemIndex !== -1) {
      const conflictedItem = exposeArray![conflictedItemIndex];
      throw Error(
        `"${metadata.propertyName ?? ''}" property:
           The current decorator (decorator #${
             exposeArray!.length
           }) conflicts with the decorator #${conflictedItemIndex}.
           If the stacked decorators intersect, the name option must be the same.
           
           @Expose(${JSON.stringify(metadata.options || {})})
           conflicts with
           @Expose(${JSON.stringify(conflictedItem.options || {})})`
      );
    }

    exposeArray?.push(metadata);
  }

  addExcludeMetadata(metadata: ExcludeMetadata): void {
    if (!this._excludeMetadatas.has(metadata.target)) {
      this._excludeMetadatas.set(metadata.target, new Map<string, ExcludeMetadata[]>());
    }
    if (!this._excludeMetadatas.get(metadata.target).has(metadata.propertyName)) {
      this._excludeMetadatas.get(metadata.target).set(metadata.propertyName, []);
    }
    this._excludeMetadatas.get(metadata.target).get(metadata.propertyName).push(metadata);
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  findTransformMetadatas(
    target: Function,
    propertyName: string,
    transformationType: TransformationType
  ): TransformMetadata[] {
    const typeChecker = MetadataStorage.checkMetadataTransformationType.bind(this, transformationType);
    return this.findMetadatas(this._transformMetadatas, target, propertyName).filter(typeChecker);
  }

  findExcludeMetadatas(
    target: Function,
    propertyName: string,
    transformationType: TransformationType
  ): ExcludeMetadata[] {
    const typeChecker = MetadataStorage.checkMetadataTransformationType.bind(this, transformationType);
    return this.findMetadatas(this._excludeMetadatas, target, propertyName).filter(typeChecker);
  }

  findExposeMetadatas(
    target: Function,
    propertyName: string,
    transformationType: TransformationType
  ): ExposeMetadata[] {
    const typeChecker = MetadataStorage.checkMetadataTransformationType.bind(this, transformationType);
    return this.findMetadatas(this._exposeMetadatas, target, propertyName).filter(typeChecker);
  }

  findExposeMetadatasByCustomName(target: Function, name: string): ExposeMetadata[] {
    return this.getExposedMetadatas(target).filter(metadata => {
      return metadata.options && metadata.options.name === name;
    });
  }

  findTypeMetadata(target: Function, propertyName: string): TypeMetadata {
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
    return this.getMetadata(this._exposeMetadatas, target);
  }

  getExcludedMetadatas(target: Function): ExcludeMetadata[] {
    return this.getMetadata(this._excludeMetadatas, target);
  }

  getExposedProperties(
    target: Function,
    transformationType: TransformationType,
    options: { version?: number } = {}
  ): string[] {
    const typeChecker = MetadataStorage.checkMetadataTransformationType.bind(this, transformationType);
    const { version } = options;
    let array = this.getExposedMetadatas(target).filter(typeChecker);
    if (version) {
      array = array.filter(metadata => checkVersion(version, metadata?.options?.since, metadata?.options?.until));
    }
    return array.map(metadata => metadata.propertyName!).filter(onlyUnique);
  }

  getExcludedProperties(target: Function, transformationType: TransformationType): string[] {
    const typeChecker = MetadataStorage.checkMetadataTransformationType.bind(this, transformationType);
    return this.getExcludedMetadatas(target)
      .filter(typeChecker)
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
    metadatas: Map<Function, Map<string, T[]>>,
    target: Function
  ): T[] {
    const metadataFromTargetMap = metadatas.get(target);
    let metadataFromTarget: T[] = [];
    if (metadataFromTargetMap) {
      metadataFromTarget = flatten(Array.from(metadataFromTargetMap.values())).filter(
        meta => meta.propertyName !== undefined
      );
    }
    const metadataFromAncestors: T[] = [];
    for (const ancestor of this.getAncestors(target)) {
      const ancestorMetadataMap = metadatas.get(ancestor);
      if (ancestorMetadataMap) {
        const metadataFromAncestor = flatten(Array.from(ancestorMetadataMap.values())).filter(
          meta => meta.propertyName !== undefined
        );
        metadataFromAncestors.push(...metadataFromAncestor);
      }
    }
    return metadataFromAncestors.concat(metadataFromTarget);
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

  private findMetadatas<T extends { target: Function; propertyName: string | undefined }>(
    metadatas: Map<Function, Map<string, T[]>>,
    target: Function,
    propertyName: string
  ): T[] {
    const metadataFromTargetMap = metadatas.get(target);
    let metadataFromTarget: T[] = [];
    if (metadataFromTargetMap) {
      metadataFromTarget = metadataFromTargetMap.get(propertyName) ?? [];
    }
    const metadataFromAncestorsTarget: T[] = [];
    for (const ancestor of this.getAncestors(target)) {
      const ancestorMetadataMap = metadatas.get(ancestor);
      if (ancestorMetadataMap) {
        if (ancestorMetadataMap.has(propertyName)) {
          metadataFromAncestorsTarget.push(...ancestorMetadataMap.get(propertyName));
        }
      }
    }
    return metadataFromAncestorsTarget.slice().reverse().concat(metadataFromTarget.slice().reverse());
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
}
