import "reflect-metadata";
import {
    classToPlain,
    classToPlainFromExist,
    plainToClass,
    plainToClassFromExist,
    classToClass, classToClassFromExist
} from "../../src/index";
import {getDefaultMetadataStorage} from "../../src/storage";
import {Exclude, Expose, Type} from "../../src/decorators";
import {expect} from "chai";

describe("filtering by transformation option", () => {

    it("@Exclude with toPlainOnly set to true then it should be excluded only during classToPlain and classToPlainFromExist operations", () => {
        getDefaultMetadataStorage().clear();

        class User {

            id: number;

            firstName: string;

            lastName: string;

            @Exclude({ toPlainOnly: true })
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const plainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const plainedUser = classToPlain(user);
        plainedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const classedUser = plainToClass(User, plainUser);
        classedUser.should.be.instanceOf(User);
        classedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });
    });

    it("@Exclude with toClassOnly set to true then it should be excluded only during plainToClass and plainToClassFromExist operations", () => {
        getDefaultMetadataStorage().clear();

        class User {

            id: number;

            firstName: string;

            lastName: string;

            @Exclude({ toClassOnly: true })
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const plainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const classedUser = plainToClass(User, plainUser);
        classedUser.should.be.instanceOf(User);
        classedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const plainedUser = classToPlain(user);
        plainedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });
    });

    it("@Expose with toClassOnly set to true then it should be excluded only during classToPlain and classToPlainFromExist operations", () => {
        getDefaultMetadataStorage().clear();

        @Exclude()
        class User {

            @Expose()
            firstName: string;

            @Expose()
            lastName: string;

            @Expose({ toClassOnly: true })
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const plainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const plainedUser = classToPlain(user);
        plainedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const classedUser = plainToClass(User, plainUser);
        classedUser.should.be.instanceOf(User);
        classedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });
    });

    it("@Expose with toPlainOnly set to true then it should be excluded only during classToPlain and classToPlainFromExist operations", () => {
        getDefaultMetadataStorage().clear();

        @Exclude()
        class User {

            @Expose()
            firstName: string;

            @Expose()
            lastName: string;

            @Expose({ toPlainOnly: true })
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const plainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const plainedUser = classToPlain(user);
        plainedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });

        const classedUser = plainToClass(User, plainUser);
        classedUser.should.be.instanceOf(User);
        classedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
    });

});
