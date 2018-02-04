# Changelog and release notes

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
