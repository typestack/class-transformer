import "reflect-metadata";
import {defaultMetadataStorage} from "../../src/storage";
import {Transform} from "../../src/decorators";
import {classToPlain} from "../../src/index";
import moment = require("moment");
import Moment = moment.Moment;

describe("basic functionality", () => {

    it("should not throw error", () => {
        defaultMetadataStorage.clear();

        class User {
            // As in https://github.com/gempain/class-transformer#additional-data-transformation
            @Transform(value => moment(value), {toClassOnly: true})
            created: Moment;
        }

        const user = new User();
        user.created = moment();

        const o = classToPlain(user);

        o.should.not.be.undefined;

    });

});
