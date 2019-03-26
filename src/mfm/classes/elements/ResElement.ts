import { EventWindow } from "../Eventwindow";
import { Elem } from "../Elem";
import { ElementTypes } from "../ElementTypes";

export class ResElement extends Elem {
  constructor() {
    super(ElementTypes.RES.name, ElementTypes.RES.type);
  }
  exec(ew: EventWindow) {
    if (ew.hasa(ew.getSubset(EventWindow.ADJACENT4WAY), ElementTypes.EMPTY)) {
      ew.move(ew.self(), ew.typeAt(ElementTypes.EMPTY, ew.getSubset(EventWindow.LAYER1)));
    }

    //ew.origin.swapAtoms(ew.getAdjacent8Way(ElementTypes.EMPTY));
    super.exec(ew);
  }
}
