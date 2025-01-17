import { plainToInstance } from '../../src';
import { Album, Landscape } from './Album';

const albumJson = {
  photos: [
    {
      type: 'landscape',
      filename: 'cataratas.png',
      local: 'Cataratas do Iguaçu - PR/BR',
    },
    {
      type: 'portrait',
      filename: 'topmodel.jpg',
      person: 'Alessandra Ambrósio',
      gender: 'female',
    },
    {
      type: 'sports',
      filename: 'ferrari.png',
      sport: 'F1',
      origin: 'The United Kingdom',
    },
  ],
};

const albumObject = plainToInstance(Album, albumJson);
console.log(albumObject);

const landscape = albumObject.findByType<Landscape>('landscape');
console.log(landscape.getLocation());
