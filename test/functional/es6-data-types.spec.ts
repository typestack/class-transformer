import "reflect-metadata";
import {classToPlain, plainToClass} from "../../src/index";
import {defaultMetadataStorage} from "../../src/storage";
import {Type} from "../../src/decorators";

describe("es6 data types", () => {

    it("using Map", () => {
        defaultMetadataStorage.clear();

        class User {
            id: number;
            name: string;
            @Type(() => String)
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

    it("using Map with objects", () => {
        defaultMetadataStorage.clear();

        class Weapon {
            constructor(public model: string,
                        public range: number) {
            }
        }

        class User {
            id: number;
            name: string;
            @Type(() => Weapon)
            weapons: Map<string, Weapon>;
        }

        let plainUser = {
            id: 1,
            name: "Max Pain",
            weapons: {
                firstWeapon: {
                    model: "knife",
                    range: 1
                },
                secondWeapon: {
                    model: "eagle",
                    range: 200
                },
                thirdWeapon: {
                    model: "ak-47",
                    range: 800
                }
            }
        };

        const weapons = new Map<string, Weapon>();
        weapons.set("firstWeapon", new Weapon("knife", 1));
        weapons.set("secondWeapon", new Weapon("eagle", 200));
        weapons.set("thirdWeapon", new Weapon("ak-47", 800));

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
        classedUser.weapons.get("firstWeapon").should.be.instanceof(Weapon);
        classedUser.weapons.get("firstWeapon").should.be.eql({
            model: "knife",
            range: 1
        });
        classedUser.weapons.get("secondWeapon").should.be.instanceof(Weapon);
        classedUser.weapons.get("secondWeapon").should.be.eql({
            model: "eagle",
            range: 200
        });
        classedUser.weapons.get("thirdWeapon").should.be.instanceof(Weapon);
        classedUser.weapons.get("thirdWeapon").should.be.eql({
            model: "ak-47",
            range: 800
        });

        const plainedUser = classToPlain(user);
        plainedUser.should.not.be.instanceOf(User);
        plainedUser.should.be.eql({
            id: 1,
            name: "Max Pain",
            weapons: {
                firstWeapon: {
                    model: "knife",
                    range: 1
                },
                secondWeapon: {
                    model: "eagle",
                    range: 200
                },
                thirdWeapon: {
                    model: "ak-47",
                    range: 800
                }
            }
        });

    });

    it("using Set with objects", () => {
        defaultMetadataStorage.clear();

        class Weapon {
            constructor(public model: string,
                        public range: number) {
            }
        }

        class User {
            id: number;
            name: string;
            @Type(() => Weapon)
            weapons: Set<Weapon>;
        }

        let plainUser = {
            id: 1,
            name: "Max Pain",
            weapons: [
                { model: "knife", range: 1 },
                { model: "eagle", range: 200 },
                { model: "ak-47", range: 800 },
            ]
        };

        const weapons = new Set<Weapon>();
        weapons.add(new Weapon("knife", 1));
        weapons.add(new Weapon("eagle", 200));
        weapons.add(new Weapon("ak-47", 800));

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
        const it = classedUser.weapons.values();
        const first = it.next().value;
        const second = it.next().value;
        const third = it.next().value;
        first.should.be.instanceof(Weapon);
        first.should.be.eql({ model: "knife", range: 1 });
        second.should.be.instanceof(Weapon);
        second.should.be.eql({ model: "eagle", range: 200 });
        third.should.be.instanceof(Weapon);
        third.should.be.eql({ model: "ak-47", range: 800 });

        const plainedUser = classToPlain(user);
        plainedUser.should.not.be.instanceOf(User);
        plainedUser.should.be.eql({
            id: 1,
            name: "Max Pain",
            weapons: [
                { model: "knife", range: 1 },
                { model: "eagle", range: 200 },
                { model: "ak-47", range: 800 },
            ]
        });

    });


});