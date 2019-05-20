// import { expect } from "chai";

// import { plainToClass } from "../../src";

// describe("Prototype inheritance", () => {

//   // https://github.com/typestack/class-transformer/issues/233
//   it("should set value if property has default value in prototype chain.", () => {
//     class TestObject {
//       normalProp: string = "Hello!";
//       prototypedProp: string;
//     }

//     TestObject.prototype.prototypedProp = "I'm a BUG!";

//     const payload = {
//       normalProp: "Goodbye!",
//       prototypedProp: "Goodbye!"
//     };

//     const result = plainToClass(TestObject, payload);

//     expect(result).to.eql({
//       normalProp: "Goodbye!",
//       prototypedProp: "Goodbye!"
//     });
//   });
// });