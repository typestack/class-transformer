# Getting Started

The `class-transformer` package is a zero-dependency utility library helping you to quickly transform class instances to plain objects and vice-versa.
It works well with the [`class-validator`][class-validator] library. The main features include:

- conditionally transforming object properties
- excluding specific properties from the transformed object
- exposing properties under a different name on the transformed object
- supports both NodeJS and browsers
- fully three-shakable
- zero external dependencies

## Installation

To start using class-transformer install the required packages via NPM:

```bash
npm install class-transformer reflect-metadata
```

Import the `reflect-metadata` package at the **first line** of your application:

```ts
import 'reflect-metadata';

// Your other imports and initialization code
// comes here after you imported the reflect-metadata package!
```

As the last step, you need to enable emitting decorator metadata in your Typescript config. Add these two lines to your `tsconfig.json` file under the `compilerOptions` key:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

Now you are ready to use class-transformer with Typescript!

## Basic Usage

The most basic usage is to transform a class to a plain object:

```ts
import { Expose, Exclude, classToInstance } from 'class-transformer';

class User {
  /**
   * When transformed to plain the `_id` property will be remapped to `id`
   * in the plain object.
   */
  @Expose({ name: 'id' })
  private _id: string;

  /**
   * Expose the `name` property as it is in the plain object.
   */
  @Expose()
  public name: string;

  /**
   * Exclude the `passwordHash` so it won't be included in the plain object.
   */
  @Exclude()
  public passwordHash: string;
}

const user = getUserMagically();
// contains: User { _id: '42', name: 'John Snow', passwordHash: '2f55ce082...' }

const plain = classToInstance(user);
// contains { id: '42', name: 'John Snow' }
```

[class-validator]: https://github.com/typestack/class-validator/
