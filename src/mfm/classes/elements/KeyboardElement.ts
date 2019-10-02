import { EventWindow } from "../EventWindow";
import { Elem } from "../Elem";
import { IElementType, ElementTypes } from "../ElementTypes";

export class Keyboard extends Elem {

  static TYPE_DEF: IElementType = { name: "KEYBOARD", type: "Kb", class: Keyboard, color: 0xeeee22 }

  data: any = undefined;

  constructor() {
    super(Keyboard.TYPE_DEF);

    window.addEventListener("keyup", (e) => {
      this.onKey(e);
    });
  }

  //Not used, this is for base layers
  exec(ew: EventWindow) {
    super.exec(ew);
  }

  onKey(e: KeyboardEvent): void {
    this.data = e.key;
  }


}

//Initialize Splat Map maps the # to to the self type
Keyboard.INITIALIZE_SPLAT_MAP()();
//Tells the App/GUI that this element exists
//ElementTypes.registerType(Keybaord.TYPE_DEF);