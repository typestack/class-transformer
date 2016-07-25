import {ClassTransformOptions} from "./ClassTransformOptions";
import {defaultMetadataStorage} from "./index";

export type TransformationType = "plainToClass"|"classToPlain"|"classToClass";

export class TransformOperationExecutor {

    // -------------------------------------------------------------------------
    // Private Properties
    // -------------------------------------------------------------------------

    private transformedTypes: { level: number, object: Object }[] = [];

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private transformationType: TransformationType,
                private options: ClassTransformOptions) {
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    transform(source: Object|Object[]|any,
                value: Object|Object[]|any,
                targetType: Function,
                arrayType: Function,
                level: number = 0) {

        if (value instanceof Array) {
            const newValue = arrayType && this.transformationType === "plainToClass" ? new (arrayType as any)() : [];
            (value as any[]).forEach((subValue, index) => {
                const subSource = source ? source[index] : undefined;
                if (!this.isCircular(subValue, level))
                    newValue.push(this.transform(subSource, subValue, targetType, undefined, level + 1));
            });
            return newValue;

        } else if (targetType === String) {
            return String(value);

        } else if (targetType === Number) {
            return Number(value);

        } else if (targetType === Boolean) {
            return Boolean(value);

        } else if (targetType === Date || value instanceof Date) {
            if (value instanceof Date) {
                return new Date(value.getTime());
            }
            return new Date(value);

        } else if (value instanceof Object) {

            // try to guess the type
            if (!targetType && value.constructor !== Object/* && operationType === "classToPlain"*/) targetType = value.constructor;
            if (!targetType && source) targetType = source.constructor;

            // add transformed type to prevent circular references
            this.transformedTypes.push({ level: level, object: value });

            const keys = this.getKeys(targetType, value);
            let newValue: any = source ? source : {};
            if (!source && (this.transformationType === "plainToClass" || this.transformationType === "classToClass")) {
                newValue = new (targetType as any)();
            }

            // traverse over keys
            for (let key of keys) {

                let valueKey = key, newValueKey = key, propertyName = key;
                if (this.transformationType === "plainToClass") {
                    const exposeMetadata = defaultMetadataStorage.findExposeMetadataByCustomName(targetType, key);
                    if (exposeMetadata) {
                        propertyName = exposeMetadata.propertyName;
                        newValueKey = exposeMetadata.propertyName;
                    }

                } else if (this.transformationType === "classToPlain" || this.transformationType === "classToClass") {
                    const exposeMetadata = defaultMetadataStorage.findExposeMetadata(targetType, key);
                    if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name)
                        newValueKey = exposeMetadata.options.name;
                }

                let type = this.getKeyType(value, targetType, propertyName);

                // if value is an array try to get its custom array type
                const arrayType = value[valueKey] instanceof Array ? this.getReflectedType(targetType, propertyName) : undefined;
                // const subValueKey = operationType === "plainToClass" && newKeyName ? newKeyName : key;
                const subValue = value[valueKey] instanceof Function ? value[valueKey]() : value[valueKey];
                const subSource = source ? source[valueKey] : undefined;

                // if its deserialization then type if required
                if (this.transformationType === "plainToClass" && !type && subValue instanceof Object && !(subValue instanceof Date))
                    throw new Error(`Cannot determine type for ${(targetType as any).name }.${propertyName}, did you forgot to specify a @Type?`);

                // if newValue is a source object that has method that match newKeyName then skip it
                let hasDescriptor = false;
                if (newValue.constructor.prototype) {
                    const descriptor = Object.getOwnPropertyDescriptor(newValue.constructor.prototype, newValueKey);
                    hasDescriptor = !!descriptor;
                    if ((this.transformationType === "plainToClass" || this.transformationType === "classToClass") && (newValue[newValueKey] instanceof Function || descriptor)) //  || operationType === "classToClass"
                        continue;
                }

                if (!this.isCircular(subValue, level))
                    newValue[newValueKey] = this.transform(subSource, subValue, type, arrayType, level + 1);
            }
            return newValue;

        } else {
            return value;
        }
    }

    // preventing circular references
    private isCircular(object: Object, level: number) {
        return !!this.transformedTypes.find(transformed => transformed.object === object && transformed.level < level);
    }

    private getKeyType(object: Object, target: Function, key: string) {
        if (!target) return undefined;
        const metadata = defaultMetadataStorage.findTypeMetadata(target, key);
        return metadata ? metadata.typeFunction(object) : undefined;
    }

    private getReflectedType(target: Function, propertyName: string) {
        if (!target) return undefined;
        const meta = defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.reflectedType : undefined;
    }

    private getKeys(target: Function, object: Object): string[] {

        // determine exclusion strategy
        let strategy = defaultMetadataStorage.getStrategy(target);
        if (strategy === "none")
            strategy = this.options.strategy || "exposeAll"; // exposeAll is default strategy

        // get all keys that need to expose
        let keys: string[] = strategy === "exposeAll" ? Object.keys(object) : [];

        // add all exposed to list of keys
        let exposedProperties = defaultMetadataStorage.getExposedProperties(target, this.transformationType);
        if (this.transformationType === "plainToClass") {
            exposedProperties = exposedProperties.map(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                    return exposeMetadata.options.name;
                }

                return key;
            });
        }
        keys = keys.concat(exposedProperties);

        // exclude excluded properties
        const excludedProperties = defaultMetadataStorage.getExcludedProperties(target, this.transformationType);
        if (excludedProperties.length > 0) {
            keys = keys.filter(key => {
                return excludedProperties.indexOf(key) === -1;
            });
        }

        // apply versioning options
        if (this.options.version !== undefined) {
            keys = keys.filter(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                if (!exposeMetadata || !exposeMetadata.options)
                    return true;

                let decision = true;
                if (decision && exposeMetadata.options.since)
                    decision = this.options.version >= exposeMetadata.options.since;
                if (decision && exposeMetadata.options.until)
                    decision = this.options.version < exposeMetadata.options.until;

                return decision;
            });
        }

        // apply grouping options
        if (this.options.groups && this.options.groups.length) {
            keys = keys.filter(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                if (!exposeMetadata || !exposeMetadata.options || !exposeMetadata.options.groups)
                    return true;

                return this.options.groups.some(optionGroup => exposeMetadata.options.groups.indexOf(optionGroup) !== -1);
            });
        } else {
            keys = keys.filter(key => {
                const exposeMetadata = defaultMetadataStorage.findExposeMetadata(target, key);
                return  !exposeMetadata ||
                        !exposeMetadata.options ||
                        !exposeMetadata.options.groups ||
                        !exposeMetadata.options.groups.length;
            });
        }

        // exclude prefixed properties
        if (this.options.excludePrefixes && this.options.excludePrefixes.length) {
            keys = keys.filter(key => this.options.excludePrefixes.every(prefix => {
                return key.substr(0, prefix.length) !== prefix;
            }));
        }

        // make sure we have unique keys
        keys = keys.filter((key, index, self) => {
            return self.indexOf(key) === index;
        });

        // todo: also need to include onSerialize/onDeserialize

        return keys;
    }

}