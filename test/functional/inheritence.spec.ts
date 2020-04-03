import "reflect-metadata";
import {plainToClass, Transform, Type} from "../../src/index";
import {defaultMetadataStorage} from "../../src/storage";

describe("inheritence", () => {
    it("decorators should work inside a base class", () => {
        defaultMetadataStorage.clear();

        class Contact {
            @Transform(value => value.toUpperCase())
            name: string;
            @Type(() => Date)
            birthDate: Date;
        }

        class User extends Contact {
            @Type(() => Number)
            id: number;
            email: string;
        }

        class Student extends User {
            @Transform(value => value.toUpperCase())
            university: string;
        }

        let plainStudent = {
            name: "Johny Cage",
            university: "mit",
            birthDate: new Date(1967, 2, 1).toDateString(),
            id: 100,
            email: "johnny.cage@gmail.com"
        };

        const classedStudent = plainToClass(Student, plainStudent);
        expect(classedStudent.name).toEqual("JOHNY CAGE");
        expect(classedStudent.university).toEqual("MIT");
        expect(classedStudent.birthDate.getTime()).toEqual(new Date(1967, 2, 1).getTime());
        expect(classedStudent.id).toEqual(plainStudent.id);
        expect(classedStudent.email).toEqual(plainStudent.email);
    });
});
