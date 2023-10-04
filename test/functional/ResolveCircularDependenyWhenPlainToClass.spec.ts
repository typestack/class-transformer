import * as classTransformer from '../../src/index';
import * as flatted from 'flatted';
import 'reflect-metadata';

describe('You MUST Run this Test file with "emitDecoratorMetadata": false', () => {
  it('^^', () => {});
});

describe('simple case 2 obj circular dependency -- resolveCircularDependenyWhenPlainToClassInSimpleCases', () => {
  // >"
  // ReferenceError: Cannot access 'Photo' before initialization
  // conflict in Jest && `@classTransformer.Type(() => Photo)` && Circular dependency ...
  // not the version pb // feel that ts pb em // need to change to `any` // https://github.com/typestack/class-transformer/issues/1622
  // photoFile: Photo | undefined;
  // []
  // It seems running with `ts-node` has such problem (/ `tsc` compiled js file), but running with `tsx` is fine.
  // Seems `Jest` uses `ts-node`.
  // <>
  // https://github.com/typestack/class-transformer/issues/1622
  // []
  // The solution is to set `"emitDecoratorMetadata": false` in your tsconfig.json file.
  // <>
  // https://stackoverflow.com/questions/56870661/angular-7-2-1-es6-class-referenceerror-cannot-access-x-before-initializatio
  // ;not_needed; photoFile: Photo_dummy | undefined;
  class User {
    userName: string | undefined;
    @classTransformer.Type(() => Photo)
    photoFile: Photo | undefined;
  }

  class Photo {
    fileName: string | undefined;
    @classTransformer.Type(() => User)
    owner: User | undefined;
  }

  // ;not_needed; // @messy
  // ;not_needed; type Photo_dummy = {
  // ;not_needed;   fileName: string | undefined;
  // ;not_needed;   owner: User | undefined;
  // ;not_needed; };

  // ;not_needed; // ;not_working; import { describe, it, expect } from '@jest/globals';
  // ;not_needed; import { jestExpect as expect } from '@jest/expect';

  it('simple case resolve circular dependency jsobj', () => {
    //
    const userJsobj = {
      userName: 'Alpha',
      photoFile: {
        fileName: 'Apple.jpg',
        owner: null,
      },
    } as User;
    userJsobj.photoFile.owner = userJsobj;

    //
    const user_deserialized = classTransformer.plainToInstance(User, userJsobj as { length?: never }, {
      enableCircularCheck: true,
      resolveCircularDependenyWhenPlainToClassInSimpleCases: true, // << @watch
    });

    expect(user_deserialized).toBeInstanceOf(User);
    expect(user_deserialized.userName).toEqual('Alpha');
    expect(user_deserialized.photoFile).toBeInstanceOf(Photo);
    expect(user_deserialized.photoFile.fileName).toEqual('Apple.jpg');
    expect(user_deserialized.photoFile.owner).toBe(user_deserialized); // << @watch

    expect(user_deserialized).not.toBe(userJsobj);
    expect(user_deserialized.photoFile).not.toBe(userJsobj.photoFile);

    expect(userJsobj).toEqual(user_deserialized); // << @watch
  });

  it('simple case resolve circular dependency jsobj -- created by Flatted', () => {
    //
    const user = new User();
    user.userName = 'Alpha';

    const photo1 = new Photo();
    photo1.fileName = 'Apple.jpg';

    photo1.owner = user;
    user.photoFile = photo1;

    console.log('>> ori');
    console.log(user);

    // const userJsobjClasstransform = classTransformer.instanceToPlain(user, {
    //   enableCircularCheck: true,
    // });
    // console.log('>> Classtransform instanceToPlain()');
    // console.log(userJsobjClasstransform);
    // console.log(JSON.stringify(userJsobjClasstransform, null, 2));

    //
    // Flatted.toJSON(userJsobj); // still dk what for ...
    const userJsstrFlatted = flatted.stringify(user); // const userJsstrFlatted2nd = flatted.stringify(userJsobjClasstransform); // same
    const userJsobjFlatted = flatted.parse(userJsstrFlatted);
    console.log('>> Flatted');
    console.log(userJsstrFlatted);
    console.log(userJsobjFlatted);

    console.log('>> Classtransform plainToInstance()');
    const user_deserialized = classTransformer.plainToInstance(User, userJsobjFlatted as { length?: never }, {
      enableCircularCheck: true,
      resolveCircularDependenyWhenPlainToClassInSimpleCases: true, // << @watch
    });
    console.log(user_deserialized);

    expect(user_deserialized).toBeInstanceOf(User);
    expect(user_deserialized.userName).toEqual('Alpha');
    expect(user_deserialized.photoFile).toBeInstanceOf(Photo);
    expect(user_deserialized.photoFile.fileName).toEqual('Apple.jpg');
    expect(user_deserialized.photoFile.owner).toBe(user_deserialized); // << @watch

    expect(user_deserialized).not.toBe(user);
    expect(user_deserialized.photoFile).not.toBe(photo1);

    expect(user).toEqual(user_deserialized); // << @watch
  });
});

