import "es6-shim";
import "reflect-metadata";
import {plainToClass, classToPlain} from "../../src/index";
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
    author: {
        id: "2",
        firstName: "Johny",
        lastName: "Cage"
    },
    albums: [{
        id: "1",
        name: "My life"
    },
    {
        id: "2",
        name: "My young years"
    }]
};

let photo = plainToClass(Photo, photoJson);
console.log("deserialized object: " , photo);

// now check serialization

let newPhotoJson = classToPlain(photo);
console.log("serialized object: " , newPhotoJson);

// try to deserialize an array
console.log("-------------------------------");

let photosJson = [{
    id: "1",
    filename: "myphoto.jpg",
    description: "about my photo",
    author: {
        id: "2",
        firstName: "Johny",
        lastName: "Cage",
        registrationDate: "1995-12-17T03:24:00"
    },
    albums: [{
        id: "1",
        name: "My life"
    },
    {
        id: "2",
        name: "My young years"
    }]
},
{
    id: "2",
    filename: "hisphoto.jpg",
    description: "about his photo",
    author: {
        id: "2",
        firstName: "Johny",
        lastName: "Cage"
    },
    albums: [{
        id: "1",
        name: "My life"
    },
    {
        id: "2",
        name: "My young years"
    }]
}];

let photos = plainToClass(Photo, photosJson);
console.log("deserialized array: " , photos);

// now check array serialization

let newPhotosJson = classToPlain(photos);
console.log("serialized array: " , newPhotosJson);