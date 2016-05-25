# constructor-utils

Its ES6 and Typescript era. Nowadays you are working with classes and constructor objects more then before. You'll
need set of utils to work with them.

## Release notes

**0.0.18 >> 0.0.20**

* fixed bug when getters are not converted with es6 target

**0.0.17**

* fixed issue #4
* added type guessing during transformation from constructor to plain object
* added sample with generics

**0.0.16**

* renamed `constructor-utils/constructor-utils` to `constructor-utils` package namespace.

**0.0.15**

* removed code mappings from package.

**0.0.14**

* removed `import "reflect-metadata"` from source code. Now reflect metadata should be included like any other
user's shims.

**0.0.13**

* Library has changed its name from `serializer.ts` to `constructor-utils`.
* Added `constructor-utils` namespace.

## Installation


1. Install module:

    `npm install constructor-utils --save`
    
2. If you are using system.js you may want to add this into `map` and `package` config:

```json
{
    "map": {
        "constructor-utils": "node_modules/constructor-utils"
    },
    "packages": {
        "constructor-utils": { "main": "index.js", "defaultExtension": "js" }
    }
}
```

2. Use [typings](https://github.com/typings/typings) to install all required definition dependencies.

    `typings install`

3. ES6 features are used, so you may want to install [es6-shim](https://github.com/paulmillr/es6-shim) too. You also
need to install [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) package.

    `npm install es6-shim --save`
    `npm install reflect-metadata --save`

    if you are building nodejs app, you may want to `require("es6-shim");` and `require("reflect-metadata")` in your app.
    or if you are building web app, you man want to add `<script src="path-to-es6-shim/es6-shim.js">` on your page.
    or if you are building web app, you man want to add `<script src="path-to-reflect-metadata-shim/reflect-metadata.js">` on your page.

## Transform plain object to constructor and versa

Sometimes you want to transform plain javascript objects to the ES6 **classes** you have.
For example, if you are getting json object from your backend, some api or from files,
and after you `JSON.parse` it you have a plain javascript object, not instance of class you have.

For example you have a list of users in your `users.json` you are trying to load:

```json
[{
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
}]
```
And you have a `User` class:

```typescript
export class User {
    id: number;
    firstName: string;
    lastName: string;
    age: number;

    getName() {
        return this.firstName + " " + this.lastName;
    }

    isKid() {
        return this.age < 18;
    }
}
```

You are assuming that you are downloading users of type `User` from `users.json` file and may want to write
following code:

```typescript
fetch("users.json").then((users: User[]) => {
    // here you can use users[0].id, you can also use users[0].firstName and users[0].lastName
    // however you cannot user users[0].getName() or users[0].isKid() because users object is actually
    // array of plain javascript objects, not instances of User object. You told compiler that `users: User[]`
    // you actually lied to your compiler that you are getting instances of User object.
});
```

So what to do? How to have in `users` array of `User` objects instead of plain javascript objects? Solution is
to create new instances of User object and manually copy all properties to new objects.

Alternatives? Yes, you can use this library. Purpose of this library is to help you to map you plain javascript
objects to the instances of classes you have created.

#### plainToConstructor

```typescript
import {plainToConstructor, plainToConstructorArray} from "constructor-utils";

let users = plainToConstructor(User, userJson); // to convert user plain object a single user
let users = plainToConstructorArray(User, usersJson); // to convert user plain objects array of users
```

This allows to map plain javascript array `usersJson` to array of `User` objects.
Now you can use `users[0].getName()` and `users[0].isKid()` methods.

#### constructorToPlain

```typescript
import {constructorToPlain} from "constructor-utils";
let photo = constructorToPlain(photo);
```

This method transforms your constructor object back to plain javascript object, that can be `JSON.stringify` later.

#### Working with nested objects

When you are trying to transform objects that have nested objects,
its required for this component to known what type of object you are trying to transform.
Since Typescript does not have good reflection abilities yet, we must implicitly specify what type of object each property contain.
This is done using `@Type` decorator.

Lets say we have an album with photos. And we are trying to convert album plain object to constructor object:

```typescript
import {Type, plainToConstructor} from "constructor-utils";

export class Album {

    id: number;

    name: string;

    @Type(() => Photo)
    photos: Photo[];
}

export class Photo {
    id: number;
    filename: string;
}

let album = plainToConstructor(Album, albumJson);
// now album is Album object with Photo objects inside
```

### skipping specific properties

Sometimes you want to skip some properties during transformation. This can be done using `@Skip`
decorator:

```typescript
import {Skip} from "constructor-utils";

export class User {

    id: number;

    email: string;

    @Skip()
    password: string;
}
```

Now when you'll try to transform objects, `password` property will be skipped and will not be included
in the resulted object.

### converting date strings into Date objects

Sometimes you have dates in your plain old javascript objects received in a string format. And you want to create a
real javascript Date objects from them. To make this component to automatically make your date strings a Date objects
simply pass Date object to the `@Type` decorator:

```typescript
import {Skip, Type} from "constructor-utils";

export class User {

    id: number;

    email: string;

    @Skip()
    password: string;

    @Type(() => Date)
    registrationDate: Date;
}
```

Note, that dates will be converted to strings when you'll try to convert constructor object to plain object.

Same technique can be used with `Number`, `String`, `Boolean` primitive types when you want to convert your values
into these types.

### using custom arrays

If you have a custom array type, you can use them using `@ArrayType()` decorator:

```typescript
import {ArrayType} from "constructor-utils";

export class AlbumCollection extends Array<Album> {
    // custom array functions ...
}

export class Photo {

    id: number;

    name: string;

    @ArrayType(() => Album)
    albums: AlbumCollection;
}
```

Library will handle proper transformation automatically.

### example with Angular2

Lets say you want to download users and want them automatically to be mapped to the instances of `User` class.

```typescript
import {plainToConstructorArray} from "constructor-utils";

this.http
    .get("users.json")
    .map(res => res.json())
    .map(res => plainToConstructorArray(User, res))
    .subscribe(users => {
        // now "users" is type of User[] and each user have getName() and isKid() methods available
        console.log(users);
    });
```

You can also inject a class `ConstructorUtils` as a service, and use its methods.

## Samples

Take a look on samples in [./sample](https://github.com/pleerock/constructor-utils/tree/master/sample) for more examples of
usages.