describe('with one simple Array (@OneToMany)', () => {
  class User {
    userName: string;
    @classTransformer.Type(() => Photo)
    arr_photoFile: Photo[] = [];

    constructor(userName: string) {
      this.userName = userName;
    }
  }

  class Photo {
    fileName: string;
    @classTransformer.Type(() => User)
    owner: User;

    constructor(fileName: string, owner: User) {
      this.fileName = fileName;
      this.owner = owner;
    }
  }

  it('t1', () => {
    const user = new User('Alpha');
    const photo1 = new Photo('Apple.jpg', user);
    const photo2 = new Photo('Mango.jpg', user);
    user.arr_photoFile.push(photo1);
    user.arr_photoFile.push(photo2);

    const userJsstrFlatted = flatted.stringify(user);
    const userJsobjFlatted = flatted.parse(userJsstrFlatted);
    console.log('>> Flatted');
    console.log(userJsobjFlatted);

    console.log('>> Classtransform plainToInstance()');
    const user_deserialized = classTransformer.plainToInstance(User, userJsobjFlatted as { length?: never }, {
      enableCircularCheck: true,
      resolveCircularDependenyWhenPlainToClassInSimpleCases: true, // <<
    });
    console.log(user_deserialized);

    expect(user_deserialized).toBeInstanceOf(User);
    expect(user_deserialized.userName).toEqual('Alpha');
    expect(user_deserialized.arr_photoFile[0]).toBeInstanceOf(Photo);
    expect(user_deserialized.arr_photoFile[1]).toBeInstanceOf(Photo);
    expect(user_deserialized.arr_photoFile[0].fileName).toEqual('Apple.jpg');
    expect(user_deserialized.arr_photoFile[1].fileName).toEqual('Mango.jpg');
    expect(user_deserialized.arr_photoFile[0].owner).toBe(user_deserialized);
    expect(user_deserialized.arr_photoFile[1].owner).toBe(user_deserialized);

    expect(user_deserialized).not.toBe(user);
    expect(user_deserialized.arr_photoFile[0]).not.toBe(photo1);
    expect(user_deserialized.arr_photoFile[1]).not.toBe(photo2);

    expect(user).toEqual(user_deserialized); // << @watch
  });
});

