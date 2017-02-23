import "reflect-metadata";
import { classToPlain, plainToClass } from "../../src/index";
import { defaultMetadataStorage } from "../../src/storage";
import { Expose, Transform, Type } from "../../src/decorators";
import * as moment from "moment";

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

        plainToClass(User, plainUser);
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

    it("Non class objects should not break if transform is used", () => {
        defaultMetadataStorage.clear();


        class User {

            id: number;

            name: string;

            @Type(() => Test)
            @Transform(value => ArrayUtil.toArray<Test>(value))
            date: Test[];

            @Type(() => Date)
            lastVisitDate: Date;

        }

        class ArrayUtil {
            public static toArray<T>(object: T): T[] {
                let obj = new Array<any>();

                if (!(object instanceof Array)) {
                    obj.push(object);
                } else {
                    obj = object;
                }

                return obj;
            }
        }


        class Test {
            test: string;
        }

        let plainBuilding = {
            address: "1234 Purple Drive"
        };

        let test = classToPlain({"success": true});
        test.should.be.eql({"success": true});
    });


});
