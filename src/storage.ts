import { MetadataStorage } from './MetadataStorage';
import { getGlobal } from './utils';

const globalScope = getGlobal();

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
if (!globalScope.classTransformerMetadataStorage) {
  globalScope.classTransformerMetadataStorage = new MetadataStorage();
}

export const defaultMetadataStorage = globalScope.classTransformerMetadataStorage;