describe('with 2 Array ref (@ManyToMany)', () => {
  class User {
    @classTransformer.Type(() => Photo)
    public arr_photoFile: Photo[] = [];

    constructor(public readonly userName: string) {}
  }

  class Photo {
    @classTransformer.Type(() => User)
    public arr_owner: User[] = [];

    constructor(public readonly fileName: string) {}
  }

  it('t1', () => {
    const user_AA = new User('Alpha');
    const user_BB = new User('Beta');
    const photo_AP = new Photo('Apple.jpg');
    const photo_MA = new Photo('Mango.jpg');
    photo_AP.arr_owner.push(user_AA);
    photo_AP.arr_owner.push(user_BB);
    photo_MA.arr_owner.push(user_AA);
    photo_MA.arr_owner.push(user_BB);
    user_AA.arr_photoFile.push(photo_AP);
    user_AA.arr_photoFile.push(photo_MA);
    user_BB.arr_photoFile.push(photo_AP);
    user_BB.arr_photoFile.push(photo_MA);

    const userJsstrFlatted_AA = flatted.stringify(user_AA);
    const userJsobjFlatted_AA = flatted.parse(userJsstrFlatted_AA);
    console.log('>> Flatted');
    console.log(userJsobjFlatted_AA);

    console.log('>> Classtransform plainToInstance()');
    const user_AA_deserialized = classTransformer.plainToInstance(User, userJsobjFlatted_AA as { length?: never }, {
      enableCircularCheck: true,
      resolveCircularDependenyWhenPlainToClassInSimpleCases: true, // <<
    });
    console.log(user_AA_deserialized);

    const user_BB_deserialized = user_AA_deserialized.arr_photoFile[0].arr_owner[1];

    expect(user_AA_deserialized).toBeInstanceOf(User);
    expect(user_AA_deserialized.userName).toEqual('Alpha');
    expect(user_AA_deserialized.arr_photoFile[0]).toBeInstanceOf(Photo);
    expect(user_AA_deserialized.arr_photoFile[1]).toBeInstanceOf(Photo);
    expect(user_AA_deserialized.arr_photoFile[0].fileName).toEqual('Apple.jpg');
    expect(user_AA_deserialized.arr_photoFile[1].fileName).toEqual('Mango.jpg');
    expect(user_AA_deserialized.arr_photoFile[0].arr_owner[0]).toBe(user_AA_deserialized);
    expect(user_AA_deserialized.arr_photoFile[0].arr_owner[1]).toBe(user_BB_deserialized);
    expect(user_AA_deserialized.arr_photoFile[1].arr_owner[0]).toBe(user_AA_deserialized);
    expect(user_AA_deserialized.arr_photoFile[1].arr_owner[1]).toBe(user_BB_deserialized);

    expect(user_BB_deserialized).toBeInstanceOf(User);
    expect(user_BB_deserialized.userName).toEqual('Beta');
    expect(user_BB_deserialized.arr_photoFile[0]).toBeInstanceOf(Photo);
    expect(user_BB_deserialized.arr_photoFile[1]).toBeInstanceOf(Photo);
    expect(user_BB_deserialized.arr_photoFile[0].fileName).toEqual('Apple.jpg');
    expect(user_BB_deserialized.arr_photoFile[1].fileName).toEqual('Mango.jpg');
    expect(user_BB_deserialized.arr_photoFile[0].arr_owner[1]).toBe(user_BB_deserialized);
    expect(user_BB_deserialized.arr_photoFile[0].arr_owner[0]).toBe(user_AA_deserialized);
    expect(user_BB_deserialized.arr_photoFile[1].arr_owner[1]).toBe(user_BB_deserialized);
    expect(user_BB_deserialized.arr_photoFile[1].arr_owner[0]).toBe(user_AA_deserialized);

    expect(user_BB_deserialized.arr_photoFile[0]).toBe(user_AA_deserialized.arr_photoFile[0]);
    expect(user_BB_deserialized.arr_photoFile[1]).toBe(user_AA_deserialized.arr_photoFile[1]);

    expect(Array.isArray(user_AA_deserialized.arr_photoFile)).toBe(true);
    expect(Array.isArray(user_BB_deserialized.arr_photoFile)).toBe(true);
    expect(Array.isArray(user_AA_deserialized.arr_photoFile[0].arr_owner)).toBe(true);
    expect(Array.isArray(user_AA_deserialized.arr_photoFile[1].arr_owner)).toBe(true);
    expect(Array.isArray(user_BB_deserialized.arr_photoFile[0].arr_owner)).toBe(true);
    expect(Array.isArray(user_BB_deserialized.arr_photoFile[1].arr_owner)).toBe(true);

    expect(user_AA_deserialized).not.toBe(user_AA);
    expect(user_AA_deserialized.arr_photoFile[0]).not.toBe(photo_AP);
    expect(user_AA_deserialized.arr_photoFile[1]).not.toBe(photo_MA);

    expect(user_AA).toEqual(user_AA_deserialized); // << @watch
    expect(user_BB).toEqual(user_BB_deserialized); // << @watch

    // const user_BB_deserialized_ref2 = user_AA_deserialized.arr_photoFile[1].arr_owner[1];
    // expect(user_BB_deserialized).toBe(user_BB_deserialized_ref2);
    //
    // expect(user_AA_deserialized.arr_photoFile[0].arr_owner[0].arr_photoFile).toBe(user_AA_deserialized.arr_photoFile);
    // expect(user_AA_deserialized.arr_photoFile[1].arr_owner[0].arr_photoFile).toBe(user_AA_deserialized.arr_photoFile);
    // expect(user_AA_deserialized.arr_photoFile[0].arr_owner[1].arr_photoFile).toBe(user_BB_deserialized.arr_photoFile);
    // expect(user_AA_deserialized.arr_photoFile[1].arr_owner[1].arr_photoFile).toBe(user_BB_deserialized.arr_photoFile);
    // expect(user_BB_deserialized.arr_photoFile[0].arr_owner[0].arr_photoFile).toBe(user_AA_deserialized.arr_photoFile);
    // expect(user_BB_deserialized.arr_photoFile[1].arr_owner[0].arr_photoFile).toBe(user_AA_deserialized.arr_photoFile);
    // expect(user_BB_deserialized.arr_photoFile[0].arr_owner[1].arr_photoFile).toBe(user_BB_deserialized.arr_photoFile);
    // expect(user_BB_deserialized.arr_photoFile[1].arr_owner[1].arr_photoFile).toBe(user_BB_deserialized.arr_photoFile);

    //   // >"
    //   //     if (Array.isArray(value) || value instanceof Set) {
    //   // <>
    //   // H:\Using\class-transformer\src\TransformOperationExecutor.ts
    //   //
    //   // >"
    //   //       for (const [index, subValue] of (value as any[]).entries()) {
    //   // <>
    //   // H:\Using\class-transformer\src\TransformOperationExecutor.ts
    //   //
    //   // >"
    //   //       // traverse over keys // @breadth_loop
    //   //       for (const key of keys) {
    //   //         if (key === '__proto__' || key === 'constructor') {
    //   //           continue;
    //   //         }
    //   //
    //   //         const valueKey = key;
    //   // <>
    //   // H:\Using\class-transformer\src\TransformOperationExecutor.ts
    //   //
    //   // >"
    //   //           } else {
    //   //             subValue = value[valueKey];
    //   // <>
    //   // H:\Using\class-transformer\src\TransformOperationExecutor.ts
    //   //
    //   // >"
    //   // const arr_innerField_and_innerFieldEsCircularField = this.mppLinkageForCircularRef.get(subValue);
    //   // <>
    //   // H:\Using\class-transformer\src\TransformOperationExecutor.ts
    //   //
    //   // ~~~// things that should be watching
    //   //
    //   // said that lv that get done just that way
    //   // Alpha
    //   // - Apple
    //   // -- Alpha <
    //   // -- Beta
    //   // --- Apple <
    //   // --- Mango
    //   // ---- Beta <
    //   // just this & still linked
    //   //
    //   // the problem is that the inside of those -- inner are established ;
    //   // inner returned ;
    //   // but the outer breadth into next wont have access to the inner that is already done
    //   // -- its not just the delete on the Map pb
    //   // -- it seems it still redundant the step again & creates a new obj -- worse cuz ref is diff now //dk //need_think more
    //   // // soln can be add more to that map hum ..
  });
});

