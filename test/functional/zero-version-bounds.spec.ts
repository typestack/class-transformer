import 'reflect-metadata';
import { Expose, Transform, instanceToPlain, plainToInstance } from '../../src';

describe('version bounds at zero', () => {
  it('applies since and until zero to exposed properties in both directions', () => {
    class Model {
      @Expose({ since: 0 })
      current: string;
      @Expose({ until: 0 })
      legacy: string;
      always: string;
    }
    const input = { current: 'current', legacy: 'legacy', always: 'always' };
    const model = Object.assign(new Model(), input);
    for (const version of [-1, 0, 1]) {
      const expected = version < 0 ? { legacy: 'legacy', always: 'always' } : { current: 'current', always: 'always' };
      expect(plainToInstance(Model, input, { version })).toEqual(expected);
      expect(instanceToPlain(model, { version })).toEqual(expected);
    }
    expect(instanceToPlain(model)).toEqual(input);
  });

  it('applies since and until zero to transform callbacks in both directions', () => {
    class Model {
      @Transform(({ value }) => `new:${value}`, { since: 0 })
      current: string;
      @Transform(({ value }) => `old:${value}`, { until: 0 })
      legacy: string;
    }
    const input = { current: 'value', legacy: 'value' };
    const model = Object.assign(new Model(), input);
    for (const version of [-1, 0, 1]) {
      const expected =
        version < 0 ? { current: 'value', legacy: 'old:value' } : { current: 'new:value', legacy: 'value' };
      expect(plainToInstance(Model, input, { version })).toEqual(expected);
      expect(instanceToPlain(model, { version })).toEqual(expected);
    }
  });
});
