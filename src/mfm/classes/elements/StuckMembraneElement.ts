import { EventWindow } from "../Eventwindow";
import { Elem } from "../Elem";
import { ElementTypes, IElementType } from "../ElementTypes";
import { Site } from "../Site";
import { Atom } from "../Atom";

export class StuckMembraneElement extends Elem {

  stickyType: IElementType;
  idleCount: number = 0;
  roamCount: number = 0;
  maxRoam: number;

  constructor(stickyType?: IElementType, maxRoam: number = 2) {
    super(ElementTypes.STUCKMEMBRANE.name, ElementTypes.STUCKMEMBRANE.type);
    this.stickyType = stickyType ? stickyType : undefined;
    this.maxRoam = maxRoam;

  }


  moveToSticker(ew: EventWindow) {

    const sites: number[] = ew.getIndexes([...EventWindow.LAYER3, ...EventWindow.LAYER4], this.stickyType, true);

    if (sites[0]) {
      const targetSiteIndex: number = sites[0];
      const toSiteIndex: number = ew.getIndexToward(targetSiteIndex);

      const toSite: Site = ew.getSiteByIndex(toSiteIndex);

      if (toSite && toSite.atom.type === ElementTypes.EMPTY) {
        const swapped: boolean = ew.origin.swapAtoms(toSite);

        if (!swapped) {
          this.idleCount++;
        } else {
          this.idleCount = 0;
        }

        this.roamCount = 0;
      }
    } else {
      //roam
      const swapped: boolean = ew.origin.swapAtoms(ew.getAdjacent4Way(ElementTypes.EMPTY));

      if (!swapped) {
        this.idleCount++;
      } else {
        this.idleCount = 0;

        this.roamCount++;
      }

    }


  }


  repelType(ew: EventWindow, type: IElementType) {
    const sites: number[] = ew.getIndexes(EventWindow.ADJACENT8WAY, type, true);
    const eightwaypushmap: Map<number, number> = new Map<number, number>([
      [1, 37], [2, 38], [3, 39], [4, 40], [5, 25], [6, 26], [7, 27], [8, 28]
    ]);

    if (sites.length) {
      sites.forEach(dreg => {
        const toSite: number = eightwaypushmap.get(dreg);
        if (ew.is(toSite, ElementTypes.EMPTY)) {
          ew.move(toSite, undefined, dreg);
        }
      });
    }
  }

  uncrowd(ew: EventWindow) {

    if (ew.getAdjacent4Way(this.stickyType) && ew.getSites(EventWindow.ALLADJACENT, ElementTypes.STUCKMEMBRANE, false).filter(site => site).length > 6) {
      ew.origin.killSelf();
    }
  }

  isAdjacentToSticker(ew: EventWindow): boolean {
    if (ew.getAdjacent4Way(this.stickyType)) {
      return true;
    }

    return false;
  }



  exec(ew: EventWindow) {

    this.uncrowd(ew);

    //repel DREG as defensive move.
    this.repelType(ew, ElementTypes.DREG);
    //this.excreteMembrane(ew);

    //death is the greatest adventure
    if (this.roamCount > this.maxRoam || this.idleCount > 100) {
      ew.origin.killSelf();
    }

    //we're stuck on our stickyType, do nothing!
    if (this.stickyType && !(this.stickyType === ElementTypes.STUCKMEMBRANE) && this.isAdjacentToSticker(ew)) {
      return;
    }

    if (!this.stickyType || this.stickyType === ElementTypes.STUCKMEMBRANE) {

      //glom on to the first thing that's not empty and also maybe don't stick to self if something else is nearby
      const stickSite: Site = ew.getAdjacent8Way();
      if (stickSite && stickSite.atom.type !== ElementTypes.EMPTY) {
        this.stickyType = stickSite.atom.type;
      }


    }

    this.moveToSticker(ew);




    super.exec(ew);
  }
}