describe('self referencing Array', () => {
  it('t1', () => {
    const arr_Greeks: (string | string[])[] = ['Alpha', 'Beta'];
    // console.log(classTransformer.instanceToPlain(arr_Greeks));

    arr_Greeks.splice(1, 0, arr_Greeks as string[]);
    // console.log(classTransformer.instanceToPlain(arr_Greeks, { enableCircularCheck: true }));

    const arrJsstrFlatted_Greeks = flatted.stringify(arr_Greeks);
    const arrJsobjFlatted_Greeks = flatted.parse(arrJsstrFlatted_Greeks);
    console.log('>> Flatted');
    console.log(arrJsobjFlatted_Greeks);

    console.log('>> Classtransform plainToInstance()');
    const arr_Greeks_deserialized = classTransformer.plainToInstance(Array, arrJsobjFlatted_Greeks, {
      enableCircularCheck: true,
      resolveCircularDependenyWhenPlainToClassInSimpleCases: true, // <<
    });
    // Array<String | String[]> not allowed?...
    console.log(arr_Greeks_deserialized);

    expect(arr_Greeks_deserialized).toBeInstanceOf(Array);
    expect(arr_Greeks_deserialized[0]).toEqual('Alpha');
    expect(arr_Greeks_deserialized[2]).toEqual('Beta');
    expect(arr_Greeks_deserialized[1]).toBe(arr_Greeks_deserialized);
    expect(arr_Greeks_deserialized.length).toBe(3);

    expect(arr_Greeks).toEqual(arr_Greeks_deserialized); // << @watch
  });
});

