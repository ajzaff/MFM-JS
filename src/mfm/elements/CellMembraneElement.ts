import { EventWindow } from "../core/EventWindow";
import { Element } from "../core/Element";
import { IElementType } from "../core/IElementType";
import { ElementRegistry } from "../core/ElementRegistry";
import { Site } from "../core/Site";
import { Empty } from "./EmptyElement";
import { Actions } from "../utils/MFMActions";
import { SPLAT } from "../utils/SPLAT";
import { Symmetries } from "../utils/Symmetries";
import { CellOuterMembrane } from "./CellOuterMembraneElement";
import { Utils } from "../utils/MFMUtils";
import { CellBrane } from "./CellBraneElement";
import { Res } from "./ResElement";

export class CellMembrane extends Element {
  static BASE_TYPE: IElementType = { name: "CELLMEMBRANE", symbol: "Cm", class: CellMembrane, color: 0xc2f3c2 };
  static CREATE = CellMembrane.CREATOR();
  static COLORLESS = CellMembrane.CREATOR({ name: "CELLMEMBRANE_NOCOLOR", params: [false] });

  static MAKE_SHELL = SPLAT.splatToMap(`
      ~
     ~~_
    ~~~__
   ~~~~___
  ~~~~@~~~~
   ~~i~~~~
    ~~~~~
     ~~~
      ~
  `);

  // static MAKE_SHELL = SPLAT.splatToMap(`
  //   ~~~~___
  //  ~iii@____
  //   ~~~~~~~
  // `);

  // static MAKE_SHELL = SPLAT.splatToMap(`
  //  iii@___
  // `);

  static SHELL_GAP = SPLAT.splatToMap(`
   ~~~o~  
  ~~i@___
   ~~~~~
  `);

  static CHECK_SPLIT = SPLAT.splatToMap(`
    ~~~@oii
  `);

  idleCount: number = 0;
  roamCount: number = 0;
  shouldGrow: boolean = true;
  direction: string = "";
  directed: boolean = false;
  switchInterval: number = 10;
  intervalCounter: number = 0;
  showColors: boolean;
  stuckCounter: number = 0;

