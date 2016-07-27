import "reflect-metadata";
import {defaultMetadataStorage, classToPlain, plainToClass} from "../../src/index";
import {Type} from "../../src/decorators";

describe("es6 data types", () => {

    it("using Map", () => {
        defaultMetadataStorage.clear();

        class User {
            id: number;
            name: string;
            @Type(() => Map)
            weapons: Map<string, string>;
        }

        let plainUser = {
            id: 1,
            name: "Max Pain",
            weapons: {
                firstWeapon: "knife",
                secondWeapon: "eagle",
                thirdWeapon: "ak-47",
            }
        };

        const weapons = new Map<string, string>();
        weapons.set("firstWeapon", "knife");
        weapons.set("secondWeapon", "eagle");
        weapons.set("thirdWeapon", "ak-47");

        const user = new User();
        user.id = 1;
        user.name = "Max Pain";
        user.weapons = weapons;

        const classedUser = plainToClass(User, plainUser);
        classedUser.should.be.instanceOf(User);
        classedUser.id.should.be.equal(1);
        classedUser.name.should.be.equal("Max Pain");
        classedUser.weapons.should.be.instanceOf(Map);
        classedUser.weapons.size.should.be.equal(3);
        classedUser.weapons.get("firstWeapon").should.be.equal("knife");
        classedUser.weapons.get("secondWeapon").should.be.equal("eagle");
        classedUser.weapons.get("thirdWeapon").should.be.equal("ak-47");

        const plainedUser = classToPlain(user);
        plainedUser.should.not.be.instanceOf(User);
        plainedUser.should.be.eql({
            id: 1,
            name: "Max Pain",
            weapons: {
                firstWeapon: "knife",
                secondWeapon: "eagle",
                thirdWeapon: "ak-47",
            }
        });

    });

    it("using Set", () => {
        defaultMetadataStorage.clear();

        class User {
            id: number;
            name: string;
            @Type(() => Set)
            weapons: Set<string>;
        }

        let plainUser = {
            id: 1,
            name: "Max Pain",
            weapons: [
                "knife",
                "eagle",
                "ak-47"
            ]
        };

        const weapons = new Set<string>();
        weapons.add("knife");
        weapons.add("eagle");
        weapons.add("ak-47");

        const user = new User();
        user.id = 1;
        user.name = "Max Pain";
        user.weapons = weapons;

        const classedUser = plainToClass(User, plainUser);
        classedUser.should.be.instanceOf(User);
        classedUser.id.should.be.equal(1);
        classedUser.name.should.be.equal("Max Pain");
        classedUser.weapons.should.be.instanceOf(Set);
        classedUser.weapons.size.should.be.equal(3);
        classedUser.weapons.has("knife").should.be.true;
        classedUser.weapons.has("eagle").should.be.true;
        classedUser.weapons.has("ak-47").should.be.true;

        const plainedUser = classToPlain(user);
        plainedUser.should.not.be.instanceOf(User);
        plainedUser.should.be.eql({
            id: 1,
            name: "Max Pain",
            weapons: [
                "knife",
                "eagle",
                "ak-47"
            ]
        });

    });


});