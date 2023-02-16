import { Transform, plainToInstance } from '../../src';

class Photo {
  type: string;
  filename: string;
}

class Portrait extends Photo {
  person: string;
  gender: string;
}

class Sports extends Photo {
  sport: string;
  origin: string;
}

export class Landscape extends Photo {
  local: string;

  getLocation(): string {
    return `The location of this picture is ${this.local.split('-')[1].trim()}`;
  }
}

export class Album {
  @Transform(({ value }) => {
    return value.map(item => {
      const options = {
        portrait: Portrait,
        sports: Sports,
        landscape: Landscape,
      };
      const obj = options[item.type];
      return plainToInstance(obj, item);
    });
  })
  photos: Array<Landscape | Portrait | Sports>;

  findByType<T>(type: string): T {
    return this.photos.find(item => item.type === type) as T;
  }
}
