import "reflect-metadata";
import {classToPlain, classToClass, plainToClass} from "../../src/index";
import {defaultMetadataStorage} from "../../src/storage";
import {TransformOperationExecutor} from "../../src/TransformOperationExecutor";
import {assert} from "chai";
import * as sinon from "sinon";

describe("circular reference problem", () => {

    it("should skip circular reference objects in classToPlain operation", () => {
        defaultMetadataStorage.clear();

        class Caption {
            text: string;
        }

        class Photo {
            id: number;
            filename: string;
            user: User;
            users: User[];

            caption: Caption;
        }

        class User {
            id: number;
            firstName: string;
            caption: Caption;
            photos: Photo[];
        }

        const photo1 = new Photo();
        photo1.id = 1;
        photo1.filename = "me.jpg";

        const photo2 = new Photo();
        photo2.id = 2;
        photo2.filename = "she.jpg";

        const caption = new Caption();
        caption.text = "cool photo";

        const user = new User();
        user.caption = caption;
        user.firstName = "Umed Khudoiberdiev";
        user.photos = [photo1, photo2];

        photo1.user = user;
        photo2.user = user;
        photo1.users = [user];
        photo2.users = [user];

        photo1.caption = caption;
        photo2.caption = caption;

        const plainUser = classToPlain(user, { enableCircularCheck: true });
        plainUser.should.be.eql({
            firstName: "Umed Khudoiberdiev",
            caption: { text: "cool photo" },
            photos: [{
                id: 1,
                filename: "me.jpg",
                users: [],
                caption: { text: "cool photo" }
            }, {
                id: 2,
                filename: "she.jpg",
                users: [],
                caption: { text: "cool photo" }
            }]
        });

    });

    it("should not skip circular reference objects, but handle it correctly in classToClass operation", () => {
        defaultMetadataStorage.clear();

        class Photo {
            id: number;
            filename: string;
            user: User;
            users: User[];
        }

        class User {
            id: number;
            firstName: string;
            photos: Photo[];
        }

        const photo1 = new Photo();
        photo1.id = 1;
        photo1.filename = "me.jpg";

        const photo2 = new Photo();
        photo2.id = 2;
        photo2.filename = "she.jpg";

        const user = new User();
        user.firstName = "Umed Khudoiberdiev";
        user.photos = [photo1, photo2];

        photo1.user = user;
        photo2.user = user;
        photo1.users = [user];
        photo2.users = [user];

        const classUser = classToClass(user, { enableCircularCheck: true });
        classUser.should.not.be.equal(user);
        classUser.should.be.instanceOf(User);
        classUser.should.be.eql(user);

    });

    describe("enableCircularCheck option", () => {
        class Photo {
            id: number;
            filename: string;
        }

        class User {
            id: number;
            firstName: string;
            photos: Photo[];
        }
        let isCircularSpy: sinon.SinonSpy;
        const photo1 = new Photo();
        photo1.id = 1;
        photo1.filename = "me.jpg";

        const user = new User();
        user.firstName = "Umed Khudoiberdiev";
        user.photos = [photo1];

        beforeEach(() => {
            isCircularSpy = sinon.spy(TransformOperationExecutor.prototype, "isCircular" as any);
        });

        afterEach(() => {
            isCircularSpy.restore();
        });

        it("enableCircularCheck option is undefined (default)", () => {
            const result = plainToClass<User, Object>(User, user);
            sinon.assert.notCalled(isCircularSpy);
        });

        it("enableCircularCheck option is true", () => {
            const result = plainToClass<User, Object>(User, user, { enableCircularCheck: true });
            sinon.assert.called(isCircularSpy);
        });
    });
});
