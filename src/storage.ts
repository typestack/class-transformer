import { MetadataStorage } from './MetadataStorage';
import { MetadataStorage as NewStorage } from './metadata-storage.class';

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export const defaultMetadataStorage = new NewStorage();
