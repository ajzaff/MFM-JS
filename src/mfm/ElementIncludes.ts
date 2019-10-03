//For the time being, you need to add your Element here to make it show up in the GUI
import { Mason } from "../mfm/classes/elements/MasonElement";
import { Empty } from "../mfm/classes/elements/EmptyElement";
import { SwapWorm } from "../mfm/classes/elements/SwapWormElement";
import { StickyMembrane } from "../mfm/classes/elements/StickyMembraneElement";
import { Res } from "../mfm/classes/elements/ResElement";
import { DReg } from "../mfm/classes/elements/DRegElement";
import { Wall } from "../mfm/classes/elements/WallElement";
import { ForkBomb } from "../mfm/classes/elements/ForkBombElement";
import { SuperForkBomb } from "../mfm/classes/elements/SuperForkBomb";
import { AntiForkBomb } from "../mfm/classes/elements/AntiForkBombElement";
import { Sentry } from "../mfm/classes/elements/SentryElement";
import { Data } from "../mfm/classes/elements/DataElement";
import { Reducer } from "../mfm/classes/elements/ReducerElement";
import { LoopWorm } from "../mfm/classes/elements/LoopWormElement";
import { LoopSeed } from "../mfm/classes/elements/LoopSeedElement";
import { Writer } from "../mfm/classes/elements/WriterElement";
import { Sorter } from "../mfm/classes/elements/SorterElement";
import { SortMaster } from "../mfm/classes/elements/SortMasterElement";
import { Template } from "../mfm/classes/elements/TemplateElement";
import { SuperMason } from "./classes/elements/SuperMasonElement";
import { StuckMembrane } from "./classes/elements/StuckMembraneElement";
import { Input } from "./classes/elements/InputElement";
import { Keyboard } from "./classes/elements/KeyboardElement";
import { BasePlanter } from "./classes/elements/BasePlanterElement";
import { Text } from "./classes/elements/TextElement";
import { Reader } from "./classes/elements/ReaderElement";
import { RevolvingDoor } from "./classes/elements/RevolvingDoorElement";
import { OnewayDoor } from "./classes/elements/OnewayDoorElement";
import { MembraneWall } from "./classes/elements/MembraneWallElement";
import { MembraneDoor } from "./classes/elements/MembraneDoorElement";
import { Eraser } from "./classes/elements/EraserElement";

//[Mason, SuperMason, StuckMembrane, Input, Data, Reader, Keyboard, BasePlanter, Text, Empty, SwapWorm, StickyMembrane, Res, DReg, Wall, ForkBomb, SuperForkBomb, AntiForkBomb, Sentry, Data, Reducer, LoopWorm, LoopSeed, Writer, SortMaster, Sorter, Template, RevolvingDoor, OnewayDoor];

export class ElementIncludes {

  static ELEMENT_MENU_MAP: Map<string, [string, Function][]> = new Map<string, [string, Function][]>()
    .set("MFM", [
      ["Empty", Empty.CREATE],
      ["DReg", DReg.CREATE],
      ["Res", Res.CREATE],
      ["Blue Res", Res.CREATE_BLUE],
      ["ForkBomb", ForkBomb.CREATE],
      ["SuperForkbomb", SuperForkBomb.CREATE],
      ["AntiForkBomb", AntiForkBomb.CREATE],
      ["Sentry", Sentry.CREATE]
    ])
    .set("Structural", [
      ["Wall", Wall.CREATE],
      ["Mason", Mason.CREATE],
      ["Super Mason", SuperMason.CREATE],
      ["MembraneWall", MembraneWall.CREATE],
      ["MembraneDoor", MembraneDoor.CREATE],
    ])
    .set("Doors", [
      ["Revolving Door", RevolvingDoor.CREATE],
      ["W→NES", OnewayDoor.CREATE],
      ["W→E", OnewayDoor.W_E],
      ["N→S", OnewayDoor.N_S],
      ["S→N", OnewayDoor.S_N],
      ["E→W", OnewayDoor.E_W],
      ["⬋ E→S", OnewayDoor.E_S],
      ["⬊ N→E", OnewayDoor.N_E],
      ["⬈ W→N", OnewayDoor.W_N],
      ["⬉ S→W", OnewayDoor.S_W],
    ])
    .set("Goopy Stuff", [
      ["StickyMembrane", StickyMembrane.CREATE],
      ["StuckMembrane", StuckMembrane.CREATE],
      ["Fireworks (Template)", Template.CREATE],
    ])
    .set("Worms", [
      ["SwapWorm", SwapWorm.CREATE],
      ["Long SW", SwapWorm.CREATOR([24])],
      ["Short SW", SwapWorm.CREATOR([2])],
      ["LoopWorm", LoopWorm.CREATE],
      ["LoopSeed", LoopSeed.CREATE]
    ])
    .set("Data Stuff", [
      ["Data", Data.CREATE],
      ["Sorter", Sorter.CREATE],
      ["SortMaster", SortMaster.CREATE],
      ["Input", Input.CREATE],
      ["Reducer", Reducer.CREATE],
    ])
    .set("Input", [
      ["KeyboardPlanter", BasePlanter.CREATE],
      ["Reader", Reader.CREATE],
      ["Writer", Writer.CREATE],
      ["Text", Text.CREATE],
    ])
    .set("Misc", [
      ["Eraser", Eraser.CREATE],
    ])






}
