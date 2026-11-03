import 'reflect-metadata';
import { instanceToPlain, plainToInstance, Transform } from '../../src';
import { defaultMetadataStorage } from '../../src/storage';

describe('clearing transformation metadata', () => {
  afterEach(() => defaultMetadataStorage.clear());

  it('removes transforms for the same class before metadata is registered again', () => {
    class Model {
      @Transform(({ value }) => `old:${value}`)
      value: string;
    }
    expect(plainToInstance(Model, { value: 'input' }).value).toBe('old:input');
    defaultMetadataStorage.clear();
    expect(plainToInstance(Model, { value: 'input' }).value).toBe('input');
    Transform(({ value }) => `new:${value}`)(Model.prototype, 'value');
    expect(plainToInstance(Model, { value: 'input' }).value).toBe('new:input');
    const model = new Model();
    model.value = 'input';
    expect(instanceToPlain(model)).toEqual({ value: 'new:input' });
  });
});
