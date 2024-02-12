import { nested, exclude } from '../../src/decorators';

export class SuperCollection<T> {
  @exclude()
  private type: Function;

  @nested(options => {
    return (options.newObject as SuperCollection<T>).type;
  })
  items: T[];

  count: number;

  constructor(type: Function) {
    this.type = type;
  }
}
