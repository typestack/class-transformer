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

describe("specifying target maps", () => {

    it("should convert instance of the given object to plain javascript object and should expose all properties since its a default behaviour", () => {
        defaultMetadataStorage.clear();

        class User {
            id: number;
            firstName: string;
            lastName: string;
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const fromExistUser = new User();
        fromExistUser.id = 1;

        const plainUser = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });

        const existUser = { id: 1, age: 27 };
        const plainUser2 = classToPlainFromExist(user, existUser);
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
            id: 1,
            age: 27,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });
        plainUser2.should.be.equal(existUser);

        const transformedUser = plainToClass(User, fromPlainUser);
        transformedUser.should.be.instanceOf(User);
        transformedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });

        const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
        fromExistTransformedUser.should.be.instanceOf(User);
        fromExistTransformedUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });

        const classToClassUser = classToClass(user);
        classToClassUser.should.be.instanceOf(User);
        classToClassUser.should.not.be.equal(user);
        classToClassUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });

        const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
        classToClassFromExistUser.should.be.instanceOf(User);
        classToClassFromExistUser.should.not.be.equal(user);
        classToClassFromExistUser.should.be.equal(fromExistUser);
        classToClassFromExistUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });
    });

    it("should exclude all objects marked with @Exclude() decorator", () => {
        defaultMetadataStorage.clear();

        class User {
            id: number;
            firstName: string;
            lastName: string;
            @Exclude()
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const fromExistUser = new User();
        fromExistUser.id = 1;

        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
        expect(plainUser.password).to.be.undefined;

        const existUser = { id: 1, age: 27, password: "yayayaya" };
        const plainUser2 = classToPlainFromExist(user, existUser);
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
            id: 1,
            age: 27,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "yayayaya"
        });
        plainUser2.should.be.equal(existUser);

        const transformedUser = plainToClass(User, fromPlainUser);
        transformedUser.should.be.instanceOf(User);
        transformedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
        fromExistTransformedUser.should.be.instanceOf(User);
        fromExistTransformedUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const classToClassUser = classToClass(user);
        classToClassUser.should.be.instanceOf(User);
        classToClassUser.should.not.be.equal(user);
        classToClassUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
        classToClassFromExistUser.should.be.instanceOf(User);
        classToClassFromExistUser.should.not.be.equal(user);
        classToClassFromExistUser.should.be.equal(fromExistUser);
        classToClassFromExistUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
    });

    it("should exclude all properties from object if whole class is marked with @Exclude() decorator", () => {
        defaultMetadataStorage.clear();

        @Exclude()
        class User {
            id: number;
            firstName: string;
            lastName: string;
            password: string;
        }

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const fromExistUser = new User();
        fromExistUser.id = 1;

        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({});
        expect(plainUser.firstName).to.be.undefined;
        expect(plainUser.lastName).to.be.undefined;
        expect(plainUser.password).to.be.undefined;

        const existUser = { id: 1, age: 27 };
        const plainUser2 = classToPlainFromExist(user, existUser);
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
            id: 1,
            age: 27
        });
        plainUser2.should.be.equal(existUser);

        const transformedUser = plainToClass(User, fromPlainUser);
        transformedUser.should.be.instanceOf(User);
        transformedUser.should.be.eql({});

        const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
        fromExistTransformedUser.should.be.instanceOf(User);
        fromExistTransformedUser.should.be.eql({
            id: 1
        });

        const classToClassUser = classToClass(user);
        classToClassUser.should.be.instanceOf(User);
        classToClassUser.should.not.be.equal(user);
        classToClassUser.should.be.eql({});

        const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
        classToClassFromExistUser.should.be.instanceOf(User);
        classToClassFromExistUser.should.not.be.equal(user);
        classToClassFromExistUser.should.be.equal(fromExistUser);
        classToClassFromExistUser.should.be.eql({
            id: 1
        });
    });

    it("should exclude all properties from object if whole class is marked with @Exclude() decorator, but include properties marked with @Expose() decorator", () => {
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

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const fromExistUser = new User();
        fromExistUser.id = 1;

        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
        expect(plainUser.password).to.be.undefined;

        const existUser = { id: 1, age: 27 };
        const plainUser2 = classToPlainFromExist(user, existUser);
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
            id: 1,
            age: 27,
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
        plainUser2.should.be.equal(existUser);

        const transformedUser = plainToClass(User, fromPlainUser);
        transformedUser.should.be.instanceOf(User);
        transformedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
        fromExistTransformedUser.should.be.instanceOf(User);
        fromExistTransformedUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const classToClassUser = classToClass(user);
        classToClassUser.should.be.instanceOf(User);
        classToClassUser.should.not.be.equal(user);
        classToClassUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
        classToClassFromExistUser.should.be.instanceOf(User);
        classToClassFromExistUser.should.not.be.equal(user);
        classToClassFromExistUser.should.be.equal(fromExistUser);
        classToClassFromExistUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
    });

    it("should exclude all properties from object if its defined via transformation options, but include properties marked with @Expose() decorator", () => {
        defaultMetadataStorage.clear();

        class User {

            id: number;

            @Expose()
            firstName: string;

            @Expose()
            lastName: string;

            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const fromExistUser = new User();
        fromExistUser.id = 1;

        const plainUser: any = classToPlain(user, { strategy: "excludeAll" });
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
        expect(plainUser.password).to.be.undefined;

        const existUser = { id: 1, age: 27 };
        const plainUser2 = classToPlainFromExist(user, existUser, { strategy: "excludeAll" });
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
            id: 1,
            age: 27,
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
        plainUser2.should.be.equal(existUser);

        const transformedUser = plainToClass(User, fromPlainUser, { strategy: "excludeAll" });
        transformedUser.should.be.instanceOf(User);
        transformedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser, { strategy: "excludeAll" });
        fromExistTransformedUser.should.be.instanceOf(User);
        fromExistTransformedUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const classToClassUser = classToClass(user, { strategy: "excludeAll" });
        classToClassUser.should.be.instanceOf(User);
        classToClassUser.should.not.be.equal(user);
        classToClassUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const classToClassFromExistUser = classToClassFromExist(user, fromExistUser, { strategy: "excludeAll" });
        classToClassFromExistUser.should.be.instanceOf(User);
        classToClassFromExistUser.should.not.be.equal(user);
        classToClassFromExistUser.should.be.equal(fromExistUser);
        classToClassFromExistUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
    });

    it("should expose all properties from object if its defined via transformation options, but exclude properties marked with @Exclude() decorator", () => {
        defaultMetadataStorage.clear();

        class User {

            id: number;

            firstName: string;

            @Exclude()
            lastName: string;

            @Exclude()
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const fromExistUser = new User();
        fromExistUser.id = 1;

        const plainUser: any = classToPlain(user, { strategy: "exposeAll" });
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed"
        });
        expect(plainUser.lastName).to.be.undefined;
        expect(plainUser.password).to.be.undefined;

        const existUser = { id: 1, age: 27 };
        const plainUser2 = classToPlainFromExist(user, existUser, { strategy: "exposeAll" });
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
            id: 1,
            age: 27,
            firstName: "Umed"
        });
        plainUser2.should.be.equal(existUser);

        const transformedUser = plainToClass(User, fromPlainUser, { strategy: "exposeAll" });
        transformedUser.should.be.instanceOf(User);
        transformedUser.should.be.eql({
            firstName: "Umed"
        });

        const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser, { strategy: "exposeAll" });
        fromExistTransformedUser.should.be.instanceOf(User);
        fromExistTransformedUser.should.be.eql({
            id: 1,
            firstName: "Umed"
        });

        const classToClassUser = classToClass(user, { strategy: "exposeAll" });
        classToClassUser.should.be.instanceOf(User);
        classToClassUser.should.not.be.equal(user);
        classToClassUser.should.be.eql({
            firstName: "Umed"
        });

        const classToClassFromExistUser = classToClassFromExist(user, fromExistUser, { strategy: "exposeAll" });
        classToClassFromExistUser.should.be.instanceOf(User);
        classToClassFromExistUser.should.not.be.equal(user);
        classToClassFromExistUser.should.be.equal(fromExistUser);
        classToClassFromExistUser.should.be.eql({
            id: 1,
            firstName: "Umed"
        });
    });

    it("should convert values to specific types if they are set via @Type decorator", () => {
        defaultMetadataStorage.clear();

        class User {

            id: number;

            @Type(type => String)
            firstName: string;

            @Type(type => String)
            lastName: string;

            @Type(type => Number)
            password: number;

            @Type(type => Boolean)
            isActive: boolean;

            @Type(type => Date)
            registrationDate: Date;

            @Type(type => String)
            lastVisitDate: string;
        }

        const date = new Date();
        const user = new User();
        user.firstName = 321 as any;
        user.lastName = 123 as any;
        user.password = "123" as any;
        user.isActive = "1" as any;
        user.registrationDate = date.toString() as any;
        user.lastVisitDate = date as any;

        const fromPlainUser = {
            firstName: 321,
            lastName: 123,
            password: "123",
            isActive: "1",
            registrationDate: date.toString(),
            lastVisitDate: date
        };

        const fromExistUser = new User();
        fromExistUser.id = 1;

        const plainUser: any = classToPlain(user, { strategy: "exposeAll" });
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "321",
            lastName: "123",
            password: 123,
            isActive: true,
            registrationDate: new Date(date.toString()),
            lastVisitDate: date.toString(),
        });

        const existUser = { id: 1, age: 27 };
        const plainUser2 = classToPlainFromExist(user, existUser, { strategy: "exposeAll" });
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
            id: 1,
            age: 27,
            firstName: "321",
            lastName: "123",
            password: 123,
            isActive: true,
            registrationDate: new Date(date.toString()),
            lastVisitDate: date.toString(),
        });
        plainUser2.should.be.equal(existUser);

        const transformedUser = plainToClass(User, fromPlainUser, { strategy: "exposeAll" });
        transformedUser.should.be.instanceOf(User);
        transformedUser.should.be.eql({
            firstName: "321",
            lastName: "123",
            password: 123,
            isActive: true,
            registrationDate: new Date(date.toString()),
            lastVisitDate: date.toString(),
        });

        const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser, { strategy: "exposeAll" });
        fromExistTransformedUser.should.be.instanceOf(User);
        fromExistTransformedUser.should.be.eql({
            id: 1,
            firstName: "321",
            lastName: "123",
            password: 123,
            isActive: true,
            registrationDate: new Date(date.toString()),
            lastVisitDate: date.toString(),
        });

        const classToClassUser = classToClass(user, { strategy: "exposeAll" });
        classToClassUser.should.be.instanceOf(User);
        classToClassUser.should.not.be.equal(user);
        classToClassUser.should.be.eql({
            firstName: "321",
            lastName: "123",
            password: 123,
            isActive: true,
            registrationDate: new Date(date.toString()),
            lastVisitDate: date.toString(),
        });

        const classToClassFromExistUser = classToClassFromExist(user, fromExistUser, { strategy: "exposeAll" });
        classToClassFromExistUser.should.be.instanceOf(User);
        classToClassFromExistUser.should.not.be.equal(user);
        classToClassFromExistUser.should.be.equal(fromExistUser);
        classToClassFromExistUser.should.be.eql({
            id: 1,
            firstName: "321",
            lastName: "123",
            password: 123,
            isActive: true,
            registrationDate: new Date(date.toString()),
            lastVisitDate: date.toString(),
        });
    });

    it("should transform nested objects too and make sure their decorators are used too", () => {
        defaultMetadataStorage.clear();

        class Photo {

            id: number;

            name: string;

            @Exclude()
            filename: string;

            uploadDate: Date;

        }

        class User {

            firstName: string;

            lastName: string;

            @Exclude()
            password: string;

            photo: Photo; // type should be automatically guessed
        }

        const photo = new Photo();
        photo.id = 1;
        photo.name = "Me";
        photo.filename = "iam.jpg";
        photo.uploadDate = new Date();

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";
        user.photo = photo;

        const plainUser: any = classToPlain(user, { strategy: "exposeAll" });
        plainUser.should.not.be.instanceOf(User);
        plainUser.photo.should.not.be.instanceOf(Photo);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                name: "Me",
                uploadDate: photo.uploadDate
            }
        });
        expect(plainUser.password).to.be.undefined;
        expect(plainUser.photo.filename).to.be.undefined;
        expect(plainUser.photo.uploadDate).to.be.eql(photo.uploadDate);
        expect(plainUser.photo.uploadDate).not.to.be.equal(photo.uploadDate);

        const existUser = { id: 1, age: 27, photo: { id: 2, description: "photo" } };
        const plainUser2: any = classToPlainFromExist(user, existUser, { strategy: "exposeAll" });
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.photo.should.not.be.instanceOf(Photo);
        plainUser2.should.be.eql({
            id: 1,
            age: 27,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                name: "Me",
                uploadDate: photo.uploadDate,
                description: "photo"
            }
        });
        plainUser2.should.be.equal(existUser);
        expect(plainUser2.password).to.be.undefined;
        expect(plainUser2.photo.filename).to.be.undefined;
        expect(plainUser2.photo.uploadDate).to.be.eql(photo.uploadDate);
        expect(plainUser2.photo.uploadDate).not.to.be.equal(photo.uploadDate);
    });

    it("should transform nested objects too and make sure given type is used instead of automatically guessed one", () => {
        defaultMetadataStorage.clear();

        class Photo {

            id: number;

            name: string;

            @Exclude()
            filename: string;

        }

        class ExtendedPhoto implements Photo {
            id: number;

            @Exclude()
            name: string;

            filename: string;
        }

        class User {

            id: number;

            firstName: string;

            lastName: string;

            @Exclude()
            password: string;

            @Type(type => ExtendedPhoto) // force specific type
            photo: Photo;
        }

        const photo = new Photo();
        photo.id = 1;
        photo.name = "Me";
        photo.filename = "iam.jpg";

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";
        user.photo = photo;

        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                filename: "iam.jpg"
            }
        });
        expect(plainUser.password).to.be.undefined;
        expect(plainUser.photo.name).to.be.undefined;
    });

    it("should convert given plain object to class instance object", () => {
        defaultMetadataStorage.clear();

        class Photo {

            id: number;

            name: string;

            @Exclude()
            filename: string;

            metadata: string;

            uploadDate: Date;

        }

        class User {

            id: number;

            firstName: string;

            lastName: string;

            @Exclude()
            password: string;

            @Type(type => Photo)
            photo: Photo;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";
        user.photo = new Photo();
        user.photo.id = 1;
        user.photo.name = "Me";
        user.photo.filename = "iam.jpg";
        user.photo.uploadDate = new Date();

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            photo: {
                id: 1,
                name: "Me",
                filename: "iam.jpg",
                uploadDate: new Date(),
            }
        };

        const fromExistUser = new User();
        fromExistUser.id = 1;
        const fromExistPhoto = new Photo();
        fromExistPhoto.metadata = "taken by Camera";
        fromExistUser.photo = fromExistPhoto;

        const transformedUser = plainToClass(User, fromPlainUser);
        transformedUser.should.be.instanceOf(User);
        transformedUser.photo.should.be.instanceOf(Photo);
        transformedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                name: "Me",
                uploadDate: fromPlainUser.photo.uploadDate
            }
        });

        const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser);
        fromExistTransformedUser.should.be.equal(fromExistUser);
        fromExistTransformedUser.photo.should.be.equal(fromExistPhoto);
        fromExistTransformedUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                name: "Me",
                metadata: "taken by Camera",
                uploadDate: fromPlainUser.photo.uploadDate
            }
        });

        const classToClassUser = classToClass(user);
        classToClassUser.should.be.instanceOf(User);
        classToClassUser.photo.should.be.instanceOf(Photo);
        classToClassUser.should.not.be.equal(user);
        classToClassUser.should.not.be.equal(user.photo);
        classToClassUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                name: "Me",
                uploadDate: fromPlainUser.photo.uploadDate
            }
        });

        const classToClassFromExistUser = classToClassFromExist(user, fromExistUser);
        classToClassFromExistUser.should.be.instanceOf(User);
        classToClassFromExistUser.photo.should.be.instanceOf(Photo);
        classToClassFromExistUser.should.not.be.equal(user);
        classToClassFromExistUser.should.not.be.equal(user.photo);
        classToClassFromExistUser.should.be.equal(fromExistUser);
        classToClassFromExistUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                name: "Me",
                metadata: "taken by Camera",
                uploadDate: fromPlainUser.photo.uploadDate
            }
        });
    });

    it("should expose only properties that match given group", () => {
        defaultMetadataStorage.clear();

        class Photo {
            id: number;

            @Expose({
                groups: ["user", "guest"]
            })
            filename: string;

            @Expose({
                groups: ["admin"]
            })
            status: number;

            metadata: string;
        }

        class User {

            id: number;

            firstName: string;

            @Expose({
                groups: ["user", "guest"]
            })
            lastName: string;

            @Expose({
                groups: ["user"]
            })
            password: string;

            @Expose({
                groups: ["admin"]
            })
            isActive: boolean;

            @Type(type => Photo)
            photo: Photo;

            @Expose({
                groups: ["admin"]
            })
            @Type(type => Photo)
            photos: Photo[];

        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";
        user.isActive = false;
        user.photo = new Photo();
        user.photo.id = 1;
        user.photo.filename = "myphoto.jpg";
        user.photo.status = 1;
        user.photos = [user.photo];

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            isActive: false,
            photo: {
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            },
            photos: [{
                id: 1,
                filename: "myphoto.jpg",
                status: 1,
            }]
        };

        const fromExistUser = new User();
        fromExistUser.id = 1;
        fromExistUser.photo = new Photo();
        fromExistUser.photo.metadata = "taken by Camera";

        const plainUser1: any = classToPlain(user);
        plainUser1.should.not.be.instanceOf(User);
        plainUser1.should.be.eql({
            firstName: "Umed",
            photo: {
                id: 1
            }
        });
        expect(plainUser1.lastName).to.be.undefined;
        expect(plainUser1.password).to.be.undefined;
        expect(plainUser1.isActive).to.be.undefined;

        const plainUser2: any = classToPlain(user, { groups: ["user"] });
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            photo: {
                id: 1,
                filename: "myphoto.jpg"
            }
        });
        expect(plainUser2.isActive).to.be.undefined;

        const transformedUser2 = plainToClass(User, fromPlainUser, { groups: ["user"] });
        transformedUser2.should.be.instanceOf(User);
        transformedUser2.photo.should.be.instanceOf(Photo);
        transformedUser2.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            photo: {
                id: 1,
                filename: "myphoto.jpg"
            }
        });

        const fromExistTransformedUser = plainToClassFromExist(fromExistUser, fromPlainUser, { groups: ["user"] });
        fromExistTransformedUser.should.be.equal(fromExistUser);
        fromExistTransformedUser.photo.should.be.equal(fromExistUser.photo);
        fromExistTransformedUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            photo: {
                id: 1,
                metadata: "taken by Camera",
                filename: "myphoto.jpg"
            }
        });

        const classToClassUser = classToClass(user, { groups: ["user"] });
        classToClassUser.should.be.instanceOf(User);
        classToClassUser.photo.should.be.instanceOf(Photo);
        classToClassUser.should.not.be.equal(user);
        classToClassUser.should.not.be.equal(user.photo);
        classToClassUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            photo: {
                id: 1,
                filename: "myphoto.jpg"
            }
        });

        const classToClassFromExistUser = classToClassFromExist(user, fromExistUser, { groups: ["user"] });
        classToClassFromExistUser.should.be.instanceOf(User);
        classToClassFromExistUser.photo.should.be.instanceOf(Photo);
        classToClassFromExistUser.should.not.be.equal(user);
        classToClassFromExistUser.should.not.be.equal(user.photo);
        classToClassFromExistUser.should.be.equal(fromExistUser);
        classToClassFromExistUser.should.be.eql({
            id: 1,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            photo: {
                id: 1,
                metadata: "taken by Camera",
                filename: "myphoto.jpg"
            }
        });

        const plainUser3: any = classToPlain(user, { groups: ["guest"] });
        plainUser3.should.not.be.instanceOf(User);
        plainUser3.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                filename: "myphoto.jpg"
            }
        });
        expect(plainUser3.password).to.be.undefined;
        expect(plainUser3.isActive).to.be.undefined;

        const transformedUser3 = plainToClass(User, fromPlainUser, { groups: ["guest"] });
        transformedUser3.should.be.instanceOf(User);
        transformedUser3.photo.should.be.instanceOf(Photo);
        transformedUser3.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                filename: "myphoto.jpg"
            }
        });

        const plainUser4: any = classToPlain(user, { groups: ["admin"] });
        plainUser4.should.not.be.instanceOf(User);
        plainUser4.should.be.eql({
            firstName: "Umed",
            isActive: false,
            photo: {
                id: 1,
                status: 1
            },
            photos: [{
                id: 1,
                status: 1
            }]
        });
        expect(plainUser4.lastName).to.be.undefined;
        expect(plainUser4.password).to.be.undefined;

        const transformedUser4 = plainToClass(User, fromPlainUser, { groups: ["admin"] });
        transformedUser4.should.be.instanceOf(User);
        transformedUser4.photo.should.be.instanceOf(Photo);
        transformedUser4.photos[0].should.be.instanceOf(Photo);
        transformedUser4.should.be.eql({
            firstName: "Umed",
            isActive: false,
            photo: {
                id: 1,
                status: 1
            },
            photos: [{
                id: 1,
                status: 1
            }]
        });

        const plainUser5: any = classToPlain(user, { groups: ["admin", "user"] });
        plainUser5.should.not.be.instanceOf(User);
        plainUser5.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            isActive: false,
            photo: {
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            },
            photos: [{
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            }]
        });

        const transformedUser5 = plainToClass(User, fromPlainUser, { groups: ["admin", "user"] });
        transformedUser5.should.be.instanceOf(User);
        transformedUser5.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            isActive: false,
            photo: {
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            },
            photos: [{
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            }]
        });
    });

    it("should expose only properties that match given version", () => {
        defaultMetadataStorage.clear();

        class Photo {
            id: number;

            @Expose({
                since: 1.5,
                until: 2
            })
            filename: string;

            @Expose({
                since: 2
            })
            status: number;
        }

        class User {

            @Expose({
                since: 1,
                until: 2
            })
            firstName: string;

            @Expose({
                since: 0.5
            })
            lastName: string;

            @Exclude()
            password: string;

            @Type(type => Photo)
            photo: Photo;

            @Expose({
                since: 3
            })
            @Type(type => Photo)
            photos: Photo[];

        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";
        user.photo = new Photo();
        user.photo.id = 1;
        user.photo.filename = "myphoto.jpg";
        user.photo.status = 1;
        user.photos = [user.photo];

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman",
            photo: {
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            },
            photos: [{
                id: 1,
                filename: "myphoto.jpg",
                status: 1,
            }]
        };

        const plainUser1: any = classToPlain(user);
        plainUser1.should.not.be.instanceOf(User);
        plainUser1.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            },
            photos: [{
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            }]
        });

        const transformedUser1 = plainToClass(User, fromPlainUser);
        transformedUser1.should.be.instanceOf(User);
        transformedUser1.photo.should.be.instanceOf(Photo);
        transformedUser1.photos[0].should.be.instanceOf(Photo);
        transformedUser1.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            },
            photos: [{
                id: 1,
                filename: "myphoto.jpg",
                status: 1
            }]
        });

        const plainUser2: any = classToPlain(user, { version: 0.3 });
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
            photo: {
                id: 1
            }
        });

        const transformedUser2 = plainToClass(User, fromPlainUser, { version: 0.3 });
        transformedUser2.should.be.instanceOf(User);
        transformedUser2.photo.should.be.instanceOf(Photo);
        transformedUser2.should.be.eql({
            photo: {
                id: 1
            }
        });

        const plainUser3: any = classToPlain(user, { version: 0.5 });
        plainUser3.should.not.be.instanceOf(User);
        plainUser3.should.be.eql({
            lastName: "Khudoiberdiev",
            photo: {
                id: 1
            }
        });

        const transformedUser3 = plainToClass(User, fromPlainUser, { version: 0.5 });
        transformedUser3.should.be.instanceOf(User);
        transformedUser3.photo.should.be.instanceOf(Photo);
        transformedUser3.should.be.eql({
            lastName: "Khudoiberdiev",
            photo: {
                id: 1
            }
        });

        const plainUser4: any = classToPlain(user, { version: 1 });
        plainUser4.should.not.be.instanceOf(User);
        plainUser4.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1
            }
        });

        const transformedUser4 = plainToClass(User, fromPlainUser, { version: 1 });
        transformedUser4.should.be.instanceOf(User);
        transformedUser4.photo.should.be.instanceOf(Photo);
        transformedUser4.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1
            }
        });

        const plainUser5: any = classToPlain(user, { version: 1.5 });
        plainUser5.should.not.be.instanceOf(User);
        plainUser5.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                filename: "myphoto.jpg"
            }
        });

        const transformedUser5 = plainToClass(User, fromPlainUser, { version: 1.5 });
        transformedUser5.should.be.instanceOf(User);
        transformedUser5.photo.should.be.instanceOf(Photo);
        transformedUser5.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                filename: "myphoto.jpg"
            }
        });

        const plainUser6: any = classToPlain(user, { version: 2 });
        plainUser6.should.not.be.instanceOf(User);
        plainUser6.should.be.eql({
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                status: 1
            }
        });

        const transformedUser6 = plainToClass(User, fromPlainUser, { version: 2 });
        transformedUser6.should.be.instanceOf(User);
        transformedUser6.photo.should.be.instanceOf(Photo);
        transformedUser6.should.be.eql({
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                status: 1
            }
        });

        const plainUser7: any = classToPlain(user, { version: 3 });
        plainUser7.should.not.be.instanceOf(User);
        plainUser7.should.be.eql({
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                status: 1
            },
            photos: [{
                id: 1,
                status: 1
            }]
        });

        const transformedUser7 = plainToClass(User, fromPlainUser, { version: 3 });
        transformedUser7.should.be.instanceOf(User);
        transformedUser7.photo.should.be.instanceOf(Photo);
        transformedUser7.photos[0].should.be.instanceOf(Photo);
        transformedUser7.should.be.eql({
            lastName: "Khudoiberdiev",
            photo: {
                id: 1,
                status: 1
            },
            photos: [{
                id: 1,
                status: 1
            }]
        });

    });

    it("should expose method and accessors that have @Expose()", () => {
        defaultMetadataStorage.clear();

        class User {
            firstName: string;
            lastName: string;

            @Exclude()
            password: string;

            @Expose()
            get name(): string {
                return this.firstName + " " + this.lastName;
            }

            @Expose()
            getName(): string {
                return this.firstName + " " + this.lastName;
            }

        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const fromPlainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            name: "Umed Khudoiberdiev",
            getName: "Umed Khudoiberdiev"
        });

        const transformedUser = plainToClass(User, fromPlainUser);
        transformedUser.should.be.instanceOf(User);
        const likeUser = new User();
        likeUser.firstName = "Umed";
        likeUser.lastName = "Khudoiberdiev";
        transformedUser.should.be.eql(likeUser);

    });

    it("should expose with alternative name if its given", () => {
        defaultMetadataStorage.clear();

        class User {

            @Expose({ name: "myName" })
            firstName: string;

            @Expose({ name: "secondName" })
            lastName: string;

            @Exclude()
            password: string;

            @Expose()
            get name(): string {
                return this.firstName + " " + this.lastName;
            }

            @Expose({ name: "fullName" })
            getName(): string {
                return this.firstName + " " + this.lastName;
            }

        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";

        const fromPlainUser = {
            myName: "Umed",
            secondName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            myName: "Umed",
            secondName: "Khudoiberdiev",
            name: "Umed Khudoiberdiev",
            fullName: "Umed Khudoiberdiev"
        });

        const transformedUser = plainToClass(User, fromPlainUser);
        transformedUser.should.be.instanceOf(User);
        const likeUser = new User();
        likeUser.firstName = "Umed";
        likeUser.lastName = "Khudoiberdiev";
        transformedUser.should.be.eql(likeUser);

    });

    it("should exclude all prefixed properties if prefix is given", () => {
        defaultMetadataStorage.clear();

        class Photo {
            id: number;
            $filename: string;
            status: number;
        }

        class User {
            $system: string;
            _firstName: string;
            _lastName: string;

            @Exclude()
            password: string;

            @Type(() => Photo)
            photo: Photo;

            @Expose()
            get name(): string {
                return this._firstName + " " + this._lastName;
            }

        }

        const user = new User();
        user.$system = "@#$%^&*token(*&^%$#@!";
        user._firstName = "Umed";
        user._lastName = "Khudoiberdiev";
        user.password = "imnosuperman";
        user.photo = new Photo();
        user.photo.id = 1;
        user.photo.$filename = "myphoto.jpg";
        user.photo.status = 1;

        const fromPlainUser = {
            $system: "@#$%^&*token(*&^%$#@!",
            _firstName: "Khudoiberdiev",
            _lastName: "imnosuperman",
            password: "imnosuperman",
            photo: {
                id: 1,
                $filename: "myphoto.jpg",
                status: 1,
            }
        };

        const plainUser: any = classToPlain(user, { excludePrefixes: ["_", "$"] });
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            name: "Umed Khudoiberdiev",
            photo: {
                id: 1,
                status: 1
            }
        });

        const transformedUser = plainToClass(User, fromPlainUser, { excludePrefixes: ["_", "$"] });
        transformedUser.should.be.instanceOf(User);
        const likeUser = new User();
        likeUser.photo = new Photo();
        likeUser.photo.id = 1;
        likeUser.photo.status = 1;
        transformedUser.should.be.eql(likeUser);

    });

    it("should be able to transform array too", () => {
        defaultMetadataStorage.clear();


        class User {
            id: number;
            firstName: string;
            lastName: string;

            @Exclude()
            password: string;

            @Expose()
            get name(): string {
                return this.firstName + " " + this.lastName;
            }

        }

        const user1 = new User();
        user1.firstName = "Umed";
        user1.lastName = "Khudoiberdiev";
        user1.password = "imnosuperman";

        const user2 = new User();
        user2.firstName = "Dima";
        user2.lastName = "Zotov";
        user2.password = "imnomesser";

        const users = [user1, user2];

        const plainUsers: any = classToPlain(users);
        plainUsers.should.be.eql([{
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            name: "Umed Khudoiberdiev"
        }, {
            firstName: "Dima",
            lastName: "Zotov",
            name: "Dima Zotov"
        }]);

        const fromPlainUsers = [{
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            name: "Umed Khudoiberdiev"
        }, {
            firstName: "Dima",
            lastName: "Zotov",
            name: "Dima Zotov"
        }];

        const existUsers = [{ id: 1, age: 27 }, { id: 2, age: 30 }];
        const plainUser2 = classToPlainFromExist(users, existUsers);
        plainUser2.should.be.eql([{
            id: 1,
            age: 27,
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            name: "Umed Khudoiberdiev"
        }, {
            id: 2,
            age: 30,
            firstName: "Dima",
            lastName: "Zotov",
            name: "Dima Zotov"
        }]);

        const transformedUser = plainToClass(User, fromPlainUsers);

        transformedUser[0].should.be.instanceOf(User);
        transformedUser[1].should.be.instanceOf(User);
        const likeUser1 = new User();
        likeUser1.firstName = "Umed";
        likeUser1.lastName = "Khudoiberdiev";

        const likeUser2 = new User();
        likeUser2.firstName = "Dima";
        likeUser2.lastName = "Zotov";
        transformedUser.should.be.eql([likeUser1, likeUser2]);

        const classToClassUsers = classToClass(users);
        classToClassUsers[0].should.be.instanceOf(User);
        classToClassUsers[1].should.be.instanceOf(User);
        classToClassUsers[0].should.not.be.equal(user1);
        classToClassUsers[1].should.not.be.equal(user1);

        const classUserLike1 = new User();
        classUserLike1.firstName = "Umed";
        classUserLike1.lastName = "Khudoiberdiev";

        const classUserLike2 = new User();
        classUserLike2.firstName = "Dima";
        classUserLike2.lastName = "Zotov";

        classToClassUsers.should.be.eql([classUserLike1, classUserLike2]);

        const fromExistUser1 = new User();
        fromExistUser1.id = 1;

        const fromExistUser2 = new User();
        fromExistUser2.id = 2;

        const fromExistUsers = [fromExistUser1, fromExistUser2];

        const classToClassFromExistUser = classToClassFromExist(users, fromExistUsers);
        classToClassFromExistUser[0].should.be.instanceOf(User);
        classToClassFromExistUser[1].should.be.instanceOf(User);
        classToClassFromExistUser[0].should.not.be.equal(user1);
        classToClassFromExistUser[1].should.not.be.equal(user1);
        classToClassFromExistUser.should.be.eql(fromExistUsers);

        const fromExistUserLike1 = new User();
        fromExistUserLike1.id = 1;
        fromExistUserLike1.firstName = "Umed";
        fromExistUserLike1.lastName = "Khudoiberdiev";

        const fromExistUserLike2 = new User();
        fromExistUserLike2.id = 2;
        fromExistUserLike2.firstName = "Dima";
        fromExistUserLike2.lastName = "Zotov";

        classToClassFromExistUser.should.be.eql([fromExistUserLike1, fromExistUserLike2]);

    });

});