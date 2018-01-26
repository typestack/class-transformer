import "reflect-metadata";
import { expect } from "chai";
import { classToPlain, plainToClass } from "../../src/index";
import { defaultMetadataStorage } from "../../src/storage";
import { Expose, Transform, Type } from "../../src/decorators";
import * as moment from "moment";
import { TransformationType } from "../../src/TransformOperationExecutor";

describe("custom transformation decorator", () => {

    it("@Expose decorator with \"name\" option should work with @Transform decorator", () => {
        defaultMetadataStorage.clear();

        class User {

            @Expose({ name: "user_name" })
            @Transform(value => value.toUpperCase())
            name: string;
        }

        let plainUser = {
            user_name: "Johny Cage"
        };

        const classedUser = plainToClass(User, plainUser);
        classedUser.name.should.be.equal("JOHNY CAGE");
    });

    it("@Transform decorator logic should be executed depend of toPlainOnly and toClassOnly set", () => {
        defaultMetadataStorage.clear();

        class User {

            id: number;

            name: string;

            @Transform(value => value.toString(), { toPlainOnly: true })
            @Transform(value => moment(value), { toClassOnly: true })
            date: Date;

        }

        let plainUser = {
            id: 1,
            name: "Johny Cage",
            date: new Date().valueOf()
        };

        const user = new User();
        user.id = 1;
        user.name = "Johny Cage";
        user.date = new Date();

        const classedUser = plainToClass(User, plainUser);
        classedUser.should.be.instanceOf(User);
        classedUser.id.should.be.equal(1);
        classedUser.name.should.be.equal("Johny Cage");
        moment.isMoment(classedUser.date).should.be.true;

        const plainedUser = classToPlain(user);
        plainedUser.should.not.be.instanceOf(User);
        plainedUser.should.be.eql({
            id: 1,
            name: "Johny Cage",
            date: user.date.toString()
        });

    });

    it("versions and groups should work with @Transform decorator too", () => {
        defaultMetadataStorage.clear();

        class User {

            id: number;

            name: string;

            @Type(() => Date)
            @Transform(value => moment(value), { since: 1, until: 2 })
            date: Date;

            @Type(() => Date)
            @Transform(value => value.toString(), { groups: ["user"] })
            lastVisitDate: Date;

        }

        let plainUser = {
            id: 1,
            name: "Johny Cage",
            date: new Date().valueOf(),
            lastVisitDate: new Date().valueOf()
        };

        const classedUser1 = plainToClass(User, plainUser);
        classedUser1.should.be.instanceOf(User);
        classedUser1.id.should.be.equal(1);
        classedUser1.name.should.be.equal("Johny Cage");
        moment.isMoment(classedUser1.date).should.be.true;

        const classedUser2 = plainToClass(User, plainUser, { version: 0.5 });
        classedUser2.should.be.instanceOf(User);
        classedUser2.id.should.be.equal(1);
        classedUser2.name.should.be.equal("Johny Cage");
        classedUser2.date.should.be.instanceof(Date);

        const classedUser3 = plainToClass(User, plainUser, { version: 1 });
        classedUser3.should.be.instanceOf(User);
        classedUser3.id.should.be.equal(1);
        classedUser3.name.should.be.equal("Johny Cage");
        moment.isMoment(classedUser3.date).should.be.true;

        const classedUser4 = plainToClass(User, plainUser, { version: 2 });
        classedUser4.should.be.instanceOf(User);
        classedUser4.id.should.be.equal(1);
        classedUser4.name.should.be.equal("Johny Cage");
        classedUser4.date.should.be.instanceof(Date);

        const classedUser5 = plainToClass(User, plainUser, { groups: ["user"] });
        classedUser5.should.be.instanceOf(User);
        classedUser5.id.should.be.equal(1);
        classedUser5.name.should.be.equal("Johny Cage");
        classedUser5.lastVisitDate.should.be.equal(new Date(plainUser.lastVisitDate).toString());
    });

    it("@Transform decorator callback should be given correct arguments", () => {
        defaultMetadataStorage.clear();

        let objArg: any;
        let typeArg: TransformationType;

        function transformCallback(value: any, obj: any, type: TransformationType) {
            objArg = obj;
            typeArg = type;
            return value;
        }

        class User {
            @Transform(transformCallback, { toPlainOnly: true })
            @Transform(transformCallback, { toClassOnly: true })
            name: string;
        }

        let plainUser = {
            name: "Johny Cage",
        };

        plainToClass(User, plainUser);
        objArg.should.be.equal(plainUser);
        typeArg.should.be.equal(TransformationType.PLAIN_TO_CLASS);

        const user = new User();
        user.name = "Johny Cage";

        classToPlain(user);
        objArg.should.be.equal(user);
        typeArg.should.be.equal(TransformationType.CLASS_TO_PLAIN);
    });

    let model: any;
    it("should serialize json into model instance of class Person", () => {
        expect(() => {
            const json = {
                name: "John Doe",
                address: {
                    street: "Main Street 25",
                    tel: "5454-534-645",
                    zip: 10353,
                    country: "West Samoa"
                },
                age: 25,
                hobbies: [
                    { type: "sport", name: "sailing" },
                    { type: "relax", name: "reading" },
                    { type: "sport", name: "jogging" },
                    { type: "relax", name: "movies" }
                ]
            };
            class Hobby {
                public type: string;
                public name: string;
            }
            class Address {
                public street: string;

                @Expose({ name: "tel" })
                public telephone: string;

                public zip: number;

                public country: string;
            }
            class Person {
                public name: string;

                @Type(() => Address)
                public address: Address;

                @Type(() => Hobby)
                @Transform(value => value.filter((hobby: any) => hobby.type === "sport"), { toClassOnly: true })
                public hobbies: Hobby[];

                public age: number;
            }
            model = plainToClass(Person, json);
            expect(model instanceof Person);
            expect(model.address instanceof Address);
            model.hobbies.forEach((hobby: Hobby) => expect(hobby instanceof Hobby && hobby.type === "sport"));
        }).to.not.throw();
    });

    it("should serialize json into model instance of class Person with different types in array (polymorphism)", () => {
        expect(() => {
            const json = {
                name: "John Doe",
                hobbies: [
                    { type: "sport", name: "sailing" },
                    { type: "relax", name: "reading" },
                    { type: "sport", name: "jogging" },
                    { type: "relax", name: "movies" },
                    { type: "program", name: "typescript coding", specialAbility: "testing" }
                ]
            };
            abstract class Hobby {
                public type: string;
                public name: string;
            }

            class Sports extends Hobby { }

            class Relaxing extends Hobby { }

            class Programming extends Hobby {
                @Transform((value: string) => value.toUpperCase())
                specialAbility: string;
            }

            class Person {
                public name: string;

                @Type(() => [isSports, isRelaxing, isProgramming])
                public hobbies: any[];
            }

            function isSports(val: any): Function | false {
                if (val.type === "sport") {
                    return Sports;
                } else {
                    return false;
                }
            }

            function isRelaxing(val: any): Function | false {
                if (val.type === "relax") {
                    return Relaxing;
                } else {
                    return false;
                }
            }

            function isProgramming(val: any): Function | false {
                if (val.type === "program") {
                    return Programming;
                } else {
                    return false;
                }
            }

            const model: Person = plainToClass(Person, json);
            expect(model).to.be.instanceof(Person);
            expect(model.hobbies[0]).to.be.instanceof(Sports);
            expect(model.hobbies[1]).to.be.instanceof(Relaxing);
            expect(model.hobbies[2]).to.be.instanceof(Sports);
            expect(model.hobbies[3]).to.be.instanceof(Relaxing);
            expect(model.hobbies[4]).to.be.instanceof(Programming);
            expect(model.hobbies[4].specialAbility).to.be.equal("TESTING");
        }).to.not.throw();
    });

    it("should throw an error when none of the given discriminator functions return a type for an object nested in an array (polymorphism)", () => {
        expect(() => {
            const json = {
                name: "John Doe",
                hobbies: [
                    { type: "sport", name: "sailing" },
                    { type: "relax", name: "reading" },
                    { type: "sport", name: "jogging" },
                    { type: "relax", name: "movies" },
                    { type: "program", name: "typescript coding", specialAbility: "testing" }
                ]
            };
            abstract class Hobby {
                public type: string;
                public name: string;
            }

            class Sports extends Hobby { }

            class Relaxing extends Hobby { }

            class Programming extends Hobby {
                @Transform((value: string) => value.toUpperCase())
                specialAbility: string;
            }

            class Person {
                public name: string;

                @Type(() => [isSports, isRelaxing, isProgramming])
                public hobbies: any[];
            }

            function isSports(val: any): Function | false {
                if (val.type === "sport") {
                    return Sports;
                } else {
                    return false;
                }
            }

            function isRelaxing(val: any): Function | false {
                if (val.type === "relax") {
                    return Relaxing;
                } else {
                    return false;
                }
            }

            function isProgramming(val: any): Function | false {
                return false;
            }

            const model: Person = plainToClass(Person, json);
        }).to.throw(Error, "None of the given discriminator functions did return a constructor for a type.");
    });

    it("should serialize json into model instance of class Person with different type options for one property (polymorphism)", () => {
        expect(() => {
            const json = {
                name: "John Doe",
                hobby: { type: "sport", name: "sailing" },
                otherHobby: { type: "program", name: "typescript coding", specialAbility: "testing" }
            };
            abstract class Hobby {
                public type: string;
                public name: string;
            }

            class Sports extends Hobby { }

            class Relaxing extends Hobby { }

            class Programming extends Hobby {
                @Transform((value: string) => value.toUpperCase())
                specialAbility: string;
            }

            class Person {
                public name: string;

                @Type(() => [isSports, isRelaxing, isProgramming])
                public hobby: Sports | Relaxing | Programming;

                @Type(() => [isSports, isRelaxing, isProgramming])
                public otherHobby: Sports | Relaxing | Programming;
            }

            function isSports(val: any): Function | false {
                if (val.type === "sport") {
                    return Sports;
                } else {
                    return false;
                }
            }

            function isRelaxing(val: any): Function | false {
                if (val.type === "relax") {
                    return Relaxing;
                } else {
                    return false;
                }
            }

            function isProgramming(val: any): Function | false {
                if (val.type === "program") {
                    return Programming;
                } else {
                    return false;
                }
            }

            const model: Person = plainToClass(Person, json);
            expect(model).to.be.instanceof(Person);
            expect(model.hobby).to.be.instanceof(Sports);
            expect(model.otherHobby).to.be.instanceof(Programming);
            expect((model.otherHobby as Programming).specialAbility).to.be.equal("TESTING");
        }).to.not.throw();
    });

    it("should throw an error when none of the given discriminator functions return a type for single property (polymorphism)", () => {
        expect(() => {
            const json = {
                name: "John Doe",
                hobby: { type: "sport", name: "sailing" }
            };
            abstract class Hobby {
                public type: string;
                public name: string;
            }

            class Sports extends Hobby { }

            class Relaxing extends Hobby { }

            class Programming extends Hobby {
                @Transform((value: string) => value.toUpperCase())
                specialAbility: string;
            }

            class Person {
                public name: string;

                @Type(() => [isProgramming])
                public hobby: Sports | Relaxing | Programming;
            }

            function isProgramming(val: any): Function | false {
                return false;
            }

            const model: Person = plainToClass(Person, json);
        }).to.throw(Error, "None of the given discriminator functions did return a constructor for a type.");
    });

    it("should serialize a model into json", () => {
        expect(() => {
            classToPlain(model);
        }).to.not.throw();
    });

});
