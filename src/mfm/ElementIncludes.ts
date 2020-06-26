//For the time being, you need to add your Element here to make it show up in the GUI
import { Mason } from "./core/elements/MasonElement";
import { Empty } from "./core/elements/EmptyElement";
import { SwapWorm } from "./core/elements/SwapWormElement";
import { StickyMembrane } from "./core/elements/StickyMembraneElement";
import { Res } from "./core/elements/ResElement";
import { DReg } from "./core/elements/DRegElement";
import { Wall } from "./core/elements/WallElement";
import { ForkBomb } from "./core/elements/ForkBombElement";
import { SuperForkBomb } from "./core/elements/SuperForkBomb";
import { AntiForkBomb } from "./core/elements/AntiForkBombElement";
import { Sentry } from "./core/elements/SentryElement";
import { Data } from "./core/elements/DataElement";
import { Reducer } from "./core/elements/ReducerElement";
import { LoopWorm } from "./core/elements/LoopWormElement";
import { LoopSeed } from "./core/elements/LoopSeedElement";
import { Writer } from "./core/elements/WriterElement";
import { Sorter } from "./core/elements/SorterElement";
import { SortMaster } from "./core/elements/SortMasterElement";
import { Template } from "./core/elements/TemplateElement";
import { SuperMason } from "./core/elements/SuperMasonElement";
import { StuckMembrane } from "./core/elements/StuckMembraneElement";
import { Input } from "./core/elements/InputElement";
import { Keyboard } from "./core/elements/KeyboardElement";
import { BasePlanter } from "./core/elements/BasePlanterElement";
import { Text } from "./core/elements/TextElement";
import { Reader } from "./core/elements/ReaderElement";
import { RevolvingDoor } from "./core/elements/RevolvingDoorElement";
import { OnewayDoor } from "./core/elements/OnewayDoorElement";
import { MembraneWall } from "./core/elements/MembraneWallElement";
import { MembraneDoor } from "./core/elements/MembraneDoorElement";
import { Eraser } from "./core/elements/EraserElement";
import { Sand } from "./core/elements/SandElement";
import { Water } from "./core/elements/WaterElement";
import { DecayWall } from "./core/elements/DecayWallElement";
import { GridBuilder } from "./core/elements/GridBuilderElement";
import { Builder } from "./core/elements/BuilderElement";
import { Builders } from "./core/elements/Builders";
import { SPLAT } from "./utils/SPLAT";

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
      ["Sentry", Sentry.CREATE],
    ])
    .set("Structural", [
      ["Wall", Wall.CREATE],
      ["Mason", Mason.CREATE],
      ["Super Mason", SuperMason.CREATE],
      // ["Super Mason Random", SuperMason.RANDOM_CREATE],
      ["MembraneWall", MembraneWall.CREATE],
      ["MembraneWallXL", MembraneWall.SW_XL],
      ["MembraneWallLrg", MembraneWall.SW_LRG],
      ["MembraneDataWall", MembraneWall.D_MED],
      ["MembraneDataWallLrg", MembraneWall.D_LRG],
      ["DecayWall-10", DecayWall.CREATE],
      ["DecayWall-100", DecayWall.LIVE_100],
      ["DecayWall-1000", DecayWall.LIVE_1000],
      ["Grid Builder", GridBuilder.CREATE],
      ["Wall Grid", GridBuilder.GRID_WALL],
      ["Sorter Grid", GridBuilder.GRID_SORTER],
      ["Data Grid", GridBuilder.GRID_DATA],
      ["DecayWall Grid", GridBuilder.CREATOR([DecayWall.LIVE_100])],
      ["Builder", Builder.CREATE],
      ["Fun", Builders.LOOP],
      ["H Wall", Builders.HLINE],
      ["V Wall", Builders.VLINE],
      ["SE Diag Wall", Builders.DLINE_SE],
      ["NE Diag Wall", Builders.DLINE_NE],
      ["V DecayWall", Builders.VDLINE],
      ["H DecayWall", Builders.HDLINE],
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
      ["⬈ S→E", OnewayDoor.S_E],
      ["⬉ E→N", OnewayDoor.E_N],
      ["⬋ N→W", OnewayDoor.N_W],
      ["⬊ W→S", OnewayDoor.W_S],
      ["W→NS", OnewayDoor.W_NS],
      ["E→NS", OnewayDoor.E_NS],
      ["S→EW", OnewayDoor.S_EW],
      ["N→EW", OnewayDoor.N_EW],
      ["W→NE", OnewayDoor.W_NE],
      ["N→WSE", OnewayDoor.N_WSE],
      ["WNE→S", OnewayDoor.WNE_S],
    ])
    .set("Goopy Stuff", [
      ["StickyMembrane", StickyMembrane.CREATE],
      ["StuckMembrane", StuckMembrane.CREATE],
      ["Fireworks (Template)", Template.CREATE],
    ])
    .set("Worms", [
      ["SwapWorm", SwapWorm.CREATE],
      ["Long SW", SwapWorm.CREATOR([24])],
      ["Short SW", SwapWorm.CREATOR([1])],
      ["LoopWorm", LoopWorm.CREATE],
      ["LoopSeed", LoopSeed.CREATE],
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
    .set("Misc", [["Eraser", Eraser.CREATE]])
    .set("Sandbox Stuff", [
      ["Sand", Sand.CREATE],
      ["Water", Water.CREATE],
      ["Sand Grid", GridBuilder.GRID_SAND],
      ["Water Grid", GridBuilder.CREATOR([Water.CREATE])],
    ]);
}
