import { MetadataStorage } from "./metadata/MetadataStorage";

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
// export const getDefaultMetadataStorage() = new MetadataStorage();


/**
 * Gets metadata args storage.
 * Metadata args storage follows the best practices and stores metadata in a global variable.
 */
export function getDefaultMetadataStorage(): MetadataStorage {
    if (!(global as any).classTranformerMetadataStorage)
        (global as any).classTranformerMetadataStorage = new MetadataStorage();

    return (global as any).classTranformerMetadataStorage;
}
