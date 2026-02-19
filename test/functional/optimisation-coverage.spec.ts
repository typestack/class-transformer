import 'reflect-metadata';
import { Expose, instanceToInstance, plainToInstance, Transform, Type } from '../../src';
import { TransformationType } from '../../src';
import { MetadataStorage } from '../../src/MetadataStorage';
import { defaultMetadataStorage } from '../../src/storage';

describe('optimisation coverage', () => {
  beforeEach(() => {
    defaultMetadataStorage.clear();
  });

  it('uses targetMaps cache path for property type resolution', () => {
    class Profile {
      id: number;
    }

    class User {
      profile: Profile;
    }

    const user = plainToInstance(
      User,
      { profile: { id: 7 } },
      {
        targetMaps: [
          { target: User, properties: {} },
          { target: User, properties: { profile: Profile } },
        ],
      }
    );

    expect(user.profile).toBeInstanceOf(Profile);
    expect(user.profile.id).toBe(7);
  });

  it('falls back to array when reflected collection type is not push-compatible', () => {
    class NonArrayCollection {
      marker = true;
    }

    class Payload {
      @Type(() => Number)
      values: NonArrayCollection;
    }

    const payload = plainToInstance(Payload, { values: [1, 2, 3] });

    expect(Array.isArray(payload.values)).toBe(true);
    expect(payload.values).toEqual([1, 2, 3]);
  });

  it('keeps circular set entries for class-to-class with circular checks enabled', () => {
    class Node {
      children: Set<Node> = new Set<Node>();
    }

    const root = new Node();
    root.children.add(root);

    const cloned = instanceToInstance(root, { enableCircularCheck: true });
    const circularChildren = cloned.children as unknown as any[];

    expect(Array.isArray(circularChildren)).toBe(true);
    expect(circularChildren.length).toBe(1);
    expect(circularChildren[0]).toBe(root);
  });

  it('handles circular map self reference in class-to-class path', () => {
    const source = new Map<string, any>();
    source.set('self', source);

    const cloned = instanceToInstance(source, { enableCircularCheck: true });

    expect(cloned).toBeInstanceOf(Map);
    expect(cloned).not.toBe(source);
    expect(cloned.get('self')).toBe(source);
  });

  it('resolves transform metadata from ancestors and caches hasTransformMetadatas', () => {
    const storage = new MetadataStorage();

    class Base {}
    class Child extends Base {}

    storage.addTransformMetadata({
      target: Base,
      propertyName: 'value',
      transformFn: params => params.value,
      options: {},
    });

    expect(storage.hasTransformMetadatas(Child)).toBe(true);
    expect(storage.hasTransformMetadatas(Child)).toBe(true);
    expect(storage.findTransformMetadatas(Child, 'value', TransformationType.CLASS_TO_CLASS)).toHaveLength(1);
  });

  it('rebuilds custom expose-name lookup cache after metadata updates', () => {
    const storage = new MetadataStorage();

    class User {}

    storage.addExposeMetadata({
      target: User,
      propertyName: 'name',
      options: { name: 'display_name' },
    });

    expect(storage.findExposeMetadataByCustomName(User, 'display_name')!.propertyName).toBe('name');
    expect(storage.findExposeMetadataByCustomName(User, 'missing')).toBeUndefined();

    storage.addExposeMetadata({
      target: User,
      propertyName: 'age',
      options: { name: 'years' },
    });

    expect(storage.findExposeMetadataByCustomName(User, 'years')!.propertyName).toBe('age');
  });

  it('returns expose and exclude metadata through cached wrappers', () => {
    const storage = new MetadataStorage();

    class User {}

    storage.addExposeMetadata({
      target: User,
      propertyName: 'visible',
      options: {},
    });
    storage.addExcludeMetadata({
      target: User,
      propertyName: 'hidden',
      options: {},
    });

    expect(storage.findExposeMetadata(User, 'visible')!.propertyName).toBe('visible');
    expect(storage.findExposeMetadata(User, 'visible')!.propertyName).toBe('visible');
    expect(storage.findExcludeMetadata(User, 'hidden')!.propertyName).toBe('hidden');
    expect(storage.findExcludeMetadata(User, 'hidden')!.propertyName).toBe('hidden');
  });

  it('filters transform metadata by groups and version options', () => {
    class Model {
      @Transform(({ value }) => value, { groups: ['public'], since: 1, until: 3 })
      value: string;
    }

    const result = plainToInstance(Model, { value: 'ok' }, { groups: ['public'], version: 2 });
    expect(result.value).toBe('ok');
  });

  it('uses per-executor caches for transform metadata and reflected design types', () => {
    class Model {
      @Transform(({ value }) => `${value}-ok`)
      text: string;

      @Expose()
      count: number;
    }

    const values = plainToInstance(
      Model,
      [
        { text: 'a', count: '1' },
        { text: 'b', count: '2' },
      ],
      { enableImplicitConversion: true }
    );

    expect(values[0].text).toBe('a-ok');
    expect(values[1].text).toBe('b-ok');
    expect(values[0].count).toBe(1);
    expect(values[1].count).toBe(2);
  });
});
