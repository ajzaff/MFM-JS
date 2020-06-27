import { EventWindow } from "../EventWindow";
import { Elem } from "../Elem";
import { IElementType } from "../IElementType";
import { ElementTypes } from "../ElementTypes";

export class Wall extends Elem {
  static TYPE_DEF: IElementType = { name: "WALL", type: "w", class: Wall, color: 0x2020ff };
  static CREATE = Wall.CREATOR();
  static SOFT_WALL = Wall.CREATOR([100, 0], undefined, 0x4499cc);

  constructor(_moveability: number = 0, _destroyability: number = 100) {
    super(Wall.TYPE_DEF, _moveability, _destroyability);
  }
  exec(ew: EventWindow) {
    super.exec(ew);
  }
}

//Initialize Splat Map maps the # to to the self type
Wall.INITIALIZE_SPLAT_MAP()();
//Tells the App/GUI that this element exists
ElementTypes.registerType(Wall.TYPE_DEF);
//Register a SPLAT symbol
ElementTypes.registerSPLAT("w", Wall.TYPE_DEF);