  stickyType: IElementType;
  constructor(_showColors: boolean = true) {
    super(CellMembrane.BASE_TYPE);

    this.stickyType = CellMembrane.BASE_TYPE;
    this.showColors = _showColors;
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

  // repelFromSticker(ew: EventWindow) {
  //   const sites: number[] = ew.getIndexes(EventWindow.ADJACENT8WAY, this.stickyType, true);

  //   if (sites[0]) {
  //     ew.origin.swapAtoms(ew.getSites(EventWindow.LAYER2, Empty.BASE_TYPE)[0]);
  //   }
  // }

  // repelType(ew: EventWindow, type: IElementType) {
  //   const sites: number[] = ew.getIndexes(EventWindow.ADJACENT8WAY, type, true);
  //   const eightwaypushmap: Map<number, number> = new Map<number, number>([
  //     [1, 37],
  //     [2, 38],
  //     [3, 39],
  //     [4, 40],
  //     [5, 25],
  //     [6, 26],
  //     [7, 27],
  //     [8, 28],
  //   ]);

  //   if (sites.length) {
  //     sites.forEach((dreg) => {
  //       const toSite: number = eightwaypushmap.get(dreg);
  //       if (ew.is(toSite, Empty.BASE_TYPE)) {
  //         ew.move(toSite, undefined, dreg);
  //       }
  //     });
  //   }
  // }

  repelDirection(ew: EventWindow, dir: string) {
    let toMap = new Map<string, Array<number>>([
      ["E", [10, 11, 12, 15, 16, 17, 18, 19, 20]],
      ["W", [9, 10, 11, 13, 14, 15, 16, 17, 18]],
      ["N", [9, 10, 12, 13, 14, 15, 17, 19, 20]],
      ["S", [9, 11, 12, 13, 14, 16, 18, 19, 20]],
      ["", [13, 14, 15, 16, 17, 18, 19, 20]],
    ]);

    // let toMap = new Map<string, Array<number>>([
    //   ["E", [17, 18, 19, 20, 24]],
    //   ["W", [13, 14, 15, 16, 21]],
    //   ["N", [13, 15, 17, 19, 22]],
    //   ["S", [14, 16, 18, 20, 23]],
    //   ["", [13, 14, 15, 16, 17, 18, 19, 20]],
    // ]);

    Actions.repelFrom(ew, this.stickyType, [1, 2, 3, 4, 5, 6, 7, 8], [...toMap.get(dir)]);
  }

  setDirectionColor() {
    switch (this.direction) {
      case "E":
        this.color = 0x1c5183;
        break; //pink
      case "W":
        this.color = 0xb73a26;
        break; //green
      case "N":
        this.color = 0x2a8240;
        break; //blue
      case "S":
        this.color = 0x961c54;
        break; //yellow
      default:
        this.color = CellMembrane.BASE_TYPE.color;
        break;
    }
  }

  getDirectionFromOuters(ew: EventWindow, nearbyOuters: number[]) {
    const suggestedDirections = ew
      .getSites(nearbyOuters, CellOuterMembrane.BASE_TYPE, false)
      .map((co) => (co.atom.elem as CellOuterMembrane).suggestedDirection);

    if (suggestedDirections.length > 0) {
      const directionMap: {} = {
        N: suggestedDirections.filter((sd) => sd == "N").length,
        S: suggestedDirections.filter((sd) => sd == "S").length,
        E: suggestedDirections.filter((sd) => sd == "E").length,
        W: suggestedDirections.filter((sd) => sd == "W").length,
      };

      let biggestDir: number = 0;

      for (const [key, value] of Object.entries(directionMap)) {
        if (value > 0 && value >= biggestDir) {
          biggestDir = value as number;
          this.direction = key == "empty" ? "" : key;
        }
      }
    }
  }

  getDirectionFromDirectedCM(ew: EventWindow, nearbyDirected: number[]) {
    const directeds = ew.getSites(nearbyDirected, CellMembrane.BASE_TYPE, false).map((co) => (co.atom.elem as CellMembrane).direction);

    if (directeds.length > 0) {
      const directionMap: {} = {
        N: directeds.filter((sd) => sd == "N").length,
        S: directeds.filter((sd) => sd == "S").length,
        E: directeds.filter((sd) => sd == "E").length,
        W: directeds.filter((sd) => sd == "W").length,
      };

      let biggestDir: number = 0;

      for (const [key, value] of Object.entries(directionMap)) {
        if (value > 0 && value >= biggestDir) {
          biggestDir = value as number;
          this.direction = key == "empty" ? "" : key;
        }
      }
    }
  }

  reverseDirection() {
    const opps: { [key: string]: string } = {
      N: "E",
      S: "W",
      E: "N",
      W: "S",
    };

    this.direction = this.direction !== "" ? opps[this.direction] : this.direction;
  }

  eat(ew: EventWindow) {
    const nearbyRes = ew.getIndexes(EventWindow.ADJACENT8WAY, Res.BASE_TYPE, true)[0];

    if (nearbyRes) {
      ew.mutate(nearbyRes, CellMembrane.CREATE({ params: [this.showColors] }));
    }
  }

  checkStuck(ew: EventWindow, nearbyCellMembranes: number[], nearbyEmpties: number[], nearbyOuterCellMembranes: number[]) {
    // if (nearbyOuterCellMembranes.length > 0 && nearbyEmpties.length == 0) {
    if (nearbyOuterCellMembranes.length > nearbyCellMembranes.length) {
      ++this.stuckCounter;
    } else {
      this.stuckCounter = 0;
    }

    if (this.stuckCounter >= 200 && nearbyOuterCellMembranes.length >= 2) {
      this.stuckCounter = 0;
      // ew.mutate(nearbyOuterCellMembranes[0], CellMembrane.CREATE({params: [this.showColors]}));
      // ew.mutate(nearbyOuterCellMembranes[1], CellMembrane.CREATE({params: [this.showColors]}));

      ew.mutateMany(nearbyOuterCellMembranes, Empty.CREATE);
      Actions.patrol(ew, [1, 2, 3, 4, 5, 6, 7, 8], 1);
    }
  }

  exec(ew: EventWindow) {
    this.moveToSticker(ew);

    const nearbyCellMembranes = ew.getIndexes(EventWindow.ALLADJACENT, CellMembrane.BASE_TYPE, false);
    const nearbyOuterCellMembranes = ew.getIndexes(EventWindow.ALLADJACENT, CellOuterMembrane.BASE_TYPE, false);
    const nearbyEmpties = ew.getIndexes(EventWindow.ADJACENT8WAY, Empty.BASE_TYPE, false);

    this.checkStuck(ew, nearbyCellMembranes, nearbyEmpties, nearbyOuterCellMembranes);
    //this.eat(ew);

    //am I small and undeveloped? grow!
    if (this.shouldGrow && nearbyCellMembranes.length < 26 && nearbyOuterCellMembranes.length == 0) {
      ew.mutate(nearbyEmpties.shift(), CellMembrane.CREATE({ params: [this.showColors] }));
      return;
    } else {
      this.shouldGrow = false;
    }

    //grow if no empties around and outer is around - possibly too small to get moving.
    // if (nearbyEmpties.length == 0 && nearbyOuterCellMembranes.length > 0) {
    //   this.shouldGrow = true;
    // }

    const nearbyBrane = ew.getRandomIndexOfType(EventWindow.ALLADJACENT, CellBrane.BASE_TYPE);

    //find a direction to travel
    if (nearbyBrane !== undefined) {
      this.direction = (ew.getSiteByIndex(nearbyBrane).atom.elem as CellBrane).getDirection();
      this.directed = true;
      nearbyCellMembranes.forEach((i) => {
        const c: CellMembrane = ew.getSiteByIndex(i).atom.elem as CellMembrane;
        c.direction = this.direction;
        c.directed = true;
      });
    } else {
      const nearbyDirected = nearbyCellMembranes.filter((cm) => (ew.getSiteByIndex(cm).atom.elem as CellMembrane).directed);

      if (nearbyDirected.length > 1) {
        this.getDirectionFromDirectedCM(ew, nearbyDirected);
        this.directed = true;
        nearbyCellMembranes.forEach((i) => {
          const c: CellMembrane = ew.getSiteByIndex(i).atom.elem as CellMembrane;
          c.direction = this.direction;
          c.directed = true;
        });
      } else {
        // this.direction = Utils.oneRandom(["N", "S", "E", "W"]);
        this.directed = false;
      }

      if (nearbyOuterCellMembranes.length > 15) {
        this.getDirectionFromOuters(ew, nearbyOuterCellMembranes);
        this.directed = true;
        nearbyCellMembranes.forEach((i) => {
          const c: CellMembrane = ew.getSiteByIndex(i).atom.elem as CellMembrane;
          c.direction = this.direction;
          c.directed = true;
        });
      }
    }

    if (Utils.oneIn(1)) {
      this.directed = false;
    }

    // this.direction = "W";

    if (this.showColors) this.setDirectionColor();

    //These should be closer to the center of the cell
    if (nearbyCellMembranes.length > 26) {
      this.repelDirection(ew, this.direction);
      this.reverseDirection();
    }

    // if (nearbyOuterCellMembranes.length > 1 && ew.getIntersection(nearbyEmpties, EventWindow.ADJACENT8WAY).length > 6) {
    //   console.log("grow");
    //   ew.mutate(ew.getNearestIndex(EventWindow.ADJACENT8WAY, Empty.BASE_TYPE), CellMembrane.CREATE({params: [this.showColors]}));
    // }

    //am I an edge? Make some outer membrane please
    const checkEdge = ew.query(CellMembrane.MAKE_SHELL, 0, ElementRegistry.SPLAT_MAP, Symmetries.ALL);
    if (checkEdge) {
      const edgeEmpties = checkEdge.get(Empty.BASE_TYPE.name);
      while (edgeEmpties.length) {
        ew.mutate(edgeEmpties.shift(), CellOuterMembrane.CREATE({ params: [CellMembrane.BASE_TYPE, 1, 3, this.showColors] }));
      }
    }

    //there's a gap in the outer membrane, help boost it up
    const checkShellGap = ew.query(CellMembrane.SHELL_GAP, 0, ElementRegistry.SPLAT_MAP, Symmetries.ALL);
    if (checkShellGap) {
      const gapEmpties = checkShellGap.get(Empty.BASE_TYPE.name);
      while (gapEmpties.length) {
        ew.mutate(gapEmpties.shift(), CellOuterMembrane.CREATE({ params: [CellMembrane.BASE_TYPE, 1, 3, this.showColors] }));
      }
    }

    //eat outermembrane that got too close inside
    const checkSplit = ew.query(CellMembrane.CHECK_SPLIT, 0, ElementRegistry.SPLAT_MAP, Symmetries.ALL);
    if (checkSplit) {
      const possibleSticky = checkSplit.get(CellOuterMembrane.BASE_TYPE.name);
      if (possibleSticky.length) {
        ew.destroy(possibleSticky[0]);
      }
    }

    //reverse when foreign contaminant
    // if (
    //   ew.getAll().filter((s) => {
    //     return s && !ew.is(s, [Empty.BASE_TYPE, CellBrane.BASE_TYPE, CellOuterMembrane.BASE_TYPE, CellMembrane.BASE_TYPE]);
    //   }).length > 0
    // ) {
    //   this.reverseDirection();
    // }

    //reverse when hitting the edge of grid
    // if (ew.getAll().filter((s) => s).length < 40) {
    //   this.reverseDirection();
    //   // this.directed = true;
    // }

    //repel DREG as defensive move.
    // Actions.repel(ew, DReg.BASE_TYPE);

    super.exec(ew);
  }
}

//Initialize Splat Map maps the # to to the self type
CellMembrane.INITIALIZE_SPLAT_MAP()();
//Tells the App/GUI that this element exists

ElementRegistry.registerSPLAT("i", CellMembrane.BASE_TYPE);
