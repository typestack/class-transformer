import 'reflect-metadata';
import { plainToInstance } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';

describe('Prevent array bomb when used with other packages', () => {
  it('should not convert specially crafted evil JS object to array', () => {
    defaultMetadataStorage.clear();

    class TestClass {
      readonly categories!: string[];
    }

    /**
     * We use the prototype of values to guess what is the type of the property. This behavior can be used
     * to pass a specially crafted array like object what would be transformed into an array.
     *
     * Because arrays are numerically indexed, specifying a big enough numerical property as key
     * would cause other libraries to iterate over each (undefined) element until the specified value is reached.
     * This can be used to cause denial-of-service attacks.
     *
     * An example of such scenario is the following:
     *
     * ```ts
     * class TestClass {
     *   @IsArray()
     *   @IsString({ each: true })
     *   readonly categories!: string[];
     * }
     * ```
     *
     * Using the above class definition with class-validator and receiving the following specially crafted payload without
     * the correct protection in place:
     *
     * `{ '9007199254740990': '9007199254740990', __proto__: [] };`
     *
     * would result in the creation of an array with length of 9007199254740991 (MAX_SAFE_INTEGER) looking like this:
     *
     * `[ <9007199254740989 empty elements>, 9007199254740990 ]`
     *
     * Iterating over this array would take significant time and cause the server to become unresponsive.
     */

    const evilObject = { '100000000': '100000000', __proto__: [] };
    const result = plainToInstance(TestClass, { categories: evilObject });

    expect(Array.isArray(result.categories)).toBe(false);
    expect(result.categories).toEqual({ '100000000': '100000000' });
  });
});
