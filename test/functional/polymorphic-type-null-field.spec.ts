import {classToPlain, Type} from "../../src";

describe("polymorphic type null field", () => {
    it("should be serialized with classToPlain successfully", () => {
        abstract class Parent {
            name: string;
        }

        class Child extends Parent {}

        class TestClass {
            @Type(() => Parent, {
                discriminator: {
                    property: "__type",
                    subTypes: [
                        { value: Child, name: "child" }
                    ]
                }
            })
            polyField: Parent;
        }

        const testObject = new TestClass();
        testObject.polyField = null;
        const plainTestObject = classToPlain(testObject);
        plainTestObject.should.be.eql({
            polyField: null
        });
    });
});
