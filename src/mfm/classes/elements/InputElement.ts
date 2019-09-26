import { EventWindow } from "../Eventwindow";
import { Elem } from "../Elem";
import { ElementTypes } from "../ElementTypes";
import { Atom } from "../Atom";

export class InputElement extends Elem {

  max: number;

  constructor(max: number = 40) {
    super(ElementTypes.WALL.name, ElementTypes.WALL.type, 0, 100);
    this.max = max;
  }
  exec(ew: EventWindow) {

    // const walls: number[] = [10, 11, 15, 16, 25, 26];

    // walls.forEach(wall => {
    //   if (ew.is(wall, ElementTypes.EMPTY)) {
    //     ew.mutate(wall, new Atom(ElementTypes.WALL));
    //   }
    // })


    const indexes: number[] = [7, 4, 8];

    indexes.forEach(index => {

      if (ew.is(index, ElementTypes.EMPTY)) {
        ew.mutate(index, new Atom(ElementTypes.DATA, undefined, { value: Math.random() * this.max << 0 }));
      }

    })

    if (ew.is(24, ElementTypes.EMPTY)) {
      ew.mutate(24, new Atom(ElementTypes.SORTER, [0, undefined, "E"]));
    }

    super.exec(ew);
  }
}