# Changelog

_This changelog follows the [keep a changelog][keep-a-changelog]_ format to maintain a human readable changelog.

### [0.5.0][v0.5.0] [BREAKING CHANGE] - 2021-11-20

> **NOTE:** This version fixes a security vulnerability allowing denial of service attacks with a specially crafted request payload. Please update as soon as possible.

#### Breaking Changes

See the breaking changes from `0.4.1` release. It was accidentally released as patch version.

### [0.4.1][v0.4.1] [BREAKING CHANGE] - 2021-11-20

> **NOTE:** This version fixes a security vulnerability allowing denial of service attacks with a specially crafted request payload. Please update as soon as possible.

#### Breaking Changes

**Exported functions has been renamed**
Some of the exported functions has been renamed to better reflect what they are doing.

- `classToPlain` -> `instanceToPlain`
- `plainToClass` -> `plainToInstance`
- `classToClass` -> `instanceToInstance`

#### Fixed

- prevent unhandled error in `plaintToclass` when union-type member is undefined
- fixed a scenario when a specially crafted JS object would be parsed to Array

#### Changed

- various dev-dependencies updated

### [0.4.0][v0.4.0] [BREAKING CHANGE] - 2021-02-14

#### Breaking Changes

See the breaking changes from `0.3.2` release. It was accidentally released as patch version.

#### Added

- add option to ignore unset properties
- `group` information is exposed in the `@Transform` handler
- transformation options are exposed in the `@Transform` handler

#### Fixed

- fixed TypeError when `discriminator.subTypes` is not defined

#### Changed

- various dev-dependencies has been updated

### [0.3.2][v0.3.2] [BREAKING CHANGE] - 2021-01-14

#### Breaking Changes

**Signature change for `@Transform` decorator**
From this version the `@Transform` decorator receives the transformation parameters in a a wrapper object. You need to
destructure the values you are interested in.

Old way:

```ts
@Transform((value, obj, type) => /* Do some stuff with value here. */)
```

New way with wrapper object:

```ts
@Transform(({ value, key, obj, type }) => /* Do some stuff with value here. */)
```

#### Added

- `exposeDefaultValues` option has been added, when enabled properties will use their default values when no value is present for the property
- the name of the currently transformed parameter is exposed in the `@Transform` decorator

#### Fixed

- fixed an issue with transforming `Map` (#319)
- fixed an issue with sourcemap generation (#472)

#### Changed

- various internal refactors
- various changes to the project tooling
- various dev-dependencies has been updated

### [0.3.1][v0.3.1] - 2020-07-29

#### Added

- table of content added to readme

#### Changed

- moved from Mocha to Jest
- added Prettier for code formatting
- added Eslint for linting
- updated CI configuration
- removed some unused dev dependencies
- updated dependencies to latest version

#### Fixed

- circular dependency fixed
- dev dependencies removed from package.json before publishing (no more security warnings)
- transformer order is deterministic now (#231)
- fix prototype pollution issue (#367)
- various fixes in documentation

### [0.2.3][v0.2.3] [BREAKING CHANGE]

#### Changed

- `enableImplicitConversion` has been added and imlplicit value conversion is disabled by default.
- reverted #234 - fix: write properties with defined default values on prototype which broke the `@Exclude` decorator.

### [0.2.2][v0.2.2] [BREAKING CHANGE]

> **NOTE:** This version is deprecated.

This version has introduced a breaking-change when this library is used with class-validator. See #257 for details.

#### Added

- implicity type conversion between values.

### [0.2.1][v0.2.1]

> **NOTE:** This version is deprecated.

#### Added

- add option to strip unkown properties via using the `excludeExtraneousValues` option

### [0.2.0][v0.2.0] [BREAKING CHANGE]

#### Added

- add documentation for using `Set`s and `Map`s
- add opotion to pass a discriminator function to convert values into different types based on custom conditions
- added support for polymorphism based on a named type property

#### Fixed

- fix bug when transforming `null` values as primitives

### 0.1.10

#### Fixed

- improve MetadataStorage perf by changing from Arrays to ES6 Maps by @sheiidan
- fixed getAncestor issue with unknown nested properties by @247GradLabs

### 0.1.9

#### Fixed

- objects with `null` prototype are converted properly now
- objects with unknown non primitive properties are converted properly now
- corrected a typo in the README.md
- fixed the deserialize example in the README.md

### 0.1.4

#### Added

- added `TransformClassToPlain` and `TransformClassToClass` decorators

### 0.1.0

#### Added

- renamed library from `constructor-utils` to `class-transformer`
- completely renamed most of names
- renamed all main methods: `plainToConstructor` now is `plainToClass` and `constructorToPlain` is `classToPlain`, etc.
- `plainToConstructorArray` method removed - now `plainToClass` handles it
- `@Skip()` decorator renamed to `@Exclude()`
- added `@Expose` decorator
- added lot of new options: groups, versioning, custom names, etc.
- methods and getters that should be exposed must be decorated with `@Expose` decorator
- added `excludedPrefix` to class transform options that allows exclude properties that start with one of the given prefix

### 0.0.22

#### Fixed

- fixed array with primitive types being converted

### 0.0.18-0.0.21

#### Fixed

- fixed bugs when getters are not converted with es6 target

### 0.0.17

#### Fixed

- fixed issue #4
- added type guessing during transformation from constructor to plain object
- added sample with generics

### 0.0.16

#### Changed

- renamed `constructor-utils/constructor-utils` to `constructor-utils` package namespace

### 0.0.15

#### Removed

- removed code mappings from package

### 0.0.14

#### Removed

- removed `import "reflect-metadata"` from source code. Now reflect metadata should be included like any other shims.

### 0.0.13

#### Changed

- Library has changed its name from `serializer.ts` to `constructor-utils`.
- Added `constructor-utils` namespace.

[v0.5.0]: https://github.com/typestack/class-transformer/compare/v0.4.1...v0.5.0
[v0.4.1]: https://github.com/typestack/class-transformer/compare/v0.4.0...v0.4.1
[v0.4.0]: https://github.com/typestack/class-transformer/compare/v0.3.2...v0.4.0
[v0.3.2]: https://github.com/typestack/class-transformer/compare/v0.3.1...v0.3.2
[v0.3.1]: https://github.com/typestack/class-transformer/compare/v0.2.3...v0.3.1
[v0.2.3]: https://github.com/typestack/class-transformer/compare/v0.2.2...v0.2.3
[v0.2.2]: https://github.com/typestack/class-transformer/compare/v0.2.1...v0.2.2
[v0.2.1]: https://github.com/typestack/class-transformer/compare/v0.2.0...v0.2.1
[v0.2.0]: https://github.com/typestack/class-transformer/compare/v0.1.10...v0.2.0
[keep-a-changelog]: https://keepachangelog.com/en/1.0.0/
