
import { EventWindow } from "../EventWindow";
import { Elem } from "../Elem";
import { IElementType, ElementTypes } from "../ElementTypes";
import { Utils } from "../../utils/MFMUtils";
import { SPLAT } from "../../utils/SPLAT";
import { Empty } from "./EmptyElement";
import { Wall } from "./WallElement";

export class RevolvingDoor extends Elem {

  static TYPE_DEF: IElementType = { name: "REVOLVING DOOR", type: "Rd", class: RevolvingDoor, color: 0x4466ff };
  static CREATE = RevolvingDoor.CREATOR();


  static checkWalls = SPLAT.splatToMap(`
    w~w
    ~@~
    w~w
  `);

  pREVOLVE = 1;
  exits: number[] = [1, 3, 4, 2];
  currentExits: number[] = [1, 3];
  curExitOffset = 0;

  constructor() {

    super(RevolvingDoor.TYPE_DEF, 0, 100);



  }

  revolve(ew: EventWindow) {
    this.curExitOffset = (this.curExitOffset + 1) % this.exits.length;
    this.currentExits = this.exits.slice(this.curExitOffset, this.curExitOffset + 2 % 4);
    this.currentExits.length < 2 ? this.currentExits.push(this.exits[0]) : null;
    console.log(this.currentExits);
  }

  exec(ew: EventWindow) {



    //Set up the base structure
    const walls = ew.query(RevolvingDoor.checkWalls, 0, RevolvingDoor.SPLAT_MAP);
    if (!walls) {
      ew.mutateMany([5, 6, 7, 8], Wall.CREATE);
    }


    //Close the closed exits
    ew.getMinus(this.exits, this.currentExits).forEach(i => {
      if (ew.is(i, Empty.TYPE_DEF)) {
        ew.mutate(i, Wall.CREATE());
      }
    })

    //open the open exits (if closed)
    this.currentExits.forEach(i => {

      if (ew.is(i, Wall.TYPE_DEF)) {
        ew.mutate(i, Empty.CREATE());
      }

    });

    //check exits for something and an empty, swap them.
    if ((!ew.is(this.currentExits[0], Empty.TYPE_DEF) && ew.is(this.currentExits[1], Empty.TYPE_DEF)) || !ew.is(this.currentExits[1], Empty.TYPE_DEF) && ew.is(this.currentExits[0], Empty.TYPE_DEF)) {
      ew.swap(this.currentExits[0], this.currentExits[1]);

      //try to push out further so we can revolve the door
      if (ew.is(this.currentExits[0] + 8, Empty.TYPE_DEF)) {
        ew.swap(this.currentExits[0], this.currentExits[0] + 8)
      }

      if (ew.is(this.currentExits[1] + 8, Empty.TYPE_DEF)) {
        ew.swap(this.currentExits[1], this.currentExits[1] + 8)
      }

      this.revolve(ew);
    } else {

      if (Utils.oneIn(this.pREVOLVE)) {
        this.revolve(ew);
      }

    }

  }
}

RevolvingDoor.INITIALIZE_SPLAT_MAP()();
ElementTypes.registerType(RevolvingDoor.TYPE_DEF);