import "reflect-metadata";
import { expect } from "chai";
import { classToPlain, plainToClass, classToClass } from "../../src/index";
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

        let keyArg: string;
        let objArg: any;
        let typeArg: TransformationType;

        function transformCallback(value: any, key: string, obj: any, type: TransformationType) {
            keyArg = key;
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
        keyArg.should.be.equal("name");
        objArg.should.be.equal(plainUser);
        typeArg.should.be.equal(TransformationType.PLAIN_TO_CLASS);

        const user = new User();
        user.name = "Johny Cage";

        classToPlain(user);
        keyArg.should.be.equal("name");
        objArg.should.be.equal(user);
        typeArg.should.be.equal(TransformationType.CLASS_TO_PLAIN);
    });

    let model: any;
    it("should serialize json into model instance of class Person", () => {
        defaultMetadataStorage.clear();
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

    it("should serialize json into model instance of class Person with different possibilities for type of one property (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            const json = {
                name: "John Doe",
                hobby: { __type: "program", name: "typescript coding", specialAbility: "testing" }
            };

            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: [
                            { value: Sports, name: "sports" }, { value: Relaxing, name: "relax" }, { value: Programming, name: "program" }
                        ]
                    }
                })
                public hobby: any;
            }

            const expectedHobby = { name: "typescript coding", specialAbility: "TESTING" };

            const model: Person = plainToClass(Person, json);
            expect(model).to.be.instanceof(Person);
            expect(model.hobby).to.be.instanceof(Programming);
            expect(model.hobby).to.have.not.property("__type");
            expect(model.hobby).to.have.property("specialAbility", "TESTING");
        }).to.not.throw();
    });

    it("should serialize json into model instance of class Person with different types in array (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            const json = {
                name: "John Doe",
                hobbies: [
                    { __type: "program", name: "typescript coding", specialAbility: "testing" },
                    { __type: "relax", name: "sun" }
                ]
            };

            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: [
                            { value: Sports, name: "sports" }, { value: Relaxing, name: "relax" }, { value: Programming, name: "program" }
                        ]
                    }
                })
                public hobbies: any[];
            }


            const model: Person = plainToClass(Person, json);
            expect(model).to.be.instanceof(Person);
            expect(model.hobbies[0]).to.be.instanceof(Programming);
            expect(model.hobbies[1]).to.be.instanceof(Relaxing);
            expect(model.hobbies[0]).to.have.not.property("__type");
            expect(model.hobbies[1]).to.have.not.property("__type");
            expect(model.hobbies[1]).to.have.property("name", "sun");
            expect(model.hobbies[0]).to.have.property("specialAbility", "TESTING");
        }).to.not.throw();
    });

    it("should serialize json into model instance of class Person with different possibilities for type of one property AND keeps discriminator property (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            const json = {
                name: "John Doe",
                hobby: { __type: "program", name: "typescript coding", specialAbility: "testing" }
            };

            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: [
                            { value: Sports, name: "sports" }, { value: Relaxing, name: "relax" }, { value: Programming, name: "program" }
                        ]
                    },
                    keepDiscriminatorProperty: true
                })
                public hobby: any;
            }

            const model: Person = plainToClass(Person, json);
            expect(model).to.be.instanceof(Person);
            expect(model.hobby).to.be.instanceof(Programming);
            expect(model.hobby).to.have.property("__type");
            expect(model.hobby).to.have.property("specialAbility", "TESTING");
        }).to.not.throw();
    });

    it("should serialize json into model instance of class Person with different types in array AND keeps discriminator property (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            const json = {
                name: "John Doe",
                hobbies: [
                    { __type: "program", name: "typescript coding", specialAbility: "testing" },
                    { __type: "relax", name: "sun" }
                ]
            };

            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: [
                            { value: Sports, name: "sports" }, { value: Relaxing, name: "relax" }, { value: Programming, name: "program" }
                        ]
                    },
                    keepDiscriminatorProperty: true
                })
                public hobbies: any[];
            }


            const model: Person = plainToClass(Person, json);
            expect(model).to.be.instanceof(Person);
            expect(model.hobbies[0]).to.be.instanceof(Programming);
            expect(model.hobbies[1]).to.be.instanceof(Relaxing);
            expect(model.hobbies[0]).to.have.property("__type");
            expect(model.hobbies[1]).to.have.property("__type");
            expect(model.hobbies[1]).to.have.property("name", "sun");
            expect(model.hobbies[0]).to.have.property("specialAbility", "TESTING");
        }).to.not.throw();
    });

    it("should deserialize class Person into json with different possibilities for type of one property (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: [
                            { value: Sports, name: "sports" }, { value: Relaxing, name: "relax" }, { value: Programming, name: "program" }
                        ]
                    }
                })
                public hobby: any;
            }

            const model: Person = new Person();
            const program = new Programming();
            program.name = "typescript coding";
            program.specialAbility = "testing";
            model.name = "John Doe";
            model.hobby = program;
            const json: any = classToPlain(model);
            expect(json).to.be.not.instanceof(Person);
            expect(json.hobby).to.have.property("__type", "program");

        }).to.not.throw();
    });

    it("should deserialize class Person into json with different types in array (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: [
                            { value: Sports, name: "sports" }, { value: Relaxing, name: "relax" }, { value: Programming, name: "program" }
                        ]
                    }
                })
                public hobbies: any[];
            }

            const model: Person = new Person();
            const sport = new Sports();
            sport.name = "Football";
            const program = new Programming();
            program.name = "typescript coding";
            program.specialAbility = "testing";
            model.name = "John Doe";
            model.hobbies = [
                sport,
                program
            ];
            const json: any = classToPlain(model);
            expect(json).to.be.not.instanceof(Person);
            expect(json.hobbies[0]).to.have.property("__type", "sports");
            expect(json.hobbies[1]).to.have.property("__type", "program");

        }).to.not.throw();
    });

    it("should transform class Person into class OtherPerson with different possibilities for type of one property (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: [
                            { value: Sports, name: "sports" }, { value: Relaxing, name: "relax" }, { value: Programming, name: "program" }
                        ]
                    }
                })
                public hobby: any;
            }

            const model: Person = new Person();
            const program = new Programming();
            program.name = "typescript coding";
            program.specialAbility = "testing";
            model.name = "John Doe";
            model.hobby = program;
            const person: Person = classToClass(model);
            expect(person).to.be.instanceof(Person);
            expect(person.hobby).to.have.not.property("__type");

        }).to.not.throw();
    });

    it("should transform class Person into class OtherPerson with different types in array (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: [
                            { value: Sports, name: "sports" }, { value: Relaxing, name: "relax" }, { value: Programming, name: "program" }
                        ]
                    }
                })
                public hobbies: any[];
            }

            const model: Person = new Person();
            const sport = new Sports();
            sport.name = "Football";
            const program = new Programming();
            program.name = "typescript coding";
            program.specialAbility = "testing";
            model.name = "John Doe";
            model.hobbies = [
                sport,
                program
            ];
            const person: Person = classToClass(model);
            expect(person).to.be.instanceof(Person);
            expect(person.hobbies[0]).to.not.have.property("__type");
            expect(person.hobbies[1]).to.not.have.property("__type");

        }).to.not.throw();
    });

    it("should serialize json into model instance of class Person with different possibilities for type of one property AND uses default as fallback (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            const json = {
                name: "John Doe",
                hobby: { __type: "program", name: "typescript coding", specialAbility: "testing" }
            };

            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: []
                    },
                })
                public hobby: any;
            }

            const model: Person = plainToClass(Person, json);
            expect(model).to.be.instanceof(Person);
            expect(model.hobby).to.be.instanceof(Hobby);
            expect(model.hobby).to.not.have.property("__type");
            expect(model.hobby).to.have.property("specialAbility", "testing");
        }).to.not.throw();
    });

    it("should serialize json into model instance of class Person with different types in array AND uses default as fallback (polymorphism)", () => {
        defaultMetadataStorage.clear();
        expect(() => {
            const json = {
                name: "John Doe",
                hobbies: [
                    { __type: "program", name: "typescript coding", specialAbility: "testing" },
                    { __type: "relax", name: "sun" }
                ]
            };

            abstract class Hobby {
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

                @Type(() => Hobby, {
                    discriminator: {
                        property: "__type",
                        subTypes: []
                    },
                })
                public hobbies: any[];
            }


            const model: Person = plainToClass(Person, json);
            expect(model).to.be.instanceof(Person);
            expect(model.hobbies[0]).to.be.instanceof(Hobby);
            expect(model.hobbies[1]).to.be.instanceof(Hobby);
            expect(model.hobbies[0]).to.not.have.property("__type");
            expect(model.hobbies[1]).to.not.have.property("__type");
            expect(model.hobbies[1]).to.have.property("name", "sun");
            expect(model.hobbies[0]).to.have.property("specialAbility", "testing");
        }).to.not.throw();
    });

    it("should serialize a model into json", () => {
        expect(() => {
            classToPlain(model);
        }).to.not.throw();
    });

});
