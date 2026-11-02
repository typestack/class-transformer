import 'reflect-metadata';
import { plainToInstance, instanceToPlain, Type } from '../../src';

describe('Map inputs to plainToInstance', () => {
  it('preserves primitive Map values and clones the collection', () => {
    class Container {
      map: Map<string, string>;
    }
    const map = new Map([
      ['first', 'one'],
      ['second', 'two'],
    ]);
    const result = plainToInstance(Container, { map });
    expect(result.map).toBeInstanceOf(Map);
    expect(result.map).not.toBe(map);
    expect(result.map).toEqual(map);
    expect(instanceToPlain(result)).toEqual({ map: { first: 'one', second: 'two' } });
  });

  it('converts Map entries to the declared element type', () => {
    class Item {
      name: string;
    }
    class Container {
      @Type(() => Item)
      map: Map<string, Item>;
    }
    const entry = { name: 'one' };
    const result = plainToInstance(Container, { map: new Map([['first', entry]]) });
    expect(result.map.get('first')).toBeInstanceOf(Item);
    expect(result.map.get('first')).toEqual(entry);
    expect(result.map.get('first')).not.toBe(entry);
    expect(entry).toEqual({ name: 'one' });
    expect(plainToInstance(Container, { map: { first: entry } }).map).toEqual(result.map);
  });
});
