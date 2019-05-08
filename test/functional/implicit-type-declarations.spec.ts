import "reflect-metadata";
import {
    plainToClass,
} from "../../src/index";
import {defaultMetadataStorage} from "../../src/storage";
import {Expose, Type} from "../../src/decorators";
import {expect} from "chai";

describe("implicit and explicity type declarations", () => {

    defaultMetadataStorage.clear();

    class Example {
        
        @Expose()
        readonly implicitTypeViaOtherDecorator: Date;

        @Type()
        readonly implicitTypeViaEmptyTypeDecorator: number;
        
        @Type(() => String) 
        readonly explicitType: string;
    }
    
    const result: Example = plainToClass(Example, { 
        implicitTypeViaOtherDecorator: "2018-12-24T12:00:00Z", 
        implicitTypeViaEmptyTypeDecorator: "100", 
        explicitType: 100,  
    });

    it("should use implicitly defined design:type to convert value when no @Type decorator is used", () => {
        expect(result.implicitTypeViaOtherDecorator).to.be.instanceOf(Date);
        expect(result.implicitTypeViaOtherDecorator.getTime()).to.be.equal(new Date("2018-12-24T12:00:00Z").getTime());
    });

    it("should use implicitly defined design:type to convert value when empty @Type() decorator is used", () => {
        expect(result.implicitTypeViaEmptyTypeDecorator).that.is.a("number");
        expect(result.implicitTypeViaEmptyTypeDecorator).to.be.equal(100);
    });

    it("should use explicitly defined type when @Type(() => Construtable) decorator is used", () => {
        expect(result.explicitType).that.is.a("string");
        expect(result.explicitType).to.be.equal("100");
    });

});

describe("plainToClass transforms builtin primitive types properly", () => {

    defaultMetadataStorage.clear();

    class Example {

        @Type()
        date: Date; 

        @Type()
        string: string;

        @Type()
        string2: string;

        @Type()
        number: number;  

        @Type()
        number2: number;
        
        @Type()
        boolean: boolean;
    
        @Type()
        boolean2: boolean;
    }
    
    const result: Example = plainToClass(Example, { 
        date: "2018-12-24T12:00:00Z", 
        string: "100", 
        string2: 100, 
        number: "100",
        number2: 100,
        boolean: 1,
        boolean2: 0,
    });

    it("should recognize and convert to Date", () => {
        expect(result.date).to.be.instanceOf(Date);
        expect(result.date.getTime()).to.be.equal(new Date("2018-12-24T12:00:00Z").getTime());
    });

    it("should recognize and convert to string", () => {
        expect(result.string).that.is.a("string");
        expect(result.string2).that.is.a("string");
        expect(result.string).to.be.equal("100");
        expect(result.string2).to.be.equal("100");
    });

    it("should recognize and convert to number", () => {
        expect(result.number).that.is.a("number");
        expect(result.number2).that.is.a("number");
        expect(result.number).to.be.equal(100);
        expect(result.number2).to.be.equal(100);
    });

    it("should recognize and convert to boolean", () => {
        expect(result.boolean).to.be.true;
        expect(result.boolean2).to.be.false;
    });

});