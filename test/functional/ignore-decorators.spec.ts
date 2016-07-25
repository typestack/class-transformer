import "reflect-metadata";
import {
    defaultMetadataStorage,
    classToPlain,
    classToPlainFromExist,
    plainToClass,
    plainToClassFromExist,
    classToClass, classToClassFromExist
} from "../../src/index";
import {Exclude, Expose, Type} from "../../src/decorators";
import {expect} from "chai";

describe("ignoring specific decorators", () => {

    it("when ignoreDecorators is set to true it should ignore all decorators", () => {
        defaultMetadataStorage.clear();

        class User {

            id: number;

            @Expose({ name: "lala" })
            firstName: string;

            @Expose({ groups: ["user"] })
            lastName: string;

            @Exclude()
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const plainedUser = classToPlain(user, { ignoreDecorators: true });
        plainedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });
    });

});