import {serialize, deserialize} from "../../src/index";
import {Photo} from "./Photo";

// check deserialization

let photoJson = {
    id: "1",
    filename: "myphoto.jpg",
    description: "about my photo",
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

let photo = deserialize<Photo>(Photo, photoJson);
console.log("deserialized object: " , photo);

// now check serialization

let newPhotoJson = serialize(photo);
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

let photos = deserialize<Photo[]>(Photo, photosJson);
console.log("deserialized array: " , photos);

// now check array serialization

let newPhotosJson = serialize(photos);
console.log("serialized array: " , newPhotosJson);