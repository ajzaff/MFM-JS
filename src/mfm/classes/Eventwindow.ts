import { GridCoord } from "../interfaces/IGridCoord";
import { Tile } from "./Tile";
import { MFMUtils } from "../utils/utils";
import { Site } from "./Site";
import { IElementType, ElementTypes } from "./ElementTypes";

//Event window as describbed here: http://robust.cs.unm.edu/lib/exe/fetch.php?w=300&tok=4c8f49&media=dev:event-window-10.png
//Collection of sites which contain atoms, built from an origin (center) site
export class EventWindow {
  static WINDOW_ORDER_OFFSETS: Array<GridCoord> = [
    { col: 0, row: 0 },
    { col: -1, row: 0 },
    { col: 0, row: -1 },
    { col: 0, row: 1 },
    { col: 1, row: 0 },
    { col: -1, row: -1 },
    { col: -1, row: 1 },
    { col: 1, row: -1 },
    { col: 1, row: 1 },
    { col: -2, row: 0 },
    { col: 0, row: -1 },
    { col: 0, row: 2 },
    { col: 2, row: 0 },
    { col: -2, row: -1 },
    { col: -2, row: 1 },
    { col: -1, row: -2 },
    { col: -1, row: 2 },
    { col: 1, row: -2 },
    { col: 1, row: 2 },
    { col: 2, row: -1 },
    { col: 2, row: 1 },
    { col: -3, row: 0 },
    { col: 0, row: -3 },
    { col: 0, row: 3 },
    { col: 3, row: 0 },
    { col: -2, row: -2 },
    { col: -2, row: 2 },
    { col: 2, row: -2 },
    { col: 2, row: 2 },
    { col: -3, row: -1 },
    { col: -3, row: 1 },
    { col: -1, row: -3 },
    { col: -1, row: 3 },
    { col: 1, row: -3 },
    { col: 1, row: 3 },
    { col: 3, row: -1 },
    { col: 3, row: 1 },
    { col: -4, row: 0 },
    { col: 0, row: -4 },
    { col: 0, row: 4 },
    { col: 4, row: 0 }
  ];

  //directions as gridcoords, good for cartesian-based traversal of event window
  static GC_WEST: GridCoord = EventWindow.WINDOW_ORDER_OFFSETS[1];
  static GC_NORTH: GridCoord = EventWindow.WINDOW_ORDER_OFFSETS[2];
  static GC_SOUTH: GridCoord = EventWindow.WINDOW_ORDER_OFFSETS[3];
  static GC_EAST: GridCoord = EventWindow.WINDOW_ORDER_OFFSETS[4];
  static GC_NW: GridCoord = EventWindow.WINDOW_ORDER_OFFSETS[5];
  static GC_SW: GridCoord = EventWindow.WINDOW_ORDER_OFFSETS[6];
  static GC_NE: GridCoord = EventWindow.WINDOW_ORDER_OFFSETS[7];
  static GC_SE: GridCoord = EventWindow.WINDOW_ORDER_OFFSETS[8];

  //index-based EW maps
  static ORIGIN: number[] = [0];
  static WEST: number[] = [1];
  static NORTH: number[] = [2];
  static SOUTH: number[] = [3];
  static EAST: number[] = [4];
  static NW: number[] = [5];
  static SW: number[] = [6];
  static NE: number[] = [7];
  static SE: number[] = [8];

  static ADJACENT4WAY: number[] = [1, 2, 3, 4];
  static ADJACENT8WAY: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

