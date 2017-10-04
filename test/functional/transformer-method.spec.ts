import "reflect-metadata";
import {defaultMetadataStorage} from "../../src/storage";
import {Exclude, Expose, TransformClassToClass, TransformClassToPlain} from "../../src/decorators";
import {expect} from "chai";

describe("transformer methods decorator", () => {

    it("should expose non configuration properties and return User instance class", () => {
        defaultMetadataStorage.clear();

        @Exclude()
        class User {

            id: number;

            @Expose()
            firstName: string;

            @Expose()
            lastName: string;

            password: string;
        }

        class UserController {

            @TransformClassToClass()
            getUser() {
                const user = new User();
                user.firstName = "Snir";
                user.lastName = "Segal";
                user.password = "imnosuperman";

                return user;
            }
        }

        const controller = new UserController();

        const result = controller.getUser();
        expect(result.password).to.be.undefined;

        const plainUser = {
            firstName: "Snir",
            lastName: "Segal"
        };


        expect(result).to.be.eql(plainUser);
        expect(result).to.be.instanceof(User);
    });

    it("should expose non configuration properties", () => {
        defaultMetadataStorage.clear();

        @Exclude()
        class User {

            id: number;

            @Expose()
            firstName: string;

            @Expose()
            lastName: string;

            password: string;
        }

        class UserController {

            @TransformClassToPlain()
            getUser() {
                const user = new User();
                user.firstName = "Snir";
                user.lastName = "Segal";
                user.password = "imnosuperman";

                return user;
            }
        }

        const controller = new UserController();

        const result = controller.getUser();
        expect(result.password).to.be.undefined;

        const plainUser = {
            firstName: "Snir",
            lastName: "Segal"
        };

        expect(result).to.be.eql(plainUser);
    });

    it("should expose non configuration properties and properties with specific groups", () => {
        defaultMetadataStorage.clear();

        @Exclude()
        class User {

            id: number;

            @Expose()
            firstName: string;

            @Expose()
            lastName: string;

            @Expose({groups: ["user.permissions"]})
            roles: string[];

            password: string;
        }

        class UserController {

            @TransformClassToPlain({groups: ["user.permissions"]})
            getUserWithRoles() {
                const user = new User();
                user.firstName = "Snir";
                user.lastName = "Segal";
                user.password = "imnosuperman";
                user.roles = ["USER", "MANAGER"];

                return user;
            }

        }

        const controller = new UserController();

        const result = controller.getUserWithRoles();
        expect(result.password).to.be.undefined;

        const plainUser = {
            firstName: "Snir",
            lastName: "Segal",
            roles: ["USER", "MANAGER"]
        };

        expect(result).to.be.eql(plainUser);
    });

    it("should expose non configuration properties with specific version", () => {
        defaultMetadataStorage.clear();

        @Exclude()
        class User {

            id: number;

            @Expose()
            firstName: string;

            @Expose()
            lastName: string;

            @Expose({groups: ["user.permissions"]})
            roles: string[];

            @Expose({since: 2})
            websiteUrl?: string;

            password: string;
        }

        class UserController {

            @TransformClassToPlain({version: 1})
            getUserVersion1() {
                const user = new User();
                user.firstName = "Snir";
                user.lastName = "Segal";
                user.password = "imnosuperman";
                user.roles = ["USER", "MANAGER"];
                user.websiteUrl = "http://www.github.com";

                return user;
            }

            @TransformClassToPlain({version: 2})
            getUserVersion2() {
                const user = new User();
                user.firstName = "Snir";
                user.lastName = "Segal";
                user.password = "imnosuperman";
                user.roles = ["USER", "MANAGER"];
                user.websiteUrl = "http://www.github.com";

                return user;
            }

        }

        const controller = new UserController();

        const resultV2 = controller.getUserVersion2();
        expect(resultV2.password).to.be.undefined;
        expect(resultV2.roles).to.be.undefined;

        const plainUserV2 = {
            firstName: "Snir",
            lastName: "Segal",
            websiteUrl: "http://www.github.com"
        };

        expect(resultV2).to.be.eql(plainUserV2);

        const resultV1 = controller.getUserVersion1();
        expect(resultV1.password).to.be.undefined;
        expect(resultV1.roles).to.be.undefined;
        expect(resultV1.websiteUrl).to.be.undefined;

        const plainUserV1 = {
            firstName: "Snir",
            lastName: "Segal"
        };

        expect(resultV1).to.be.eql(plainUserV1);
    });

});
