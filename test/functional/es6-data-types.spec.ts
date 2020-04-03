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
        expect(classedUser).toBeInstanceOf(User);
        expect(classedUser.id).toEqual(1);
        expect(classedUser.name).toEqual("Max Pain");
        expect(classedUser.weapons).toBeInstanceOf(Map);
        expect(classedUser.weapons.size).toEqual(3);
        expect(classedUser.weapons.get("firstWeapon")).toEqual("knife");
        expect(classedUser.weapons.get("secondWeapon")).toEqual("eagle");
        expect(classedUser.weapons.get("thirdWeapon")).toEqual("ak-47");

        const plainedUser = classToPlain(user);
        expect(plainedUser).not.toBeInstanceOf(User);
        expect(plainedUser).toEqual({
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
        expect(classedUser).toBeInstanceOf(User);
        expect(classedUser.id).toEqual(1);
        expect(classedUser.name).toEqual("Max Pain");
        expect(classedUser.weapons).toBeInstanceOf(Set);
        expect(classedUser.weapons.size).toEqual(3);
        expect(classedUser.weapons.has("knife")).toBeTruthy();
        expect(classedUser.weapons.has("eagle")).toBeTruthy();
        expect(classedUser.weapons.has("ak-47")).toBeTruthy();

        const plainedUser = classToPlain(user);
        expect(plainedUser).not.toBeInstanceOf(User);
        expect(plainedUser).toEqual({
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
        expect(classedUser).toBeInstanceOf(User);
        expect(classedUser.id).toEqual(1);
        expect(classedUser.name).toEqual("Max Pain");
        expect(classedUser.weapons).toBeInstanceOf(Map);
        expect(classedUser.weapons.size).toEqual(3);
        expect(classedUser.weapons.get("firstWeapon")).toBeInstanceOf(Weapon);
        expect(classedUser.weapons.get("firstWeapon")).toEqual({
            model: "knife",
            range: 1
        });
        expect(classedUser.weapons.get("secondWeapon")).toBeInstanceOf(Weapon);
        expect(classedUser.weapons.get("secondWeapon")).toEqual({
            model: "eagle",
            range: 200
        });
        expect(classedUser.weapons.get("thirdWeapon")).toBeInstanceOf(Weapon);
        expect(classedUser.weapons.get("thirdWeapon")).toEqual({
            model: "ak-47",
            range: 800
        });

        const plainedUser = classToPlain(user);
        expect(plainedUser).not.toBeInstanceOf(User);
        expect(plainedUser).toEqual({
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
        expect(classedUser).toBeInstanceOf(User);
        expect(classedUser.id).toEqual(1);
        expect(classedUser.name).toEqual("Max Pain");
        expect(classedUser.weapons).toBeInstanceOf(Set);
        expect(classedUser.weapons.size).toEqual(3);
        const it = classedUser.weapons.values();
        const first = it.next().value;
        const second = it.next().value;
        const third = it.next().value;
        expect(first).toBeInstanceOf(Weapon);
        expect(first).toEqual({ model: "knife", range: 1 });
        expect(second).toBeInstanceOf(Weapon);
        expect(second).toEqual({ model: "eagle", range: 200 });
        expect(third).toBeInstanceOf(Weapon);
        expect(third).toEqual({ model: "ak-47", range: 800 });

        const plainedUser = classToPlain(user);
        expect(plainedUser).not.toBeInstanceOf(User);
        expect(plainedUser).toEqual({
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