  static LAYER1: number[] = [1, 2, 3, 4];
  static LAYER2: number[] = [5, 6, 7, 8, 9, 10, 11, 12];
  static LAYER3: number[] = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  static LAYER4: number[] = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];

  static ALL: number[] = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40
  ];
  static ALLADJACENT: number[] = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40
  ];

  static SUBSETS: Map<string, number[]> = new Map<string, number[]>()
    .set("4way", EventWindow.ADJACENT4WAY)
    .set("8way", EventWindow.ADJACENT8WAY)
    .set("all", EventWindow.ALL);

  tile: Tile;
  origin: Site;
  window: Map<GridCoord, Site>;
  windowArray: Array<Site>;

  constructor(_tile: Tile, _origin: GridCoord) {
    this.makeWindow(_tile, _origin);
  }

  private makeWindow(tile: Tile, origin: GridCoord) {
    this.origin = tile.getSiteByCoord(origin);
    //if the origin is EMPTY Element, let's save some cycles (good, bad?) - bad if you want empty's age.
    if (this.origin.atom.type === ElementTypes.EMPTY) {
      return;
    }

    this.window = new Map<GridCoord, Site>();
    this.tile = tile;

    //use event window template offsets to build the rest of the event window
    let offset: GridCoord;
    let site: Site;

    for (let i = 0; i < EventWindow.WINDOW_ORDER_OFFSETS.length; i++) {
      offset = EventWindow.WINDOW_ORDER_OFFSETS[i];
      site = tile.getSiteByCoord(this.OffsetFromOrigin(origin, offset));

      this.window.set(offset, site);
    }

    this.windowArray = Array.from(this.window.values());
  }

  private OffsetFromOrigin(origin: GridCoord, offset: GridCoord): GridCoord {
    return { row: origin.row + offset.row, col: origin.col + offset.col };
  }

  //get site by specific window index
  getSiteByIndex(index: number): Site {
    return index >= this.windowArray.length || index < 0 ? undefined : this.windowArray[index];
  }

  //return all window sites (of type)
  getAll(specificType: IElementType = undefined): Site[] {
    if (specificType) {
      return this.windowArray.filter(site => {
        if (site && site.atom.type === specificType) {
          return true;
        } else {
          return false;
        }
      });
    }

    return this.windowArray;
  }

  //get 1 random site (of type)
  getRandom(specificType: IElementType = undefined): Site {
    return this.getRandomSite(this.getAll(specificType));
  }

  //most useful when using specificType
  //traverses the window until it comes across what you're looking for
  getNearest(specificType: IElementType = undefined): Site {
    return this.getNearestSite(this.getAll(specificType));
  }

  getEast(): Site {
    return this.getDirection(EventWindow.GC_EAST);
  }
  getWest(): Site {
    return this.getDirection(EventWindow.GC_WEST);
  }
  getNorth(): Site {
    return this.getDirection(EventWindow.GC_NORTH);
  }
  getSouth(): Site {
    return this.getDirection(EventWindow.GC_SOUTH);
  }
  getNorthWest(): Site {
    return this.getDirection(EventWindow.GC_NW);
  }
  getSouthWest(): Site {
    return this.getDirection(EventWindow.GC_SW);
  }
  getNorthEast(): Site {
    return this.getDirection(EventWindow.GC_NE);
  }
  getSouthEast(): Site {
    return this.getDirection(EventWindow.GC_SE);
  }

  //get random site (of type) in Adjacent 4-way subset
  getAdjacent4Way(specificType: IElementType = undefined): Site {
    return this.getSites(EventWindow.ADJACENT4WAY, specificType, true)[0];
  }

  //get random site (of type) in Adjacent 8-way subset
  getAdjacent8Way(specificType: IElementType = undefined): Site {
    return this.getSites(EventWindow.ADJACENT8WAY, specificType, true)[0];
  }

  //Given an index-based subset of the event window
  //give me back sites (of type) (or one random)

  getSites(subset: number[], type: IElementType = undefined, oneRandom: boolean = true): Site[] {
    let candidates: Site[] = this.getSubset(subset);

    //proxy for getSubset I guess
    if (!type && !oneRandom) {
      return candidates;
    }

    //filter by type
    if (type) {
      candidates = this.filterSitesByType(candidates, type);
    }

    //return array of just 1 random site from filtered
    if (oneRandom) {
      return [this.getRandomSite(candidates)];
    }

    return candidates;
  }

  //get a subset of sites from a the event window, subset defined as array of indexes
  getSubset(subset: number[]): Site[] {
    return subset.map(index => {
      if (this.windowArray[index]) {
        return this.windowArray[index];
      }
    });
  }

  //gridcoord way to access directions
  getDirection(direction: GridCoord): Site {
    return this.window.get(direction);
  }

  //return array of sites from site array that match type
  private filterSitesByType(sites: Site[], type: IElementType): Site[] {
    return sites.filter(site => {
      if (site && site.atom.type === type) {
        return true;
      }

      return false;
    });
  }

  //return single random site given site array
  private getRandomSite(sites: Site[]): Site {
    return sites[(Math.random() * sites.length) >> 0];
  }

  private getNearestSite(sites: Site[]): Site {
    return sites[0];
  }
}
