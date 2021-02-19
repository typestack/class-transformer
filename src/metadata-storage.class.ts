import {
  TypeMetadata,
  ExposeMetadata,
  ExcludeMetadata,
  TransformMetadata,
  ClassConstructor,
  ClassDescriptor,
  MetaDataType,
  DecoratorMetaDataBag,
} from './interfaces';
import { TransformationType } from './enums';

/**
 * Storage all library metadata.
 */
export class MetadataStorage {
  /** Map storing the entire internal state of the library. */
  private metadataMap: Map<ClassConstructor<unknown>, ClassDescriptor<unknown>> = new Map();

  /** Map storing parent -> descendant[] info */
  private _ancestorsMap = new Map<ClassConstructor<unknown>, ClassConstructor<unknown>[]>();

  /**
   * Returns the class descriptor for the given class constructor. If no descriptor
   * exists yet it creates a new one.
   *
   * @param classCtr a class constructor
   */
  private getClassDescriptor<T = unknown>(classCtr: ClassConstructor<T>): ClassDescriptor<T> {
    if (this.metadataMap.has(classCtr)) {
      return this.metadataMap.get(classCtr) as ClassDescriptor<T>;
    } else {
      this.metadataMap.set(classCtr, {
        classCtr: classCtr,
        classMetadata: this.createMetadataBag(),
        propertyMetadata: {},
      });

      return this.metadataMap.get(classCtr) as ClassDescriptor<T>;
    }
  }

  /**
   * Creates an object matching the DecoratorMetaDataBag interface.
   */
  private createMetadataBag<T>(): DecoratorMetaDataBag<T> {
    return {
      expose: [],
      exclude: [],
      transform: undefined,
      type: undefined,
    };
  }

  /**
   * Inserts the received metadata in our internal metadata storage into the
   * correct place.
   *
   * @param metadata
   */
  public setMetaData<T = unknown>(metadata: MetaDataType<T>) {
    const classDescriptor = this.getClassDescriptor<T>(metadata.target);
    /** The metadata container we need to save the received metadata. */
    let targetMetaDataBag: DecoratorMetaDataBag<T>;

    /** The `propertyName` will be undefined when a decorator is called on a class. */
    if (typeof metadata.propertyName == 'string') {
      /** We are assigning the property on a property. */
      if (classDescriptor.propertyMetadata[metadata.propertyName]) {
        /** Property metadata already exists for this property. */
        targetMetaDataBag = classDescriptor.propertyMetadata[metadata.propertyName];
      } else {
        /** Property metadata doesn't exists yet for this property so we need to create it. */
        classDescriptor.propertyMetadata[metadata.propertyName] = this.createMetadataBag();

        targetMetaDataBag = classDescriptor.propertyMetadata[metadata.propertyName];
      }
    } else {
      /** We are assigning the property on a class. */
      targetMetaDataBag = classDescriptor.classMetadata;
    }

    switch (metadata.type) {
      case 'exclude':
      case 'expose':
        targetMetaDataBag[metadata.type].push(metadata as any);
        break;
      case 'transform':
      case 'type':
        if (targetMetaDataBag[metadata.type]) {
          throw new Error(`[MetadataStorage] Overwriting ${metadata.type} metadata is not allowed!`);
        }

        targetMetaDataBag[metadata.type] = metadata as any;
        break;
      default:
        throw new Error(`[MetadataStorage] Received invalid metadata type while trying to assign metadata.`);
    }
  }

