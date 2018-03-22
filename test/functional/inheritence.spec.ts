import "reflect-metadata";
import {Transform, Type, plainToClass} from "../../src/index";
import {defaultMetadataStorage} from "../../src/storage";
import {Exclude, Expose} from "../../src/decorators";

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
        classedStudent.name.should.be.equal("JOHNY CAGE");
        classedStudent.university.should.be.equal("MIT");
        classedStudent.birthDate.getTime().should.be.equal(new Date(1967, 2, 1).getTime());
        classedStudent.id.should.be.equal(plainStudent.id);
        classedStudent.email.should.be.equal(plainStudent.email);
    });
});
