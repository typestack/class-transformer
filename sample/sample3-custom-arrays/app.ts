import "es6-shim";
import "reflect-metadata";
import {constructorToPlain, plainToConstructor} from "../../src/constructor-utils";
import {Photo} from "./Photo";

// check deserialization

let photoJson = {
    id: "1",
    filename: "myphoto.jpg",
    description: "about my photo",
    tags: [
        "me",
        "iam"
    ],
    albums: [{
        id: "1",
        name: "My life"
    },
    {
        id: "2",
        name: "My young years"
    }]
};

let photo = plainToConstructor(Photo, photoJson);
console.log("deserialized object: " , photo);
console.log("-----------------------------");
console.log("Trying to find album: ", photo.albums.findByName("My life"));
console.log("-----------------------------");

// now check serialization

let newPhotoJson = constructorToPlain(photo);
console.log("serialized object: " , newPhotoJson);
console.log("-----------------------------");
