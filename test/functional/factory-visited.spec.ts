import "reflect-metadata";
import {classToPlain, plainToClass} from "../../src/index";
import {defaultMetadataStorage} from "../../src/storage";
import {Type, Identifier, Factory} from "../../src/decorators";



describe("es6 data types", () => {

    it("only identifiers should be serialized when the same instance is to be serialized multiple times", () => {
        class User {
            @Identifier()
            id: number;

            @Identifier()
            name: string;

            nickName: string;

            @Type(() => User)
            followers: User[] = [];
        }

        const u2 = new User();
        u2.id = 2;
        u2.name = "scott";
        u2.nickName = "scotty";

        const u1 = new User();
        u1.id = 1;
        u1.name = "jeff";
        u1.nickName = "jeffy";
        u1.followers = [u1, u2];
        const plain = classToPlain(u1);
        plain.should.eql({
            id: 1,
            name: "jeff",
            nickName: "jeffy",
            followers: [{
                id: 1,
                name: "jeff"
            }, {
                id: 2,
                name: "scott",
                nickName: "scotty",
                followers: []
            }]
        });
    });

    it("using factory", () => {
      class User {
          @Identifier()
          id: number;

          name: string;
          @Type(() => User)
          followers: User[] = [];

          @Factory()
          static factory(json: any, ctx: any) {
              if (!ctx.users) { ctx.users = {}; }
              if (!ctx.users[json.id]) {
                  ctx.users[json.id] = new User();
              }
              return ctx.users[json.id];
          }
      }

      const u = new User();
      u.id = 1;
      u.name = "meow";
      const u2 = new User();
      u2.id = 2;
      u.followers.push(u);

      const plain = classToPlain(u);
      plain.should.eql({
          id: 1,
          name: "meow",
          followers: [{id: 1}]
      });
      const context = {};
      const yay = plainToClass(User, plain, {context});
      
      yay.should.be.eql(yay.followers[0]);
    });
});