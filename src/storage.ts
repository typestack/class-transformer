import {MetadataStorage} from "./metadata/MetadataStorage";

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export const defaultMetadataStorage = new MetadataStorage();