  public findTransformMetadatas(
    target: ClassConstructor<any>,
    propertyName: string,
    transformationType: TransformationType
  ): TransformMetadata<unknown>[] {
    return this.findMetadata<TransformMetadata<unknown>>('transform', target, propertyName).filter(metadata => {
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

  findExposeMetadata(target: ClassConstructor<any>, propertyName: string): ExposeMetadata | undefined {
    return this.findMetadata<ExposeMetadata>('expose', target, propertyName)[0];
  }

  public findTypeMetadata(target: ClassConstructor<any>, propertyName: string): TypeMetadata {
    return this.findMetadata<TypeMetadata>('type', target, propertyName)[0];
  }

  public findExposeMetadataByCustomName(target: ClassConstructor<any>, name: string): ExposeMetadata | undefined {
    return this.getExposedMetadatas(target).find(metadata => {
      return metadata.options && metadata.options.name === name;
    });
  }

  private getExposedMetadatas(target: ClassConstructor<any>): ExposeMetadata[] {
    return this.findMetadata<ExposeMetadata>('expose', target, undefined);
  }

  private getExcludedMetadatas(target: ClassConstructor<any>): ExcludeMetadata[] {
    return this.findMetadata<ExcludeMetadata>('exclude', target, undefined);
  }

  public getExposedProperties(target: ClassConstructor<any>, transformationType: TransformationType): string[] {
    return this.findMetadata<ExposeMetadata<unknown>>('expose', target)
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
      .map(metadata => metadata.propertyName as string);
  }

  public getExcludedProperties(target: ClassConstructor<any>, transformationType: TransformationType): string[] {
    return this.getExcludedMetadatas(target)
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
      .map(metadata => metadata.propertyName as string);
  }

  public clear(): void {
    this.metadataMap.clear();
  }

  private findMetadata<T>(
    type: 'exclude' | 'expose' | 'type' | 'transform',
    target: ClassConstructor<any>,
    propertyName?: string
  ): T[] {
    let first = [];
    let second = [];
    /** if propertyName undefined we want the metadata for the class if string the for the given property */
    // if(propertyName == undefined) {
    //   const classProp = this.metadataMap.get(target)?.classMetadata[type];

    //   if(classProp) {
    //     first = Array.isArray(classProp) ? classProp : [classProp] as any[];
    //   }

    //   for (const ancestor of this.getAncestors(target)) {
    //     const classProp = this.metadataMap.get(ancestor)?.classMetadata[type];
    //     if (classProp) {
    //       second = Array.isArray(classProp) ? classProp : [classProp] as any[];
    //     }
    //   }
    // }

    // When the property is marked with Exclude and we request the excludes without property
    // we would like to get all the values from properties not from the class.
    if (propertyName == undefined && this.metadataMap.get(target)?.propertyMetadata) {
      const classProp = Object.entries(
        (this.metadataMap.get(target) as ClassDescriptor<unknown>).propertyMetadata
      ).reduce((acc, [propertyName, value]) => {
        const x = value[type];
        return [...acc, ...(x as any)];
      }, []);

      if (classProp) {
        first = Array.isArray(classProp) ? classProp : ([classProp] as any[]);
      }

      // Below is wrong should do the same as above
      for (const ancestor of this.getAncestors(target)) {
        const classProp = this.metadataMap.get(ancestor)?.classMetadata[type];
        if (classProp) {
          second = Array.isArray(classProp) ? classProp : ([classProp] as any[]);
        }
      }
    }

    if (propertyName != undefined) {
      const classProp = this.metadataMap.get(target)?.propertyMetadata[propertyName]?.[type];

      if (classProp) {
        first = Array.isArray(classProp) ? classProp : ([classProp] as any[]);
      }

      for (const ancestor of this.getAncestors(target)) {
        const classProp = this.metadataMap.get(ancestor)?.propertyMetadata[propertyName]?.[type];
        if (classProp) {
          second = Array.isArray(classProp) ? classProp : ([classProp] as any[]);
        }
      }
    }

    // console.log({ target: target.name, propertyName, first, second });
    // console.log(this.metadataMap)
    // one function returned when the first search is valid
    // other one returned only after it looked in both places
    // return first?.length ? first : second;
    return [...first, ...second];
  }

  /**
   * Returns the guessed strategy based on the currently assigned operators:
   *  - if there is one class level Expose operator it returns exposeAll
   *  - if there is one class level Exclude operator it returns excludeAll
   *  - if neither of the above statements are true it returns ''
   */
  getStrategy(target: ClassConstructor<unknown>): 'excludeAll' | 'exposeAll' | 'none' {
    if (this.metadataMap.has(target)) {
      const classDescriptor = this.metadataMap.get(target) as ClassDescriptor<unknown>;
      const hasClassExpose = classDescriptor.classMetadata.expose.length;
      const hasClassExclude = classDescriptor.classMetadata.exclude.length;

      if ((hasClassExclude && hasClassExpose) || (!hasClassExclude && !hasClassExpose)) {
        return 'none';
      }

      return hasClassExclude ? 'excludeAll' : 'exposeAll';
    }

    return 'none';
  }

  private getAncestors(target: ClassConstructor<unknown>): ClassConstructor<unknown>[] {
    if (!target) return [];
    if (!this._ancestorsMap.has(target)) {
      const ancestors: ClassConstructor<unknown>[] = [];

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
