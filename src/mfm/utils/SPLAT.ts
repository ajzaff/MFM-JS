import { Symmetries } from "./Symmetries";
import { Utils } from "./MFMUtils";
import { IElementType } from "../core/IElementType";

//SPLAT Eval Function should take in an IElementType and return an IElementType that is matched
//or undefined if no match
export type SPLATEval = {
  (t: IElementType): IElementType | undefined;
};

export class SPLAT {
  static splatToMap(splatDiagram: string): Map<number, string> {
    //split map by lines
    let lines: string[] = splatDiagram.split("\n");

    //remove spaces and empty lines
    let allLines: string[][] = lines
      .map((l) => l.replace(/\s+/g, ""))
      .filter((l) => l !== "")
      .map((l) => {
        return l.split("");
      });

    //arrange all rows middle-out
    allLines = Utils.processArrayMiddleOut(allLines);

    //pad the splatDiagram with missing ew spots
    const lineLengths: number[] = [9, 7, 7, 5, 5, 3, 3, 1, 1];
    for (let i = 0; i < allLines.length; i++) {
      const lineLen = lineLengths[i];
      let line = allLines[i];
      let addSide = 0;

      //pad left and right until line is proper length
      while (line.length < lineLen) {
        line.push("~");
        line.unshift("~");
      }

      if (line.length > lineLen) {
        line.shift();
      }

      allLines[i] = line;
    }

    //map the indexes
    const EWMAP: Map<number, string> = new Map<number, string>();
    const symlen = Symmetries.PSYM_NORMAL.length;
    for (let i = 0; i < symlen; i++) {
      Symmetries.PSYM_NORMAL[i].forEach((index, j) => {
        if ((index || index === 0) && allLines[i] && allLines[i][j] && allLines[i][j] !== "~") {
          EWMAP.set(index, allLines[i][j]);
        }
      });
    }

    return EWMAP;
  }

  static MAP_ALL_DIAGONALS: Map<number, string> = SPLAT.splatToMap(`
  _~_
  ~@~
  _~_
  `);

  static MAP_NW: Map<number, string> = SPLAT.splatToMap(`
  _~~
  ~@~
  ~~~
  `);

  static MAP_SW: Map<number, string> = SPLAT.splatToMap(`
  ~~~
  ~@~
  _~~
  `);

  static MAP_SE: Map<number, string> = SPLAT.splatToMap(`
  ~~~
  ~@~
  ~~_
  `);

  static MAP_NE: Map<number, string> = SPLAT.splatToMap(`
  ~~_
  ~@~
  ~~~
  `);

  static MAP_NSEW: Map<number, string> = SPLAT.splatToMap(`
  ~_~
  _@_
  ~_~
  `);

  static MAP_NS: Map<number, string> = SPLAT.splatToMap(`
  _
  @
  _
  `);
  static MAP_EW: Map<number, string> = SPLAT.splatToMap(`_@_`);

  static MAP_E: Map<number, string> = SPLAT.splatToMap(`~@_`);
  static MAP_W: Map<number, string> = SPLAT.splatToMap(`_@~`);
  static MAP_S: Map<number, string> = SPLAT.splatToMap(`
  ~
  @
  _
  `);
  static MAP_N: Map<number, string> = SPLAT.splatToMap(`
  _
  @
  ~
  `);
}
