import { Tile } from "./mfm/classes/Tile";
import { MFMRenderer } from "./renderer/MFMRenderer";
import { ElementTypes, IElementType } from "./mfm/classes/ElementTypes";

declare var Vue: any;

let app = new Vue({
  el: "#app",
  data: function () {
    return {
      gridSize: "48x48" as string,
      timeSpeed: 5000 as number,
      g: undefined as Tile,
      mfmRenderer: MFMRenderer,
      customSequence: "" as string,
      curSelectedElement: "" as string,
      typeMap: ElementTypes.TYPES_MAP as Map<string, IElementType>,
      dynamicDef: "" as string
    };
  },
  mounted() {

    this.initTile();

  },
  methods: {
    initTile() {
      this.g = new Tile(this.gridCols, this.gridRows);
      this.mfmRenderer = new MFMRenderer(this.g, document.querySelector("#mfm"));

      this.curSelectedElement = this.curSelectedElement ? this.curSelectedElement : "DREG";
      this.selectElement(this.curSelectedElement);
    },
    selectElement(name: string) {
      console.log("setting element", name);
      this.curSelectedElement = name;
      this.mfmRenderer.curSelectedElement = this.curSelectedElement;
    },
    reload() {
      this.mfmRenderer.deconstruct();
      this.initTile();
    }
  },
  computed: {
    gridCols() {
      return this.gridSize.split("x")[0];
    },
    gridRows() {
      return this.gridSize.split("x")[1];
    }
  },
  watch: {
    timeSpeed(val: number) {
      this.mfmRenderer.timeSpeed = val;
    },
    gridSize(val: string) {
      this.mfmRenderer.deconstruct();
      this.initTile();
    },
    dynamicDef(val: string) {
      this.mfmRenderer.dynamicDef = this.dynamicDef;
    }
  }
});
