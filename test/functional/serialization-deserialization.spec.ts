import "reflect-metadata";
import {serialize, deserialize, deserializeArray} from "../../src/index";
import {defaultMetadataStorage} from "../../src/storage";
import {Exclude} from "../../src/decorators";

describe("serialization and deserialization objects", () => {

    it("should perform serialization and deserialization properly", () => {
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

        const user1 = new User();
        user1.firstName = "Dima";
        user1.lastName = "Zotov";
        user1.password = "imnosuperman";

        const user2 = new User();
        user2.firstName = "Bakhrom";
        user2.lastName = "Baubekov";
        user2.password = "imnosuperman";

        const users = [user1, user2];

        const plainUser = {
            firstName: "Umed",
            lastName: "Khudoiberdiev",
            password: "imnosuperman"
        };

        const plainUsers = [{
            firstName: "Dima",
            lastName: "Zotov",
            password: "imnobatman"
        }, {
            firstName: "Bakhrom",
            lastName: "Baubekov",
            password: "imnosuperman"
        }];

        const plainedUser = serialize(user);
        plainedUser.should.be.eql(JSON.stringify({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        }));

        const plainedUsers = serialize(users);
        plainedUsers.should.be.eql(JSON.stringify([{
            firstName: "Dima",
            lastName: "Zotov",
        }, {
            firstName: "Bakhrom",
            lastName: "Baubekov",
        }]));

        const classedUser = deserialize(User, JSON.stringify(plainUser));
        classedUser.should.be.instanceOf(User);
        classedUser.should.be.eql({
            firstName: "Umed",
            lastName: "Khudoiberdiev"
        });

        const classedUsers = deserializeArray(User, JSON.stringify(plainUsers));
        classedUsers[0].should.be.instanceOf(User);
        classedUsers[1].should.be.instanceOf(User);

        const userLike1 = new User();
        userLike1.firstName = "Dima";
        userLike1.lastName = "Zotov";

        const userLike2 = new User();
        userLike2.firstName = "Bakhrom";
        userLike2.lastName = "Baubekov";

        classedUsers.should.be.eql([userLike1, userLike2]);
    });

});