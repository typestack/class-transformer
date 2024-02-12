> This repository is a fork of the original [`class-transformer`](https://github.com/typestack/class-transformer) package. Its goal is to enhance API usability through continuous updates. This repository will be maintained and will always accept pull requests. Please note that the API is still subject to changes.

# class-transform

![Build Status](https://github.com/cunarist/class-transform/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/class-transform.svg)](https://badge.fury.io/js/class-transform)

Its ES6 and Typescript era. Nowadays you are working with classes and constructor objects more than ever.
Class-transformer allows you to transform plain object to some instance of class and versa.
Also it allows to serialize / deserialize object based on criteria.
This tool is super useful on both frontend and backend.

Example how to use with angular 2 in [plunker](http://plnkr.co/edit/Mja1ZYAjVySWASMHVB9R).
Source code is available [here](https://github.com/pleerock/class-transform-demo).

## Table of contents

- [class-transform](#class-transform)
  - [Table of contents](#table-of-contents)
  - [What is class-transform(#table-of-contents)](#what-is-class-transformtable-of-contents)
  - [Installation(#table-of-contents)](#installationtable-of-contents)
    - [Node.js(#table-of-contents)](#nodejstable-of-contents)
    - [Browser(#table-of-contents)](#browsertable-of-contents)
  - [Methods(#table-of-contents)](#methodstable-of-contents)
    - [plainToClass(#table-of-contents)](#plaintoclasstable-of-contents)
    - [plainToClassFromExist(#table-of-contents)](#plaintoclassfromexisttable-of-contents)
    - [classToPlain(#table-of-contents)](#classtoplaintable-of-contents)
    - [instanceToInstance(#table-of-contents)](#instancetoinstancetable-of-contents)
    - [serialize(#table-of-contents)](#serializetable-of-contents)
    - [deserialize and deserializeArray(#table-of-contents)](#deserialize-and-deserializearraytable-of-contents)
  - [Enforcing type-safe instance(#table-of-contents)](#enforcing-type-safe-instancetable-of-contents)
  - [Working with nested objects(#table-of-contents)](#working-with-nested-objectstable-of-contents)
    - [Providing more than one type option(#table-of-contents)](#providing-more-than-one-type-optiontable-of-contents)
  - [Exposing getters and method return values(#table-of-contents)](#exposing-getters-and-method-return-valuestable-of-contents)
  - [Exposing properties with different names(#table-of-contents)](#exposing-properties-with-different-namestable-of-contents)
  - [Skipping specific properties(#table-of-contents)](#skipping-specific-propertiestable-of-contents)
  - [Skipping depend of operation(#table-of-contents)](#skipping-depend-of-operationtable-of-contents)
  - [Skipping all properties of the class(#table-of-contents)](#skipping-all-properties-of-the-classtable-of-contents)
  - [Skipping private properties, or some prefixed properties(#table-of-contents)](#skipping-private-properties-or-some-prefixed-propertiestable-of-contents)
  - [Using groups to control excluded properties(#table-of-contents)](#using-groups-to-control-excluded-propertiestable-of-contents)
  - [Using versioning to control exposed and excluded properties(#table-of-contents)](#using-versioning-to-control-exposed-and-excluded-propertiestable-of-contents)
  - [Сonverting date strings into Date objects(#table-of-contents)](#сonverting-date-strings-into-date-objectstable-of-contents)
  - [Working with arrays(#table-of-contents)](#working-with-arraystable-of-contents)
  - [Additional data transformation(#table-of-contents)](#additional-data-transformationtable-of-contents)
    - [Basic usage(#table-of-contents)](#basic-usagetable-of-contents)
    - [Advanced usage(#table-of-contents)](#advanced-usagetable-of-contents)
  - [Other decorators(#table-of-contents)](#other-decoratorstable-of-contents)
  - [Working with generics(#table-of-contents)](#working-with-genericstable-of-contents)
  - [Implicit type conversion(#table-of-contents)](#implicit-type-conversiontable-of-contents)
  - [How does it handle circular references?(#table-of-contents)](#how-does-it-handle-circular-referencestable-of-contents)
  - [Example with Angular2(#table-of-contents)](#example-with-angular2table-of-contents)
  - [Samples(#table-of-contents)](#samplestable-of-contents)
  - [Release notes(#table-of-contents)](#release-notestable-of-contents)

## What is class-transform(#table-of-contents)

In JavaScript there are two types of objects:

- plain (literal) objects
- class (constructor) objects

Plain objects are objects that are instances of `Object` class.
Sometimes they are called **literal** objects, when created via `{}` notation.
Class objects are instances of classes with own defined constructor, properties and methods.
Usually you define them via `class` notation.

So, what is the problem?

Sometimes you want to transform plain javascript object to the ES6 **classes** you have.
For example, if you are loading a json from your backend, some api or from a json file,
and after you `JSON.parse` it you have a plain javascript object, not instance of class you have.

For example you have a list of users in your `users.json` that you are loading:

```json
[
  {
    "id": 1,
    "firstName": "Johny",
    "lastName": "Cage",
    "age": 27
  },
  {
    "id": 2,
    "firstName": "Ismoil",
    "lastName": "Somoni",
    "age": 50
  },
  {
    "id": 3,
    "firstName": "Luke",
    "lastName": "Dacascos",
    "age": 12
  }
]
```

And you have a `User` class:

```typescript
export class User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;

  getName() {
    return this.firstName + ' ' + this.lastName;
  }

  isAdult() {
    return this.age > 36 && this.age < 60;
  }
}
```

You are assuming that you are downloading users of type `User` from `users.json` file and may want to write
following code:

```typescript
fetch('users.json').then((users: User[]) => {
  // you can use users here, and type hinting also will be available to you,
  //  but users are not actually instances of User class
  // this means that you can't use methods of User class
});
```

In this code you can use `users[0].id`, you can also use `users[0].firstName` and `users[0].lastName`.
However you cannot use `users[0].getName()` or `users[0].isAdult()` because "users" actually is
array of plain javascript objects, not instances of User object.
You actually lied to compiler when you said that its `users: User[]`.

So what to do? How to make a `users` array of instances of `User` objects instead of plain javascript objects?
Solution is to create new instances of User object and manually copy all properties to new objects.
But things may go wrong very fast once you have a more complex object hierarchy.

Alternatives? Yes, you can use class-transform. Purpose of this library is to help you to map your plain javascript
objects to the instances of classes you have.

This library also great for models exposed in your APIs,
because it provides a great tooling to control what your models are exposing in your API.
Here is an example how it will look like:

```typescript
fetch('users.json').then((users: Object[]) => {
  const realUsers = plainToClass(User, users);
  // now each user in realUsers is an instance of User class
});
```

Now you can use `users[0].getName()` and `users[0].isAdult()` methods.

## Installation(#table-of-contents)

### Node.js(#table-of-contents)

1. Install module:

   `npm install class-transform --save`

2. `reflect-metadata` shim is required, install it too:

   `npm install reflect-metadata --save`

   and make sure to import it in a global place, like app.ts:

   ```typescript
   import 'reflect-metadata';
   ```

3. ES6 features are used, if you are using old version of node.js you may need to install es6-shim:

   `npm install es6-shim --save`

   and import it in a global place like app.ts:

   ```typescript
   import 'es6-shim';
   ```

### Browser(#table-of-contents)

1. Install module:

   `npm install class-transform --save`

2. `reflect-metadata` shim is required, install it too:

   `npm install reflect-metadata --save`

   add `<script>` to reflect-metadata in the head of your `index.html`:

   ```html
   <html>
     <head>
       <!-- ... -->
       <script src="node_modules/reflect-metadata/Reflect.js"></script>
     </head>
     <!-- ... -->
   </html>
   ```

   If you are using angular 2 you should already have this shim installed.

3. If you are using system.js you may want to add this into `map` and `package` config:

   ```json
   {
     "map": {
       "class-transform": "node_modules/class-transform"
     },
     "packages": {
       "class-transform": { "main": "index.js", "defaultExtension": "js" }
     }
   }
   ```

## Methods(#table-of-contents)

### plainToClass(#table-of-contents)

This method transforms a plain javascript object to instance of specific class.

```typescript
import { plainToClass } from 'class-transform';

let users = plainToClass(User, userJson); // to convert user plain object a single user. also supports arrays
```

### plainToClassFromExist(#table-of-contents)

This method transforms a plain object into an instance using an already filled Object which is an instance of the target class.

```typescript
const defaultUser = new User();
defaultUser.role = 'user';

let mixedUser = plainToClassFromExist(defaultUser, user); // mixed user should have the value role = user when no value is set otherwise.
```

### classToPlain(#table-of-contents)

This method transforms your class object back to plain javascript object, that can be `JSON.stringify` later.

```typescript
import { classToPlain } from 'class-transform';
let photo = classToPlain(photo);
```

### instanceToInstance(#table-of-contents)

This method transforms your class object into a new instance of the class object.
This may be treated as deep clone of your objects.

```typescript
import { instanceToInstance } from 'class-transform';
let photo = instanceToInstance(photo);
```

You can also use an `ignoreDecorators` option in transformation options to ignore all decorators your classes are using.

### serialize(#table-of-contents)

You can serialize your model right to json using `serialize` method:

```typescript
import { serialize } from 'class-transform';
let photo = serialize(photo);
```

`serialize` works with both arrays and non-arrays.

### deserialize and deserializeArray(#table-of-contents)

You can deserialize your model from json using the `deserialize` method:

```typescript
import { deserialize } from 'class-transform';
let photo = deserialize(Photo, photo);
```

To make deserialization work with arrays, use the `deserializeArray` method:

```typescript
import { deserializeArray } from 'class-transform';
let photos = deserializeArray(Photo, photos);
```

## Enforcing type-safe instance(#table-of-contents)

The default behaviour of the `plainToClass` method is to set _all_ properties from the plain object,
even those which are not specified in the class.

```typescript
import { plainToClass } from 'class-transform';

class User {
  id: number;
  firstName: string;
  lastName: string;
}

const fromPlainUser = {
  unkownProp: 'hello there',
  firstName: 'Umed',
  lastName: 'Khudoiberdiev',
};

console.log(plainToClass(User, fromPlainUser));

// User {
//   unkownProp: 'hello there',
//   firstName: 'Umed',
//   lastName: 'Khudoiberdiev',
// }
```

If this behaviour does not suit your needs, you can use the `excludeExtraneousValues` option
in the `plainToClass` method while _exposing all your class properties_ as a requirement.

```typescript
import { Expose, plainToClass } from 'class-transform';

class User {
  @Expose() id: number;
  @Expose() firstName: string;
  @Expose() lastName: string;
}

const fromPlainUser = {
  unkownProp: 'hello there',
  firstName: 'Umed',
  lastName: 'Khudoiberdiev',
};

console.log(plainToClass(User, fromPlainUser, { excludeExtraneousValues: true }));

// User {
//   id: undefined,
//   firstName: 'Umed',
//   lastName: 'Khudoiberdiev'
// }
```

## Working with nested objects(#table-of-contents)

When you are trying to transform objects that have nested objects,
it's required to known what type of object you are trying to transform.
Since Typescript does not have good reflection abilities yet,
we should implicitly specify what type of object each property contain.
This is done using `@Nested` decorator.

Lets say we have an album with photos.
And we are trying to convert album plain object to class object:

```typescript
import { Nested, plainToClass } from 'class-transform';

export class Album {
  id: number;

  name: string;

  @Nested(Photo)
  photos: Photo[];
}

export class Photo {
  id: number;
  filename: string;
}

let album = plainToClass(Album, albumJson);
// now album is Album object with Photo objects inside
```

### Providing more than one type option(#table-of-contents)

In case the nested object can be of different types, you can provide an additional options object,
that specifies a discriminator. The discriminator option must define a `property` that holds the subtype
name for the object and the possible `subTypes` that the nested object can converted to. A sub type
has a `value`, that holds the constructor of the Type and the `name`, that can match with the `property`
of the discriminator.

Lets say we have an album that has a top photo. But this photo can be of certain different types.
And we are trying to convert album plain object to class object. The plain object input has to define
the additional property `__type`. This property is removed during transformation by default:

**JSON input**:

```json
{
  "id": 1,
  "name": "foo",
  "topPhoto": {
    "id": 9,
    "filename": "cool_whale.jpg",
    "depth": 1245,
    "__type": "underwater"
  }
}
```

```typescript
import { Nested, plainToClass } from 'class-transform';

export abstract class Photo {
  id: number;
  filename: string;
}

export class Landscape extends Photo {
  panorama: boolean;
}

export class Portrait extends Photo {
  person: Person;
}

export class UnderWater extends Photo {
  depth: number;
}

export class Album {
  id: number;
  name: string;

  @Nested(Photo, {
    discriminator: {
      property: '__type',
      subTypes: [
        { value: Landscape, name: 'landscape' },
        { value: Portrait, name: 'portrait' },
        { value: UnderWater, name: 'underwater' },
      ],
    },
  })
  topPhoto: Landscape | Portrait | UnderWater;
}

let album = plainToClass(Album, albumJson);
// now album is Album object with a UnderWater object without `__type` property.
```

Hint: The same applies for arrays with different sub types. Moreover you can specify `keepDiscriminatorProperty: true`
in the options to keep the discriminator property also inside your resulting class.

## Exposing getters and method return values(#table-of-contents)

You can expose what your getter or method return by setting an `@Expose()` decorator to those getters or methods:

```typescript
import { Expose } from 'class-transform';

export class User {
  id: number;
  firstName: string;
  lastName: string;
  password: string;

  @Expose()
  get name() {
    return this.firstName + ' ' + this.lastName;
  }

  @Expose()
  getFullName() {
    return this.firstName + ' ' + this.lastName;
  }
}
```

## Exposing properties with different names(#table-of-contents)

If you want to expose some of the properties with a different name,
you can do that by specifying a `name` option to `@Expose` decorator:

```typescript
import { Expose } from 'class-transform';

export class User {
  @Expose({ name: 'uid' })
  id: number;

  firstName: string;

  lastName: string;

  @Expose({ name: 'secretKey' })
  password: string;

  @Expose({ name: 'fullName' })
  getFullName() {
    return this.firstName + ' ' + this.lastName;
  }
}
```

## Skipping specific properties(#table-of-contents)

Sometimes you want to skip some properties during transformation.
This can be done using `@Exclude` decorator:

```typescript
import { Exclude } from 'class-transform';

export class User {
  id: number;

  email: string;

  @Exclude()
  password: string;
}
```

Now when you transform a User, the `password` property will be skipped and not be included in the transformed result.

## Skipping depend of operation(#table-of-contents)

You can control on what operation you will exclude a property. Use `toClassOnly` or `toPlainOnly` options:

```typescript
import { Exclude } from 'class-transform';

export class User {
  id: number;

  email: string;

  @Exclude({ toPlainOnly: true })
  password: string;
}
```

Now `password` property will be excluded only during `classToPlain` operation. Vice versa, use the `toClassOnly` option.

## Skipping all properties of the class(#table-of-contents)

You can skip all properties of the class, and expose only those are needed explicitly:

```typescript
import { Exclude, Expose } from 'class-transform';

@Exclude()
export class User {
  @Expose()
  id: number;

  @Expose()
  email: string;

  password: string;
}
```

Now `id` and `email` will be exposed, and password will be excluded during transformation.
Alternatively, you can set exclusion strategy during transformation:

```typescript
import { classToPlain } from 'class-transform';
let photo = classToPlain(photo, { strategy: 'excludeAll' });
```

In this case you don't need to `@Exclude()` a whole class.

## Skipping private properties, or some prefixed properties(#table-of-contents)

If you name your private properties with a prefix, lets say with `_`,
then you can exclude such properties from transformation too:

```typescript
import { classToPlain } from 'class-transform';
let photo = classToPlain(photo, { excludePrefixes: ['_'] });
```

This will skip all properties that start with `_` prefix.
You can pass any number of prefixes and all properties that begin with these prefixes will be ignored.
For example:

```typescript
import { Expose, classToPlain } from 'class-transform';

export class User {
  id: number;
  private _firstName: string;
  private _lastName: string;
  _password: string;

  setName(firstName: string, lastName: string) {
    this._firstName = firstName;
    this._lastName = lastName;
  }

  @Expose()
  get name() {
    return this._firstName + ' ' + this._lastName;
  }
}

const user = new User();
user.id = 1;
user.setName('Johny', 'Cage');
user._password = '123';

const plainUser = classToPlain(user, { excludePrefixes: ['_'] });
// here plainUser will be equal to
// { id: 1, name: "Johny Cage" }
```

## Using groups to control excluded properties(#table-of-contents)

You can use groups to control what data will be exposed and what will not be:

```typescript
import { Exclude, Expose, classToPlain } from 'class-transform';

export class User {
  id: number;

  name: string;

  @Expose({ groups: ['user', 'admin'] }) // this means that this data will be exposed only to users and admins
  email: string;

  @Expose({ groups: ['user'] }) // this means that this data will be exposed only to users
  password: string;
}

let user1 = classToPlain(user, { groups: ['user'] }); // will contain id, name, email and password
let user2 = classToPlain(user, { groups: ['admin'] }); // will contain id, name and email
```

## Using versioning to control exposed and excluded properties(#table-of-contents)

If you are building an API that has different versions, class-transform has extremely useful tools for that.
You can control which properties of your model should be exposed or excluded in what version. Example:

```typescript
import { Exclude, Expose, classToPlain } from 'class-transform';

export class User {
  id: number;

  name: string;

  @Expose({ since: 0.7, until: 1 }) // this means that this property will be exposed for version starting from 0.7 until 1
  email: string;

  @Expose({ since: 2.1 }) // this means that this property will be exposed for version starting from 2.1
  password: string;
}

let user1 = classToPlain(user, { version: 0.5 }); // will contain id and name
let user2 = classToPlain(user, { version: 0.7 }); // will contain id, name and email
let user3 = classToPlain(user, { version: 1 }); // will contain id and name
let user4 = classToPlain(user, { version: 2 }); // will contain id and name
let user5 = classToPlain(user, { version: 2.1 }); // will contain id, name and password
```

## Сonverting date strings into Date objects(#table-of-contents)

Sometimes you have a Date in your plain javascript object received in a string format.
And you want to create a real javascript Date object from it.
You can do it simply by passing a Date object to the `@Nested` decorator:

```typescript
import { Type } from 'class-transform';

export class User {
  id: number;

  email: string;

  password: string;

  @Nested(Date)
  registrationDate: Date;
}
```

Same technique can be used with `Number`, `String`, `Boolean`
primitive types when you want to convert your values into these types.

## Working with arrays(#table-of-contents)

When you are using arrays you must provide a type of the object that array contains.
This type, you specify in a `@Nested()` decorator:

```typescript
import { Type } from 'class-transform';

export class Photo {
  id: number;

  name: string;

  @Nested(Album)
  albums: Album[];
}
```

You can also use custom array types:

```typescript
import { Type } from 'class-transform';

export class AlbumCollection extends Array<Album> {
  // custom array functions ...
}

export class Photo {
  id: number;
  name: string;

  @Nested(Album)
  albums: AlbumCollection;
}
```

Library will handle proper transformation automatically.

ES6 collections `Set` and `Map` also require the `@Nested` decorator:

```typescript
export class Skill {
  name: string;
}

export class Weapon {
  name: string;
  range: number;
}

export class Player {
  name: string;

  @Nested(Skill)
  skills: Set<Skill>;

  @Nested(Weapon)
  weapons: Map<string, Weapon>;
}
```

## Additional data transformation(#table-of-contents)

### Basic usage(#table-of-contents)

You can perform additional data transformation using `@Transform` decorator.
For example, you want to make your `Date` object to be a `moment` object when you are
transforming object from plain to class:

```typescript
import { Transform } from 'class-transform';
import * as moment from 'moment';
import { Moment } from 'moment';

export class Photo {
  id: number;

  @Nested(Date)
  @Transform(({ value }) => moment(value), { toClassOnly: true })
  date: Moment;
}
```

Now when you call `plainToClass` and send a plain representation of the Photo object,
it will convert a date value in your photo object to moment date.
`@Transform` decorator also supports groups and versioning.

### Advanced usage(#table-of-contents)

The `@Transform` decorator is given more arguments to let you configure how you want the transformation to be done.

```ts
@Transform(({ value, key, obj, type }) => value)
```

| Argument  | Description                                             |
| --------- | ------------------------------------------------------- |
| `value`   | The property value before the transformation.           |
| `key`     | The name of the transformed property.                   |
| `obj`     | The transformation source object.                       |
| `type`    | The transformation type.                                |
| `options` | The options object passed to the transformation method. |

## Other decorators(#table-of-contents)

| Signature                | Example                                              | Description                                                                           |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `@TransformClassToPlain` | `@TransformClassToPlain({ groups: ["user"] })`       | Transform the method return with classToPlain and expose the properties on the class. |
| `@TransformClassToClass` | `@TransformClassToClass({ groups: ["user"] })`       | Transform the method return with classToClass and expose the properties on the class. |
| `@TransformPlainToClass` | `@TransformPlainToClass(User, { groups: ["user"] })` | Transform the method return with plainToClass and expose the properties on the class. |

The above decorators accept one optional argument:
ClassTransformOptions - The transform options like groups, version, name

An example:

```typescript
@Exclude()
class User {
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose({ groups: ['user.email'] })
  email: string;

  password: string;
}

class UserController {
  @TransformClassToPlain({ groups: ['user.email'] })
  getUser() {
    const user = new User();
    user.firstName = 'Snir';
    user.lastName = 'Segal';
    user.password = 'imnosuperman';

    return user;
  }
}

const controller = new UserController();
const user = controller.getUser();
```

the `user` variable will contain only firstName,lastName, email properties because they are
the exposed variables. email property is also exposed because we metioned the group "user.email".

## Working with generics(#table-of-contents)

Generics are not supported because TypeScript does not have good reflection abilities yet.
Once TypeScript team provide us better runtime type reflection tools, generics will be implemented.
There are some tweaks however you can use, that maybe can solve your problem.
[Checkout this example.](https://github.com/pleerock/class-transform/tree/master/sample/sample4-generics)

## Implicit type conversion(#table-of-contents)

> **NOTE** If you use class-validator together with class-transform you propably DON'T want to enable this function.

Enables automatic conversion between built-in types based on type information provided by Typescript. Disabled by default.

```ts
import { IsString } from 'class-validator';

class MyPayload {
  @IsString()
  prop: string;
}

const result1 = plainToClass(MyPayload, { prop: 1234 }, { enableImplicitConversion: true });
const result2 = plainToClass(MyPayload, { prop: 1234 }, { enableImplicitConversion: false });

/**
 *  result1 will be `{ prop: "1234" }` - notice how the prop value has been converted to string.
 *  result2 will be `{ prop: 1234 }` - default behaviour
 */
```

## How does it handle circular references?(#table-of-contents)

Circular references are ignored.
For example, if you are transforming class `User` that contains property `photos` with type of `Photo`,
and `Photo` contains link `user` to its parent `User`, then `user` will be ignored during transformation.
Circular references are not ignored only during `classToClass` operation.

## Example with Angular2(#table-of-contents)

Lets say you want to download users and want them automatically to be mapped to the instances of `User` class.

```typescript
import { plainToClass } from 'class-transform';

this.http
  .get('users.json')
  .map(res => res.json())
  .map(res => plainToClass(User, res as Object[]))
  .subscribe(users => {
    // now "users" is type of User[] and each user has getName() and isAdult() methods available
    console.log(users);
  });
```

You can also inject a class `ClassTransformer` as a service in `providers`, and use its methods.

Example how to use with angular 2 in [plunker](http://plnkr.co/edit/Mja1ZYAjVySWASMHVB9R).
Source code is [here](https://github.com/pleerock/class-transform-demo).

## Samples(#table-of-contents)

Take a look on samples in [./sample](https://github.com/pleerock/class-transform/tree/master/sample) for more examples of
usages.

## Release notes(#table-of-contents)

See information about breaking changes and release notes [here](https://github.com/cunarist/class-transform/blob/master/CHANGELOG.md).
