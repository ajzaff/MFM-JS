import { EventWindow } from "../core/EventWindow";
import { Element } from "../core/Element";
import { IElementType } from "../core/IElementType";
import { ElementRegistry } from "../core/ElementRegistry";
import { LoopWorm } from "./LoopWormElement";
import { Site } from "../core/Site";
import { Atom } from "../core/Atom";
import { Empty } from "./EmptyElement";
import { LoopNucleus } from "./LoopNucleusElement";
import { Wall } from "./WallElement";

export class LoopSeed extends Element {
  static BASE_TYPE: IElementType = { name: "LOOPSEED", symbol: "Ls", class: LoopSeed, color: 0xfcc038 };
  static CREATE = LoopSeed.CREATOR();

  travelPath: number[] = [4, 3, 1, 2];
  nextTravel: number = 0;
  nextWall: number = 0;
  cycles: number = 0;

  constructor() {
    super(LoopSeed.BASE_TYPE);
  }

  makeLoopNode(ew: EventWindow, index: number, prev: number, next: number) {
    const loopNode: LoopWorm = new LoopWorm(0, prev, next);
    loopNode.isConnected = true;
    loopNode.expandCount = 1;

    const site: Site = ew.getSiteByIndex(index);
    // const atom: Atom = new Atom();
    // atom.setElement(loopNode);

    ew.origin.mutateSite(site, LoopWorm.CREATE({ params: [0, prev, next] }));
  }

  travel(ew: EventWindow, type: IElementType) {
    const toSite: Site = ew.getSiteByIndex(this.travelPath[this.nextTravel]);

    ew.origin.moveAtom(toSite, new Atom(type));

    this.nextTravel = this.nextTravel >= this.travelPath.length - 1 ? 0 : this.nextTravel + 1;
  }

  buildWall(ew: EventWindow, type: IElementType) {
    const northWall: number[] = [25, 15, 10, 17, 27];
    const eastWall: number[] = [27, 19, 12, 20, 28];
    const southWall: number[] = [28, 18, 11, 16, 26];
    const westWall: number[] = [26, 14, 9, 13, 25];
    const walls: number[][] = [northWall, eastWall, southWall, westWall];
    const walltoBuild: number[] = walls[this.nextWall];

    if (this.cycles < 8) {
      const northClearing: number[] = [5, 2, 7];
      const eastClearing: number[] = [7, 4, 8];
      const southClearing: number[] = [8, 3, 6];
      const westClearing: number[] = [6, 1, 5];

      const clearings: number[][] = [northClearing, eastClearing, southClearing, westClearing];
      const clearingToClear: number[] = clearings[this.nextWall];

      clearingToClear.forEach((siteNum) => {
        const site: Site = ew.getSiteByIndex(siteNum);
        ew.origin.mutateSite(site, new Atom(Empty.BASE_TYPE));
      });
    }

    walltoBuild.forEach((siteNum) => {
      const site: Site = ew.getSiteByIndex(siteNum);
      ew.origin.mutateSite(site, new Atom(type));
    });

    this.nextWall = this.nextWall >= walls.length - 1 ? 0 : this.nextWall + 1;
  }

  makeRoom(ew: EventWindow) {}

  makeLoop(ew: EventWindow) {
    const site: Site = ew.getSiteByIndex(2);
    ew.origin.mutateSite(site, new Atom(LoopWorm.BASE_TYPE, [11]));
  }

  hasLoop(ew: EventWindow): boolean {
    const loops: Site[] = ew.getSites(EventWindow.ALLADJACENT, LoopWorm.BASE_TYPE);
    return loops.length > 0 && loops[0] !== undefined;
  }

  exec(ew: EventWindow) {
    let innerType: IElementType = Wall.BASE_TYPE;
    let outerType: IElementType = Wall.BASE_TYPE;

    //make room
    if (this.cycles > 3 && this.cycles < 8) {
    }

    if (this.cycles === 8) {
      this.makeLoop(ew);
    }

    if (this.cycles > 8 && !this.hasLoop(ew)) {
      console.log("no loop");
      this.cycles = this.nextTravel;
    }

    if (this.cycles > 120) {
      outerType = Empty.BASE_TYPE;
      innerType = LoopNucleus.BASE_TYPE;
    }

    if (this.cycles > 123) {
      ew.origin.die();
    }

    this.buildWall(ew, outerType);
    this.travel(ew, innerType);

    this.cycles++;

    super.exec(ew);
  }
}

//Initialize Splat Map maps the # to to the self type
LoopSeed.INITIALIZE_SPLAT_MAP()();
//Tells the App/GUI that this element exists
