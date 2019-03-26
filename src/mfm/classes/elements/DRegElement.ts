import { EventWindow } from "../Eventwindow";
import { Elem } from "../Elem";
import { ElementTypes } from "../ElementTypes";
import { Site } from "../Site";
import { EmptyElement } from "./EmptyElement";
import { ResElement } from "./ResElement";
import { Atom } from "../Atom";
import { MFMUtils } from "../../utils/utils";

export class DRegElement extends Elem {
  pDREG_CREATE: number;
  pRES_CREATE: number;
  pDREG_DESTROY: number;
  pANY_DESTROY: number;
  pTOTAL_CHANCE: number;

  constructor() {
    super(ElementTypes.DREG.name, ElementTypes.DREG.type);

    this.pDREG_CREATE = 1000;
    this.pRES_CREATE = 300;
    this.pDREG_DESTROY = 10;
    this.pANY_DESTROY = 100;
  }

  exec(ew: EventWindow) {

    //if there's an adjacent empty
    if (ew.hasa( ew.getSubSet(EventWindow.ADJACENT4WAY), ElementTypes.EMPTY)) {
      if (MFMUtils.oneIn(this.pDREG_CREATE)) {
        ew.move( ew.self(), ew.typeAt(ElementTypes.EMPTY, ew.getSubSet(EventWindow.ADJACENT4WAY)), ElementTypes.DREG);
      } else if( MFMUtils.oneIn(this.pRES_CREATE)) {
        ew.move( ew.self(), ew.typeAt(ElementTypes.EMPTY, ew.getSubSet(EventWindow.ADJACENT4WAY)), ElementTypes.RES);
      } else {
        ew.move( ew.self(), ew.typeAt(ElementTypes.EMPTY, ew.getSubSet(EventWindow.ADJACENT4WAY));
      }
    } 
    //if there's an adjacent dreg
    else if( ew.hasa(ew.getSubSet(EventWindow.ADJACENT4WAY), ElementTypes.DREG) && MFMUtils.oneIn(this.pDREG_DESTROY) ) {
      
    } else if( MFMUtils.oneIn(this.pANY_DESTROY) ) {


    }

    //get a random NESW site
    const availableSite: Site = ew.getAdjacent8Way();

    //CREATION
    if (availableSite && availableSite.atom.type === ElementTypes.EMPTY) {
      const createDReg: boolean = Math.random() * this.pDREG_CREATE < 1;
      const createRes: boolean = Math.random() * this.pRES_CREATE < 1;

      if (createDReg) {
        ew.origin.moveAtom(availableSite, new Atom(ElementTypes.DREG));
        //console.log("DREG CREATED");
      } else if (createRes) {
        ew.origin.moveAtom(availableSite, new Atom(ElementTypes.RES));
        //console.log("RES CREATED");
      } else {
        ew.origin.swapAtoms(availableSite);
      }
    } else if (availableSite && availableSite.atom.type === ElementTypes.DREG) {
      const destroyDReg: boolean = Math.random() * this.pDREG_DESTROY < 1;

      if (destroyDReg) {
        //console.log("DREG DESTROYED");
        ew.origin.moveAtom(availableSite);
      }
    } else {
      //it's something else
      const destroyAny: boolean = Math.random() * this.pANY_DESTROY < 1;

      if (destroyAny) {
        //console.log(availableSite.atom.type.name + " DESTROYED");
        ew.origin.moveAtom(availableSite);
      }
    }

    super.exec(ew);
  }
}
