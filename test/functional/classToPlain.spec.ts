import "reflect-metadata";
import {defaultMetadataStorage, classToPlain} from "../../src/index";
import {Exclude, Expose, Type} from "../../src/decorators";
import {expect} from "chai";

describe("classToPlain", () => {

    it("should convert instance of the given object to plain javascript object and should expose all properties since its a default behaviour", () => {
        defaultMetadataStorage.clear();

        class User {
            firstName: string;
            lastName: string;
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";
        const plainUser = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        });
    });

    it("should exclude all objects marked with @Exclude() decorator", () => {
        defaultMetadataStorage.clear();

        class User {
            firstName: string;
            lastName: string;
            @Exclude()
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";
        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
        expect(plainUser.password).to.be.undefined;
    });

    it("should exclude all properties from object if whole class is marked with @Exclude() decorator", () => {
        defaultMetadataStorage.clear();

        @Exclude()
        class User {
            firstName: string;
            lastName: string;
            password: string;
        }

        const user = new User();
        user.firstName = "Umed";
        user.lastName = "Khudoiberdiev";
        user.password = "imnosuperman";
        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({});
        expect(plainUser.firstName).to.be.undefined;
        expect(plainUser.lastName).to.be.undefined;
        expect(plainUser.password).to.be.undefined;
    });

    it("should exclude all properties from object if whole class is marked with @Exclude() decorator, but include properties marked with @Expose() decorator", () => {
        defaultMetadataStorage.clear();

        @Exclude()
        class User {

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
        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
        expect(plainUser.password).to.be.undefined;
    });

    it("should exclude all properties from object if its defined via transformation options, but include properties marked with @Expose() decorator", () => {
        defaultMetadataStorage.clear();

        class User {

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
        const plainUser: any = classToPlain(user, { strategy: "excludeAll" });
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });
        expect(plainUser.password).to.be.undefined;
    });

    it("should expose all properties from object if its defined via transformation options, but exclude properties marked with @Exclude() decorator", () => {
        defaultMetadataStorage.clear();

        class User {

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
        const plainUser: any = classToPlain(user, { strategy: "exposeAll" });
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed"
        });
        expect(plainUser.lastName).to.be.undefined;
        expect(plainUser.password).to.be.undefined;
    });

    it("should convert values to specific types if they are set via @Type decorator", () => {
        defaultMetadataStorage.clear();

        class User {

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
        }

        class User {

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

        const plainUser2: any = classToPlain(user, { version: 0.3 });
        plainUser2.should.not.be.instanceOf(User);
        plainUser2.should.be.eql({
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

        const plainUser4: any = classToPlain(user, { version: 1 });
        plainUser4.should.not.be.instanceOf(User);
        plainUser4.should.be.eql({
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

        const plainUser6: any = classToPlain(user, { version: 2 });
        plainUser6.should.not.be.instanceOf(User);
        plainUser6.should.be.eql({
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

        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            name: "Umed Khudoiberdiev",
            getName: "Umed Khudoiberdiev"
        });

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

        const plainUser: any = classToPlain(user);
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            myName: "Umed",
            secondName: "Khudoiberdiev",
            name: "Umed Khudoiberdiev",
            fullName: "Umed Khudoiberdiev"
        });

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

        const plainUser: any = classToPlain(user, { excludePrefixes: ["_", "$"] });
        plainUser.should.not.be.instanceOf(User);
        plainUser.should.be.eql({
            name: "Umed Khudoiberdiev",
            photo: {
                id: 1,
                status: 1
            }
        });

    });

    it("should be able to transform array too", () => {
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
        plainUsers.should.not.be.instanceOf(User);
        plainUsers.should.be.eql([{
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            name: "Umed Khudoiberdiev"
        }, {
            firstName: "Dima",
            lastName: "Zotov",
            name: "Dima Zotov"
        }]);

    });

});

/*
{
    name: "myName",
    since: 2.4,
    until: 5,
    groups: ["users", "admin-users"]
}*/
