import { EventWindow } from "../../core/EventWindow";
import { Empty } from "../EmptyElement";
import { Utils } from "../../utils/MFMUtils";
import { Quark } from "../../core/Quark";

export class QPatroller extends Quark {
  static CLASS: string = "PATROLLER";

  patrol(ew: EventWindow, withinSites: number[] = EventWindow.ADJACENT4WAY, chanceToPatrol: number = 1) {
    if (Utils.oneIn(chanceToPatrol)) {
      const emptyIndex: number = ew.getIndexes(withinSites, Empty.BASE_TYPE, true)[0];
      emptyIndex !== undefined ? ew.move(emptyIndex) : null;
    }
  }
}
