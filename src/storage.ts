import { getMetadataStorage } from './MetadataStorage';

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export const defaultMetadataStorage = getMetadataStorage();
