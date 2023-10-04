/**
 * linkageToBeConnected_bt_UnderConstructingClass_and_InnerFieldEsCircularField
 */
class LinkageConstructingCircular {
  /**
   * Make sure you pass in the correct linkage (from the plain_jsobj side),
   * then you call {@link establishLinkage}, pass in the side from the class_instance, to establish the linkage
   * @param jsobjPlainCircularRefTo dummy, not used, you already have this in the Map, just for clarity
   * @param innerFieldThatHasCircularField
   * @param innerFieldEsCircularFieldIndex
   */
  constructor(
    public readonly jsobjPlainCircularRefTo: any,
    public readonly innerFieldThatHasCircularField: any | any[] | Set<any> | null,
    public readonly innerFieldEsCircularFieldIndex: string | number | null
  ) {}

  private null_instanceClassCompletedConstructing = Symbol('null_instanceClassCompletedConstructing'); // init state
  private _instanceClassCompletedConstructing: any | Symbol = this.null_instanceClassCompletedConstructing;
  public get instanceClassCompletedConstructing() {
    if (this.detmInstanceClassCompletedConstructing()) {
      return this._instanceClassCompletedConstructing;
    } else {
      throw new Error('instanceClassCompletedConstructing has no value, construction is not completed yet');
    }
  }
  public detmInstanceClassCompletedConstructing() {
    return this._instanceClassCompletedConstructing !== this.null_instanceClassCompletedConstructing;
  }

  /**
   * call right before the return of the construction of the class_instance
   * @param instanceClassCompletedConstructing_L the class_instance
   */
  public establishLinkage(instanceClassCompletedConstructing_L: any) {
    this._instanceClassCompletedConstructing = instanceClassCompletedConstructing_L;

    // @main: connect linkage from both side -- resolve the circular reference
    if (this.innerFieldThatHasCircularField instanceof Set) {
      if (this.innerFieldEsCircularFieldIndex !== null) throw new TypeError();
      this.innerFieldThatHasCircularField.add(instanceClassCompletedConstructing_L);
    } else if (Array.isArray(this.innerFieldThatHasCircularField)) {
      if (typeof this.innerFieldEsCircularFieldIndex !== 'number') throw new TypeError();
      (this.innerFieldThatHasCircularField as any[])[this.innerFieldEsCircularFieldIndex] =
        instanceClassCompletedConstructing_L; // should have the space -- cuz added null (js array init can made those empty space undefined)
    } else if (typeof this.innerFieldThatHasCircularField === 'object') {
      if (typeof this.innerFieldEsCircularFieldIndex !== 'string') throw new TypeError();
      this.innerFieldThatHasCircularField[this.innerFieldEsCircularFieldIndex] = instanceClassCompletedConstructing_L;
    } else if (this.innerFieldThatHasCircularField === null && this.innerFieldEsCircularFieldIndex === null) {
      /** {@link storeAtLeastOneLinkage} */
      throw new TypeError(
        'This is a special "value holder" only. There is no stored linkage inside to establish. -- just get the value directly & link outside manually by yourself.'
      );
    } else {
      throw new TypeError(
        `typeof this.innerFieldThatHasCircularField :: ${typeof this.innerFieldThatHasCircularField}`
      );
    }
  }

  public static storeAtLeastOneLinkage(value: any, instanceClassCompletedConstructing: any) {
    const linkageConstructingCircular = new LinkageConstructingCircular(value, null, null);
    linkageConstructingCircular._instanceClassCompletedConstructing = instanceClassCompletedConstructing;
    return linkageConstructingCircular;
  }
}

/**
 * use this class to resolve & convert `circular dependent Js plain object` to `Js class instance` 
 * (-- ResolveCircularDependenyWhenPlainToClass)
 * (only works in simple case)
 *
 * set {@link resolveCircularDependenyWhenPlainToClassInSimpleCases} to true to use this
 *
 * {@link ResolveCircularDependenyWhenPlainToClass.spec.ts} is the test/demo file for this
 */
