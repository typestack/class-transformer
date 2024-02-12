# Basic usage

There are two main exported functions what can be used for transformations:

- `plainToClass` - transforms a plain object to an instance of the specified class constructor
- `classToPlain` - transforms a _known_ class instance to a plain object

Both function transforms the source object to the target via applying the metadata registered by the decorators on
the class definition. The four main decorators are:

- `@Expose` specifies how expose the given property on the plain object
- `@Exclude` marks the property as skipped, so it won't show up in the transformation
- `@Transform` allows specifying a custom transformation on the property via a custom handler
- `@Nested` decorator explicitly sets the type of the property, during the transformation `class-transform` will attempt
  to create an instance of the specified type

You must always decorate all your properties with an `@Expose` or `@Exclude` decorator.

> **NOTE:** It's important to remember `class-transform` will call the target type with am empty constructor, so if
> you are using a type what requires special setup, you need to use a `@Transform` decorator and create the instance yourself.
