import 'es6-shim';
import 'reflect-metadata';
import { SimpleCollection } from './SimpleCollection';
import { User } from './User';
import { classToPlain, plainToClass, plainToClassFromExist } from '../../src/index';
import { SuperCollection } from './SuperCollection';

let collection = new SimpleCollection<User>();
collection.items = [new User(1, 'Johny', 'Cage', '*******'), new User(2, 'Dima', 'Cage', '*******')];
collection.count = 2;

// using generics works only for classToPlain operations, since in runtime we can
// "guess" type without type provided only we have a constructor, not plain object.

// console.log(classToPlain(collection));

// alternatively you can use factory method

let collectionJson = {
  items: [
    {
      id: 1,
      firstName: 'Johny',
      lastName: 'Cage',
      password: '*******',
    },
    {
      id: 2,
      firstName: 'Dima',
      lastName: 'Cage',
      password: '*******',
    },
  ],
};

console.log(plainToClassFromExist(new SuperCollection<User>(User), collectionJson));