export class CircularDependencyLinkageManager {
  /**
   * @logic,procedure::{
   * when a plain_jsobj first encountered, put the plain_jsobj in map key
   * (-> go to recursion)
   * when a inner_field_es_circular_field is encountered, find the corresponding plain_jsobj & put this inner_field & inner_field_es_circular_field to map value
   * (-> recursion is done)
   * when a plain_jsobj is about to finied (-- return -- a class_instance is created from plain_jsobj already),
   * connect the inner_field_es_circular_field & class_instance by accessing this map value
   * }
   *
   * Its an Array of Linakge, cuz the linkage is grouped by plain_jsobj -- a group of all circular_field that have ref to the plain_jsobj
   */
  // private readonly mppLinkageForCircularRef = new Map<any, [any, string] | symbol>();
  // private readonly mppLinkageForCircularRef = new Map<any, (readonly [any | any[] | Set<any>, string | number | null])[]>();
  private readonly mppLinkageForCircularRef = new Map<any, LinkageConstructingCircular[]>();
  // ~~~~// that store string id in jsobj is not needed anymore, cuz now Im using a real Class.
  // ok linkage need have ref ready in the first encounter, not at later see
  // // ok that not need to use the 2nd layer pointer as a holder on that inner_field_es_circular_field
  // -- cuz now its using a class - can just access to the inner field easier
  // ---- so just use a null placeholder is fine
  // public linkageToBeConnected_bt_UnderConstructingClass_and_InnerFieldEsCircularField;
  //   // seems no better structure .. just use array (was thinking tuple / Record thing in ts .. seem no such.. ; (though em even in Java seem no much better , could biMap lib , or better just custom class))
  //   // https://stackoverflow.com/questions/4956844/hashmap-with-multiple-values-under-the-same-key // hum
  // I see, that pb is that need to put array of multi value inside that map , otherwise later one will overwrite the prev one
  // dont really have js map with readonly value.. y..
  // use 2nd layer pointer seems has better performance -- cuz no need for anthoer loop for assignemnt  ( but nah ... )

  /**
   * for resolveCircularDependenyWhenPlainToClassInSimpleCases.
   * just a placeholder, like a null.
   *
   * at the end it (all of these) should be replaced by a real class instance (the circular referenced one)
   * -- so, if at any time you see this after the conversion -- somewhere in the code must be wrong
   */
  private readonly null_circularFieldToUnderConstructingClassRef_placeHolder_classtransform = Symbol(
    'null_circularFieldToUnderConstructingClassRef_placeHolder_classtransform'
  );

  public addLinkageFirstEncounterFromJsobjSide(jsobj: any) {
    {
      // if jsobj is some primitives -- those are not circular ref, dont need to store linkage for those // @need_check
      if (jsobj === undefined || jsobj === null) {
        return;
      }
      // ;[no .. this is true for Array / Set / ...]; if (jsobj !== Object(jsobj)) {
      // @performance no strictly necessary, can link even if jsobj is primitives, just performance.
      // though `jsobj === undefined || jsobj === null` must be checked
      if (typeof jsobj === 'string' || typeof jsobj === 'number' || typeof jsobj === 'boolean') {
        return;
      }
    }

    if (!this.mppLinkageForCircularRef.has(jsobj)) {
      // provide the linkage from the plain_jsobj es side
      this.mppLinkageForCircularRef.set(jsobj, []); // initalize the array inside
    }
  }

  /**
   *
   * @param field_maybe_jsobjPlainCircularRefTo
   * @returns false: this is not a circular_field (or not yet) -- just do normal operation, no circular ope involved
   */
  public detmThisIsACircularField(field_maybe_jsobjPlainCircularRefTo: any) {
    return this.mppLinkageForCircularRef.has(field_maybe_jsobjPlainCircularRefTo);
  }