// // ;not_working;[cuz Set cannot be in JSON] // ## self referencing Set
// // ;not_working;[cuz Set cannot be in JSON] (() => {
// // ;not_working;[cuz Set cannot be in JSON]   {
// // ;not_working;[cuz Set cannot be in JSON]     const arr_Greeks: Set<String | Set<String>> = new Set<String>(['Alpha', 'Beta']);
// // ;not_working;[cuz Set cannot be in JSON]     console.log(JSON.stringify(arr_Greeks));
// // ;not_working;[cuz Set cannot be in JSON]     console.log(classTransformer.instanceToPlain(arr_Greeks));
// // ;not_working;[cuz Set cannot be in JSON]
// // ;not_working;[cuz Set cannot be in JSON]     arr_Greeks.add(arr_Greeks as Set<String>);
// // ;not_working;[cuz Set cannot be in JSON]     console.log(classTransformer.instanceToPlain(arr_Greeks, { enableCircularCheck: true }));
// // ;not_working;[cuz Set cannot be in JSON]
// // ;not_working;[cuz Set cannot be in JSON]     const arrJsstrFlatted_Greeks = flatted.stringify(arr_Greeks);
// // ;not_working;[cuz Set cannot be in JSON]     const arrJsobjFlatted_Greeks = flatted.parse(arrJsstrFlatted_Greeks);
// // ;not_working;[cuz Set cannot be in JSON]     console.log('>> Flatted');
// // ;not_working;[cuz Set cannot be in JSON]     console.log(arrJsstrFlatted_Greeks);
// // ;not_working;[cuz Set cannot be in JSON]     console.log(arrJsobjFlatted_Greeks);
// // ;not_working;[cuz Set cannot be in JSON]
// // ;not_working;[cuz Set cannot be in JSON]     console.log('>> Classtransform plainToInstance()');
// // ;not_working;[cuz Set cannot be in JSON]     const arr_Greeks_deserialized = classTransformer.plainToInstance(
// // ;not_working;[cuz Set cannot be in JSON]       Set<String | Set<String>>,
// // ;not_working;[cuz Set cannot be in JSON]       arrJsobjFlatted_Greeks as Set<String | Set<String>>,
// // ;not_working;[cuz Set cannot be in JSON]       {
// // ;not_working;[cuz Set cannot be in JSON]         enableCircularCheck: true,
// // ;not_working;[cuz Set cannot be in JSON]         resolveCircularDependenyWhenPlainToClassInSimpleCases: true, // <<
// // ;not_working;[cuz Set cannot be in JSON]       }
// // ;not_working;[cuz Set cannot be in JSON]     ); // dk that as { length?: never } thing...
// // ;not_working;[cuz Set cannot be in JSON]     console.log(arr_Greeks_deserialized);
// // ;not_working;[cuz Set cannot be in JSON]
// // ;not_working;[cuz Set cannot be in JSON]     expect(arr_Greeks_deserialized).toBeInstanceOf(Set);
// // ;not_working;[cuz Set cannot be in JSON]     expect(arr_Greeks_deserialized.has('Alpha')).toBe(true);
// // ;not_working;[cuz Set cannot be in JSON]     expect(arr_Greeks_deserialized.has('Beta')).toBe(true);
// // ;not_working;[cuz Set cannot be in JSON]     expect(arr_Greeks_deserialized.has(arr_Greeks_deserialized as Set<String>)).toBe(true);
// // ;not_working;[cuz Set cannot be in JSON]     expect(arr_Greeks_deserialized.size).toBe(3);
// // ;not_working;[cuz Set cannot be in JSON]   }
// // ;not_working;[cuz Set cannot be in JSON] })();
// // ;not_working;[cuz Set cannot be in JSON]
// // ;not_working;[cuz Set cannot be in JSON] // ## Map
// // ;not_working;[cuz Set cannot be in JSON] (() => {
// // ;not_working;[cuz Set cannot be in JSON]   {
// // ;not_working;[cuz Set cannot be in JSON]     const arr_Greeks: Map<String, String | Map<String, String>> = new Map<String, String>();
// // ;not_working;[cuz Set cannot be in JSON]     arr_Greeks.set('aa', 'Alpha');
// // ;not_working;[cuz Set cannot be in JSON]     arr_Greeks.set('bb', 'Beta');
// // ;not_working;[cuz Set cannot be in JSON]     console.log(JSON.stringify(arr_Greeks));
// // ;not_working;[cuz Set cannot be in JSON]     console.log(classTransformer.instanceToPlain(arr_Greeks));
// // ;not_working;[cuz Set cannot be in JSON]
// // ;not_working;[cuz Set cannot be in JSON]     arr_Greeks.set('mpp', arr_Greeks as Map<String, String>);
// // ;not_working;[cuz Set cannot be in JSON]     console.log(classTransformer.instanceToPlain(arr_Greeks, { enableCircularCheck: true }));
// // ;not_working;[cuz Set cannot be in JSON]
// // ;not_working;[cuz Set cannot be in JSON]     const arrJsstrFlatted_Greeks = flatted.stringify(arr_Greeks);
// // ;not_working;[cuz Set cannot be in JSON]     const arrJsobjFlatted_Greeks = flatted.parse(arrJsstrFlatted_Greeks);
// // ;not_working;[cuz Set cannot be in JSON]     console.log('>> Flatted');
// // ;not_working;[cuz Set cannot be in JSON]     console.log(arrJsstrFlatted_Greeks);
// // ;not_working;[cuz Set cannot be in JSON]     console.log(arrJsobjFlatted_Greeks);
// // ;not_working;[cuz Set cannot be in JSON]
// // ;not_working;[cuz Set cannot be in JSON]     console.log('>> Classtransform plainToInstance()');
// // ;not_working;[cuz Set cannot be in JSON]     const arr_Greeks_deserialized = classTransformer.plainToInstance(
// // ;not_working;[cuz Set cannot be in JSON]       Map<String, String | Map<String, String>>,
// // ;not_working;[cuz Set cannot be in JSON]       arrJsobjFlatted_Greeks as Map<String, String | Map<String, String>>,
// // ;not_working;[cuz Set cannot be in JSON]       {
// // ;not_working;[cuz Set cannot be in JSON]         enableCircularCheck: true,
// // ;not_working;[cuz Set cannot be in JSON]         resolveCircularDependenyWhenPlainToClassInSimpleCases: true, // <<
// // ;not_working;[cuz Set cannot be in JSON]       }
// // ;not_working;[cuz Set cannot be in JSON]     ); // dk that as { length?: never } thing...
// // ;not_working;[cuz Set cannot be in JSON]     console.log(arr_Greeks_deserialized);
// // ;not_working;[cuz Set cannot be in JSON]
// // ;not_working;[cuz Set cannot be in JSON]     // expect(arr_Greeks_deserialized).toBeInstanceOf(Map);
// // ;not_working;[cuz Set cannot be in JSON]     // expect(arr_Greeks_deserialized.has('Alpha')).toBe(true);
// // ;not_working;[cuz Set cannot be in JSON]     // expect(arr_Greeks_deserialized.has('Beta')).toBe(true);
// // ;not_working;[cuz Set cannot be in JSON]     // expect(arr_Greeks_deserialized.has(arr_Greeks_deserialized as Map<String, String>)).toBe(true);
// // ;not_working;[cuz Set cannot be in JSON]     // expect(arr_Greeks_deserialized.size).toBe(3);
// // ;not_working;[cuz Set cannot be in JSON]   }
// // ;not_working;[cuz Set cannot be in JSON] })();

