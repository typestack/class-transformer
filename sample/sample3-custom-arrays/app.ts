import "es6-shim";
import "reflect-metadata";
import { instanceToPlain, plainToInstance } from "../../src/index";
import { Photo } from "./Photo";

// check deserialization

let photoJson = {
  id: "1",
  filename: "myphoto.jpg",
  description: "about my photo",
  tags: ["me", "iam"],
  albums: [
    {
      id: "1",
      name: "My life",
    },
    {
      id: "2",
      name: "My young years",
    },
  ],
};

let photo = plainToInstance(Photo, photoJson);
console.log("deserialized object: ", photo);
console.log("-----------------------------");
console.log("Trying to find album: ", photo.albums.findByName("My life"));
console.log("-----------------------------");

// now check serialization

let newPhotoJson = instanceToPlain(photo);
console.log("serialized object: ", newPhotoJson);
console.log("-----------------------------");
