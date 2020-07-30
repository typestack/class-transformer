import { ExcludeMetadata } from './exclude-metadata.interface';
import { ExposeMetadata } from './expose-metadata.interface';
import { TransformMetadata } from './transform-metadata.interface';
import { TypeMetadata } from './type-metadata.interface';

export type MetaDataType<T> = ExcludeMetadata<T> | ExposeMetadata<T> | TransformMetadata<T> | TypeMetadata<T>;
