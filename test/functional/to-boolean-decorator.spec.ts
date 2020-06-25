import {plainToClass, ToBoolean} from "../../src";
import { expect } from "chai";

describe("Cast to boolean", () => {
    class Dto {
        @ToBoolean()
        hasFlag: boolean;
    }

   it("Should cast false value as false", () => {

       const result = plainToClass(Dto, { hasFlag: "false" });
       expect(result.hasFlag).to.be.false;
   });

    it("Should cast true value as true", () => {
        const result = plainToClass(Dto, { hasFlag: "true" });
        expect(result.hasFlag).to.be.true;
    });

    it("Should not cast undefined as bool", () => {
        const result = plainToClass(Dto, { hasFlag: undefined });
        expect(result.hasFlag).to.not.be.equals(true);
        expect(result.hasFlag).to.not.be.equals(false);
    });

    it("Should not cast null as bool", () => {
        const result = plainToClass(Dto, { hasFlag: null });
        expect(result.hasFlag).to.not.be.equals(true);
        expect(result.hasFlag).to.not.be.equals(false);
    });

    it("Should not cast 0 as bool", () => {
        const result = plainToClass(Dto, { hasFlag: 0 });
        expect(result.hasFlag).to.not.be.equals(false);
        expect(result.hasFlag).to.not.be.equals(true);
    });

    it("Should not cast 1 as true", () => {
        const result = plainToClass(Dto, { hasFlag: 1 });
        expect(result.hasFlag).to.not.be.equals(false);
        expect(result.hasFlag).to.not.be.equals(true);
    });

});
