import { EventWindow } from "../core/EventWindow";
import { Element } from "../core/Element";
import { IElementType } from "../core/IElementType";
import { ElementRegistry } from "../core/ElementRegistry";
import { Site } from "../core/Site";
import { Empty } from "./EmptyElement";
import { DReg } from "./DRegElement";
import { Actions } from "../utils/MFMActions";

export class StickyMembrane extends Element {
  static BASE_TYPE: IElementType = { name: "STICKYMEMBRANE", symbol: "Sm", class: StickyMembrane, color: 0x611075 };
  static CREATE = StickyMembrane.CREATOR();

  stickyType: IElementType;
  idleCount: number = 0;
  roamCount: number = 0;
  membraneDensity: number;
  maxRoam: number;

  constructor(stickyType?: IElementType, membraneDensity?: number, maxRoam?: number) {
    super(StickyMembrane.BASE_TYPE);

    this.stickyType = stickyType ? stickyType : undefined;
    this.maxRoam = maxRoam ? maxRoam : 200;
    this.setMembraneDensity(membraneDensity);
  }

  setMembraneDensity(density: number = 1) {
    this.membraneDensity = (density * 40) >> 0;
  }

  moveToSticker(ew: EventWindow) {
    const sites: number[] = ew.getIndexes([...EventWindow.LAYER3, ...EventWindow.LAYER4], this.stickyType, true);

    if (sites[0]) {
      const targetSiteIndex: number = sites[0];
      const toSiteIndex: number = ew.getIndexToward(targetSiteIndex);

      const toSite: Site = ew.getSiteByIndex(toSiteIndex);

      if (toSite && toSite.atom.is(Empty.BASE_TYPE)) {
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
      const swapped: boolean = ew.origin.swapAtoms(ew.getAdjacent4Way(Empty.BASE_TYPE));

      if (!swapped) {
        this.idleCount++;
      } else {
        this.idleCount = 0;

        this.roamCount++;
      }
    }
  }

  repelFromSticker(ew: EventWindow) {
    const sites: number[] = ew.getIndexes(EventWindow.ADJACENT8WAY, this.stickyType, true);

    if (sites[0]) {
      ew.origin.swapAtoms(ew.getSites(EventWindow.LAYER2, Empty.BASE_TYPE)[0]);
    }
  }

  repelType(ew: EventWindow, type: IElementType) {
    const sites: number[] = ew.getIndexes(EventWindow.ADJACENT8WAY, type, true);
    const eightwaypushmap: Map<number, number> = new Map<number, number>([
      [1, 37],
      [2, 38],
      [3, 39],
      [4, 40],
      [5, 25],
      [6, 26],
      [7, 27],
      [8, 28],
    ]);

    if (sites.length) {
      sites.forEach((dreg) => {
        const toSite: number = eightwaypushmap.get(dreg);
        if (ew.is(toSite, Empty.BASE_TYPE)) {
          ew.move(toSite, undefined, dreg);
        }
      });
    }
  }

  uncrowd(ew: EventWindow) {
    if (
      ew.getAdjacent4Way(this.stickyType) &&
      ew.getSites(EventWindow.ALLADJACENT, StickyMembrane.BASE_TYPE, false).filter((site) => site).length > this.membraneDensity
    ) {
      ew.origin.die();
    }
  }

  exec(ew: EventWindow) {
    if (this.roamCount > this.maxRoam) {
      ew.origin.die();
    }

    if (this.idleCount > 100) {
      ew.origin.die();
    }

    if (!this.stickyType || this.stickyType.name === StickyMembrane.BASE_TYPE.name) {
      //glom on to the first thing that's not empty and also maybe don't stick to self if something else is nearby
      const stickSite: Site = ew.getAdjacent8Way();
      if (stickSite && stickSite.atom.type.name !== Empty.BASE_TYPE.name) {
        console.log("GLOM", stickSite.atom.type);
        this.stickyType = stickSite.atom.type;
      }
    }

    this.moveToSticker(ew);
    this.repelFromSticker(ew);
    this.uncrowd(ew);

    //Repel self away from sticky, this is what makes this element magical
    Actions.repelFrom(ew, this.stickyType, [1, 2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12, 5, 6, 7, 8]);

    //repel DREG as defensive move.
    Actions.repel(ew, DReg.BASE_TYPE);

    //repel RES for experimenting...
    //this.repelType(ew, Res.BASE_TYPE);

    super.exec(ew);
  }
}

//Initialize Splat Map maps the # to to the self type
StickyMembrane.INITIALIZE_SPLAT_MAP()();
//Tells the App/GUI that this element exists
