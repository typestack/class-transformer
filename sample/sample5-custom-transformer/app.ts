import 'es6-shim';
import 'reflect-metadata';
import { plainToInstance, instanceToPlain } from '../../src/index';
import { User } from './User';

let userJson = {
  id: 1,
  name: 'Johny Cage',
  date: new Date().valueOf(),
};

console.log(plainToInstance(User, userJson));

const user = new User();
user.id = 1;
user.name = 'Johny Cage';
user.date = new Date();

console.log(instanceToPlain(user));
