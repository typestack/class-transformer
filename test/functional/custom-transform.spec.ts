import "reflect-metadata";
import {classToPlain, plainToClass} from "../../src/index";
import {defaultMetadataStorage} from "../../src/storage";
import {Expose, Transform, Type} from "../../src/decorators";
import * as moment from "moment";
import {TransformationType} from "../../src/TransformOperationExecutor";

describe("custom transformation decorator", () => {

    it("@Expose decorator with \"name\" option should work with @Transform decorator", () => {
        defaultMetadataStorage.clear();

        class User {

            @Expose({name: "user_name"})
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

            @Transform(value => value.toString(), {toPlainOnly: true})
            @Transform(value => moment(value), {toClassOnly: true})
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
            @Transform(value => moment(value), {since: 1, until: 2})
            date: Date;

            @Type(() => Date)
            @Transform(value => value.toString(), {groups: ["user"]})
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

        const classedUser2 = plainToClass(User, plainUser, {version: 0.5});
        classedUser2.should.be.instanceOf(User);
        classedUser2.id.should.be.equal(1);
        classedUser2.name.should.be.equal("Johny Cage");
        classedUser2.date.should.be.instanceof(Date);

        const classedUser3 = plainToClass(User, plainUser, {version: 1});
        classedUser3.should.be.instanceOf(User);
        classedUser3.id.should.be.equal(1);
        classedUser3.name.should.be.equal("Johny Cage");
        moment.isMoment(classedUser3.date).should.be.true;

        const classedUser4 = plainToClass(User, plainUser, {version: 2});
        classedUser4.should.be.instanceOf(User);
        classedUser4.id.should.be.equal(1);
        classedUser4.name.should.be.equal("Johny Cage");
        classedUser4.date.should.be.instanceof(Date);

        const classedUser5 = plainToClass(User, plainUser, {groups: ["user"]});
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
            @Transform(transformCallback, {toPlainOnly: true})
            @Transform(transformCallback, {toClassOnly: true})
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

    it("should allow array transformations", () => {
        class Person {
            prop1: string;
            prop2: string;

            static fromCsv(csv: string) {
                const child = new Person();
                [child.prop1, child.prop2] = csv.split(",");
                return child;
            }

            toCsv() {
                return [this.prop1, this.prop2].join(",");
            }
        }

        class People {
            @Type(() => Person)
            @Transform((values: string[]) => values.map(value => Person.fromCsv(value)), {toClassOnly: true})
            @Transform((values: Person[]) => {
                console.log("Values:     " + JSON.stringify(values));
                console.log("1st value:  " + JSON.stringify(values[0]));
                console.log("is a Person: " + (values[0] instanceof Person));
                console.log("type:       " + (typeof values[0]));
                return values.map(value => value.toCsv());
            }, {toPlainOnly: true})
            persons: Person[];
        }

        class Singleton {
            @Type(() => Person)
            // this works
            @Transform(item => item.toCsv(), { toPlainOnly: true })
            @Transform(item => Person.fromCsv(item), { toClassOnly: true })
            person: Person;
        }

        const people = new People();
        people.persons = [Person.fromCsv("123,abc")];

        // deserialization works without an issue
        const expectedSerialized = {persons: ["123,abc"]};
        const deserialized = plainToClass(People, expectedSerialized);
        deserialized.should.deep.equal(people);

        // serialization has an issue however
        const actualSerialized = classToPlain(people);
        actualSerialized.should.to.deep.equal(expectedSerialized);
    });

});