describe('complex circular dependency with Array', () => {
  class User {
    @classTransformer.Type(() => Photo)
    public arr_photoFile: Photo[] = [];

    @classTransformer.Type(() => Location)
    public address: Location | null = null;

    @classTransformer.Type(() => User)
    public arr_friend: User[] = [];

    constructor(public readonly userName: string) {}
  }

  class Photo {
    @classTransformer.Type(() => User)
    public arr_owner: User[] = [];

    @classTransformer.Type(() => User)
    public holderCurr: User | undefined = undefined;

    @classTransformer.Type(() => Location)
    public locTookAt: Location | null = null;

    @classTransformer.Type(() => Photo)
    public arr_album: Photo[][] = [];

    constructor(public readonly fileName: string) {}
  }

  class Location {
    @classTransformer.Type(() => Photo)
    public arr_photoFileStored: Photo[] = [];

    @classTransformer.Type(() => User)
    public arr_visitor: User[] = [];

    constructor(public readonly locationName: string) {}
  }
  it('t1', () => {
    const user_AA = new User('Alpha');
    const user_BB = new User('Beta');
    const user_CC = new User('Gamma');
    const user_DD = new User('Delta');
    const photo_AP = new Photo('Apple.jpg');
    const photo_MA = new Photo('Mango.jpg');
    const photo_BA = new Photo('Banana.jpg');
    const photo_PA = new Photo('Pineapple.jpg');
    const loc_Roman = new Location('Roman');
    const loc_Paris = new Location('Paris');
    const loc_Berlin = new Location('Berlin');

    user_AA.arr_photoFile.push(photo_AP);
    photo_AP.arr_owner.push(user_AA);
    user_AA.arr_photoFile.push(photo_MA);
    photo_MA.arr_owner.push(user_AA);
    user_AA.address = loc_Roman;
    user_AA.arr_friend.push(user_BB);
    user_AA.arr_friend.push(user_CC);

    user_BB.arr_photoFile.push(photo_AP);
    photo_AP.arr_owner.push(user_BB);
    user_BB.arr_photoFile.push(photo_MA);
    photo_MA.arr_owner.push(user_BB);
    user_BB.address = loc_Paris;
    user_BB.arr_friend.push(user_AA);
    user_BB.arr_friend.push(user_CC);

    user_CC.arr_photoFile.push(photo_AP);
    photo_AP.arr_owner.push(user_CC);
    user_CC.arr_photoFile.push(photo_BA);
    photo_BA.arr_owner.push(user_CC);
    user_CC.address = loc_Berlin;
    user_CC.arr_friend.push(user_BB);
    user_CC.arr_friend.push(user_DD);

    user_DD.arr_photoFile.push(photo_AP);
    photo_AP.arr_owner.push(user_DD);
    user_DD.address = null;
    user_DD.arr_friend.push(user_CC);

    photo_MA.holderCurr = user_CC;
    photo_PA.holderCurr = user_BB;

    photo_AP.locTookAt = loc_Roman;
    photo_MA.locTookAt = loc_Paris;

    const album_R = [photo_MA, new Photo('Watermelon.jpg')];
    photo_BA.arr_album.push([photo_BA, photo_AP, photo_MA], [photo_BA, photo_AP], album_R);
    photo_PA.arr_album.push([photo_PA, photo_MA], album_R);

    loc_Roman.arr_photoFileStored.push(photo_AP);
    loc_Paris.arr_photoFileStored.push(photo_MA);
    loc_Berlin.arr_photoFileStored.push(photo_BA);
    loc_Berlin.arr_photoFileStored.push(photo_PA);

    loc_Berlin.arr_visitor.push(user_BB);
    loc_Paris.arr_visitor.push(user_AA);

    console.log('>> ori');
    console.log(user_AA);

    const userJsstrFlatted_AA = flatted.stringify(user_AA);
    const userJsobjFlatted_AA = flatted.parse(userJsstrFlatted_AA);
    console.log('>> Flatted');
    console.log(userJsobjFlatted_AA);

    console.log('>> Classtransform plainToInstance()');
    const user_AA_deserialized = classTransformer.plainToInstance(User, userJsobjFlatted_AA as { length?: never }, {
      enableCircularCheck: true,
      resolveCircularDependenyWhenPlainToClassInSimpleCases: true, // <<
    });
    console.log(user_AA_deserialized);

    const user_BB_deserialized = user_AA_deserialized.arr_photoFile[0].arr_owner[1];

    // @duplicated_code::
    expect(user_AA_deserialized).toBeInstanceOf(User);
    expect(user_AA_deserialized.userName).toEqual('Alpha');
    expect(user_AA_deserialized.arr_photoFile[0]).toBeInstanceOf(Photo);
    expect(user_AA_deserialized.arr_photoFile[1]).toBeInstanceOf(Photo);
    expect(user_AA_deserialized.arr_photoFile[0].fileName).toEqual('Apple.jpg');
    expect(user_AA_deserialized.arr_photoFile[1].fileName).toEqual('Mango.jpg');
    expect(user_AA_deserialized.arr_photoFile[0].arr_owner[0]).toBe(user_AA_deserialized);
    expect(user_AA_deserialized.arr_photoFile[0].arr_owner[1]).toBe(user_BB_deserialized);
    expect(user_AA_deserialized.arr_photoFile[1].arr_owner[0]).toBe(user_AA_deserialized);
    expect(user_AA_deserialized.arr_photoFile[1].arr_owner[1]).toBe(user_BB_deserialized);

    expect(user_BB_deserialized).toBeInstanceOf(User);
    expect(user_BB_deserialized.userName).toEqual('Beta');
    expect(user_BB_deserialized.arr_photoFile[0]).toBeInstanceOf(Photo);
    expect(user_BB_deserialized.arr_photoFile[1]).toBeInstanceOf(Photo);
    expect(user_BB_deserialized.arr_photoFile[0].fileName).toEqual('Apple.jpg');
    expect(user_BB_deserialized.arr_photoFile[1].fileName).toEqual('Mango.jpg');
    expect(user_BB_deserialized.arr_photoFile[0].arr_owner[1]).toBe(user_BB_deserialized);
    expect(user_BB_deserialized.arr_photoFile[0].arr_owner[0]).toBe(user_AA_deserialized);
    expect(user_BB_deserialized.arr_photoFile[1].arr_owner[1]).toBe(user_BB_deserialized);
    expect(user_BB_deserialized.arr_photoFile[1].arr_owner[0]).toBe(user_AA_deserialized);

    expect(user_BB_deserialized.arr_photoFile[0]).toBe(user_AA_deserialized.arr_photoFile[0]);
    expect(user_BB_deserialized.arr_photoFile[1]).toBe(user_AA_deserialized.arr_photoFile[1]);

    expect(Array.isArray(user_AA_deserialized.arr_photoFile)).toBe(true);
    expect(Array.isArray(user_BB_deserialized.arr_photoFile)).toBe(true);
    expect(Array.isArray(user_AA_deserialized.arr_photoFile[0].arr_owner)).toBe(true);
    expect(Array.isArray(user_AA_deserialized.arr_photoFile[1].arr_owner)).toBe(true);
    expect(Array.isArray(user_BB_deserialized.arr_photoFile[0].arr_owner)).toBe(true);
    expect(Array.isArray(user_BB_deserialized.arr_photoFile[1].arr_owner)).toBe(true);

    expect(user_AA_deserialized).not.toBe(user_AA);
    expect(user_AA_deserialized.arr_photoFile[0]).not.toBe(photo_AP);
    expect(user_AA_deserialized.arr_photoFile[1]).not.toBe(photo_MA);
    // @duplicated_code;;

    // TODO missing more tests (not sure .toEqual() is safe enough...)

    const user_CC_deserialized = user_AA_deserialized.arr_friend[1];

    expect(user_CC_deserialized).toBeInstanceOf(User);
    expect(user_CC_deserialized.userName).toEqual('Gamma');
    expect(user_CC_deserialized.arr_photoFile[0]).toBeInstanceOf(Photo);
    expect(user_CC_deserialized.arr_photoFile[1]).toBeInstanceOf(Photo);
    expect(user_CC_deserialized.arr_photoFile[0].fileName).toEqual('Apple.jpg');
    expect(user_CC_deserialized.arr_photoFile[1].fileName).toEqual('Banana.jpg');
    expect(user_CC_deserialized.arr_photoFile[0].arr_owner[2]).toBe(user_CC_deserialized);
    expect(user_CC_deserialized.arr_photoFile[1].arr_owner[0]).toBe(user_CC_deserialized);

    expect(user_CC_deserialized.arr_photoFile[0].arr_owner[0]).toBe(user_AA_deserialized);
    expect(user_CC_deserialized.arr_photoFile[0].arr_owner[1]).toBe(user_BB_deserialized);

    expect(user_CC_deserialized.arr_photoFile[0]).toBe(user_AA_deserialized.arr_photoFile[0]);
    expect(user_CC_deserialized.arr_photoFile[0]).toBe(user_BB_deserialized.arr_photoFile[0]);

    //
    expect(user_CC_deserialized.arr_photoFile[1]).toBe(user_CC_deserialized.address.arr_photoFileStored[0]);

    // check array ref
    expect(user_CC_deserialized.address.arr_photoFileStored[1]).toBeInstanceOf(Photo);
    expect(user_CC_deserialized.address.arr_photoFileStored[1].fileName).toEqual('Pineapple.jpg');
    expect(user_CC_deserialized.arr_photoFile[1].arr_album[2]).toBe(
      user_CC_deserialized.address.arr_photoFileStored[1].arr_album[1]
    );
    // the pb is the parent ref could be the same.. the inner well ok should be same yeah (no those weird Reflection no not that thought)

    expect(user_AA).toEqual(userJsobjFlatted_AA);
    expect(user_AA).toEqual(user_AA_deserialized); // << @watch
  });
});

// TODO missing more tests
describe('missing more tests', () => {
  it('^^', () => {});
});

// TODO Set & Map & more complex structures
// TODO Support for @Transform
