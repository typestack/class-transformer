# Serializer.ts

Sometimes you want to map raw json objects to the ES6 **classes** you have. For example, if you are getting json object
from your backend, some api or from files, and after you `JSON.parse` it you have a plain javascript object, not
instance of class you have created.

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

## Installation


1. Install module:

    `npm install serializer.ts --save`

2. Use [typings](https://github.com/typings/typings) to install all required definition dependencies.

    `typings install`

3. ES6 features are used, so you may want to install [es6-shim](https://github.com/paulmillr/es6-shim) too:

    `npm install es6-shim --save`

    if you are building nodejs app, you may want to `require("es6-shim");` in your app.
    or if you are building web app, you man want to add `<script src="path-to-shim/es6-shim.js">` on your page.

## Basic usage

This library allows you to perform both serialization and deserialization of the objects:

#### serialization

```typescript
import {serialize} from "serializer.ts";

let photo = serialize(photo);
```

Work of `serialize` method may look like `JSON.parse` method, but benefit of using this method is that you can skip
some properties during serialization. Skipping is covered in next section.

#### deserialization

```typescript
import {deserialize} from "serializer.ts";

let users = deserialize<User[]>(User, usersJson);
```

This allows to map plain javascript array `usersJson` to array of `User` objects.
Now you can use `users[0].getName()` and `users[0].isKid()` methods.

## Nested objects

When you deserialize objects that have nested objects, its required for this component to known what type of object
you are trying to deserialize. Since Typescript does not have good reflection abilities yet we must implicitly
specify what type of object each property contain. This is done using `@Type` decorator.

Lets say we have an album with photos. And we are trying to deserialize album object:

```typescript
import {Type} from "serializer.ts/Decorators";

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

let album = deserialize<Album>(Album, albumJson);
// now album is Album object with Photo objects inside
```

## Skipping specific properties

Sometimes you want to skip some properties during serialization/deserialization. This can be done using `@Skip`
decorator:

```typescript
import {Skip} from "serializer.ts/Decorators";

export class User {

    id: number;

    email: string;

    @Skip()
    password: string;
}
```

Now when you'll try to serialize or deserialize object `password` property will be skipped and will not be included
in the serialized/deserialized object.

## Example with Angular2

Lets say you want to download users and want them automatically to be mapped to the instances of `User` class.

```typescript
import {deserialize} from "serializer.ts/Serializer";

this.http
    .get("users.json")
    .map(res => res.json())
    .map(res => deserialize<User[]>(User, res))
    .subscribe(users => {
        // now "users" is type of User[] and each user have getName() and isKid() methods available
        console.log(users);
    });
```

You can also inject a class `Serializer` as a service, and use its methods.

## Samples

Take a look on samples in [./sample](https://github.com/pleerock/serializer.ts/tree/master/sample) for more examples of
usages.
