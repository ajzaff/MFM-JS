import { EventWindow } from "../Eventwindow";
import { Elem } from "../Elem";
import { ElementTypes, IElementType } from "../ElementTypes";
import { Atom } from "../Atom";
import { Data } from "./DataElement";
import { Keyboard } from "./KeyboardElement";
import { Empty } from "./EmptyElement";

//data exists on the atom, so this thing doesn't do much but be a shell for an instance
export class Reader extends Elem {

  static TYPE_DEF: IElementType = { name: "READER", type: "Rd", class: Reader, color: 0xeeee22 }


  constructor() {
    super(Reader.TYPE_DEF);
  }

  exec(ew: EventWindow) {


    //look for keyboard base layer
    if (ew.origin.readBase().is(Keyboard.TYPE_DEF)) {
      const key = (ew.origin.readBase().elem as Keyboard).data;


      const emptyAdj = ew.getRandomIndexOfType(EventWindow.ADJACENT8WAY, Empty.TYPE_DEF);

      if (emptyAdj !== undefined && key !== undefined) {

        ew.mutate(emptyAdj, new Atom(Data.TYPE_DEF, undefined, { value: key }));

        (ew.origin.readBase().elem as Keyboard).data = undefined;
      }

    }


    super.exec(ew);
  }

}

