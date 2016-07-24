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

describe.skip("circular reference problem", () => {

    it("", () => {
        defaultMetadataStorage.clear();

        class Photo {
            id: number;
            filename: string;
            user: User;
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
        photo2.id = 1;
        photo2.filename = "me.jpg";

        const user = new User();
        user.firstName = "Umed Khudoiberdiev";
        user.photos = [photo1, photo2];
        user.photos.push(photo2);

        photo1.user = user;
        photo2.user = user;

        const plainUser = classToPlain(user);
        console.log(plainUser);

    });

});