  /**
   * (~~~~// hard for single responsibility.. cuz need to use the map many times... (else performance is bad & code is tangling around) )
   * @returns assign the return value to the jsobj/instanceClass, it may be a dummy value or a real class instance completed constructing
   */
  public addLinkageFromCircularFieldSide_or_establishLinkageIfInstanceClassAlreadyCompletedConstructing(
    jsobjPlainCircularRefTo: any,
    innerFieldThatHasCircularField: any | any[] | Set<any>,
    innerFieldEsCircularFieldIndex: string | number
  ) {
    const arr_innerField_and_innerFieldEsCircularField = this.mppLinkageForCircularRef.get(jsobjPlainCircularRefTo);
    // instanceClassCompletedConstructing already constructed, just directly assign it
    if (
      arr_innerField_and_innerFieldEsCircularField.length !== 0 &&
      arr_innerField_and_innerFieldEsCircularField[0].detmInstanceClassCompletedConstructing()
    ) {
      return arr_innerField_and_innerFieldEsCircularField[0].instanceClassCompletedConstructing; // yes you can just access the first item, they all the same anyways (processed in loop in same batch) // @need_encapsulate better
    }
    // else you need to create & store the Linkage
    else {
      // provide the linkage from the inner_field es side // when you get to the "key" (pointer/address) level -- in Object/Array es inner_field (-- before transform recurssion)
      const arr_innerField_and_innerFieldEsCircularField = this.mppLinkageForCircularRef.get(jsobjPlainCircularRefTo);
      arr_innerField_and_innerFieldEsCircularField.push(
        new LinkageConstructingCircular(
          jsobjPlainCircularRefTo,
          innerFieldThatHasCircularField,
          innerFieldEsCircularFieldIndex
        )
      );
      return this.null_circularFieldToUnderConstructingClassRef_placeHolder_classtransform;
    }
  }

  public establishLinkageForAllCircularFieldRefToThisInstanceClass(
    jsobjPlainCircularRefTo: any,
    instanceClassCompletedConstructing: any
  ) {
    const arr_innerField_and_innerFieldEsCircularField = this.mppLinkageForCircularRef.get(jsobjPlainCircularRefTo);
    if (arr_innerField_and_innerFieldEsCircularField === undefined) {
      throw new Error(
        'Must have, cuz you must add the jsobj when you first encountered it. Otherwise, you are using this map wrong.'
      );
    }
    // if empty, then it means there is no circular reference to this plain jsobj
    //
    // more precisely, within these currently encountered inner scoped recursion, there has been no circular reference to this jsobj YET.
    // but in outer scope recursion (in another breadth loop / branch), there could be
    // --> which means, you need to add at least one item here, so that (other recursion branch) later ref to this jsobj,, knows that the class_instance is constructed.
    //
    // (-- normally, this means this is the end / deepest-nested of all those recursion, all upper stream pointer linkge has stored & ready for establishment)
    if (arr_innerField_and_innerFieldEsCircularField.length === 0) {
      arr_innerField_and_innerFieldEsCircularField.push(
        LinkageConstructingCircular.storeAtLeastOneLinkage(jsobjPlainCircularRefTo, instanceClassCompletedConstructing)
      );
    } else {
      for (const linkageConstructingCircular of arr_innerField_and_innerFieldEsCircularField) {
        if (linkageConstructingCircular.detmInstanceClassCompletedConstructing()) {
          // @do_nothing
          if (linkageConstructingCircular.instanceClassCompletedConstructing !== instanceClassCompletedConstructing)
            throw new Error(
              'Should be same. (And should have no more push in the array once that instanceClass is constructed)'
            );
        } else {
          linkageConstructingCircular.establishLinkage(instanceClassCompletedConstructing);
        }
      }
    }
    // ;[dont do this, other outer scope breath recursion may need it]; this.mppLinkageForCircularRef.delete(value);
  }
}
