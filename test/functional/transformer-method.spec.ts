import "reflect-metadata";
import {defaultMetadataStorage} from "../../src/storage";
import {Exclude, Expose, TransformClassToClass, TransformClassToPlain, TransformPlainToClass} from "../../src/decorators";

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
        expect(result.password).toBeUndefined();

        const plainUser = {
            firstName: "Snir",
            lastName: "Segal"
        };


        expect(result).toEqual(plainUser);
        expect(result).toBeInstanceOf(User);
    });

    it("should expose non configuration properties and return User instance class instead of plain object", () => {
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

            @TransformPlainToClass(User)
            getUser() {
                const user: any = {};
                user.firstName = "Snir";
                user.lastName = "Segal";
                user.password = "imnosuperman";

                return user;
            }
        }

        const controller = new UserController();

        const result = controller.getUser();
        expect(result.password).toBeUndefined();

        const user = new User();
        user.firstName = "Snir";
        user.lastName = "Segal";

        expect(result).toEqual(user);
        expect(result).toBeInstanceOf(User);
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
            expect(result.password).toBeUndefined();

        const plainUser = {
            firstName: "Snir",
            lastName: "Segal"
        };

        expect(result).toEqual(plainUser);
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

            @Expose({ groups: ["user.permissions"] })
            roles: string[];

            password: string;
        }

        class UserController {

            @TransformClassToPlain({ groups: ["user.permissions"] })
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
        expect(result.password).toBeUndefined();

        const plainUser = {
            firstName: "Snir",
            lastName: "Segal",
            roles: ["USER", "MANAGER"]
        };

        expect(result).toEqual(plainUser);
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

            @Expose({ groups: ["user.permissions"] })
            roles: string[];

            @Expose({ since: 2 })
            websiteUrl?: string;

            password: string;
        }

        class UserController {

            @TransformClassToPlain({ version: 1 })
            getUserVersion1() {
                const user = new User();
                user.firstName = "Snir";
                user.lastName = "Segal";
                user.password = "imnosuperman";
                user.roles = ["USER", "MANAGER"];
                user.websiteUrl = "http://www.github.com";

                return user;
            }

            @TransformClassToPlain({ version: 2 })
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
        expect(resultV2.password).toBeUndefined();
        expect(resultV2.roles).toBeUndefined();

        const plainUserV2 = {
            firstName: "Snir",
            lastName: "Segal",
            websiteUrl: "http://www.github.com"
        };

        expect(resultV2).toEqual(plainUserV2);

        const resultV1 = controller.getUserVersion1();
        expect(resultV1.password).toBeUndefined();
        expect(resultV1.roles).toBeUndefined();
        expect(resultV1.websiteUrl).toBeUndefined();

        const plainUserV1 = {
            firstName: "Snir",
            lastName: "Segal"
        };

        expect(resultV1).toEqual(plainUserV1);
    });

});
