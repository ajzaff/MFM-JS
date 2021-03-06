import { Tile } from "./mfm/core/Tile";
import { MFMRenderer } from "./renderer/MFMRenderer";
import { ElementIncludes } from "./mfm/ElementIncludes";
import { DReg } from "./mfm/elements/DRegElement";
import { ElementRegistry } from "./mfm/core/ElementRegistry";
import { Empty } from "./mfm/elements/EmptyElement";

declare var Vue: any;

let app = new Vue({
  el: "#app",
  data: function () {
    return {
      gridSize: "128x64" as string,
      timeSpeed: 25000 as number,
      tenex: false as boolean,
      g: undefined as Tile,
      mfmRenderer: MFMRenderer,
      customSequence: "" as string,
      curSelectedElement: "" as string,
      curSelectedFunc: undefined as Function,
      shouldRender: true as boolean,
      shouldExecute: true as boolean,
      fullScreenMode: false as boolean,
      seedData: undefined as any[],
    };
  },
  mounted() {
    const params = this.getParams(window.location.href);
    if (params.fullscreen) {
      this.fullScreenMode = true;
    }

    this.initTile();

    if (params.seed) {
      this.initSeedData(params.seed);
      this.loadSeeds();
    }
  },
  methods: {
    initSeedData(data: string) {
      const seeds = data.split(";");

      this.seedData = seeds.map((s: string) => {
        const seed: string[] = s.split(",");
        if (!seed.length) return null;

        console.log(seed[3]);

        const data = {
          e: seed[0].toUpperCase(),
          col: seed[1] ? parseInt(seed[1]) : (Math.random() * this.g.width) >> 0,
          row: seed[2] ? parseInt(seed[2]) : (Math.random() * this.g.height) >> 0,
          params: seed[3] ? JSON.parse(seed[3]) : null,
        };

        return data;
      });
    },

    loadSeeds() {
      if (this.seedData.length) {
        this.seedData.forEach((seed: any) => {
          if (seed.params) {
            console.log("SEED", { seed });
            this.g.getSiteByCoord({ row: seed.row, col: seed.col }).atom = ElementRegistry.TYPES.get(seed.e)?.CREATE({ params: seed.params });
          } else {
            this.g.getSiteByCoord({ row: seed.row, col: seed.col }).atom = ElementRegistry.TYPES.get(seed.e)?.CREATE({ params: null });
          }
        });
      }
    },

    getSeedLink() {
      const t: Tile = this.g;
      const link =
        "https://" +
        window.location.host +
        "?seed=" +
        Array.from(t.sites.values())
          .filter((s) => !s.atom.is(Empty.BASE_TYPE))
          .map((s) => {
            return `${s.atom.type.name},${s.tilePos.col},${s.tilePos.row}`;
          })
          .join(";");

      console.log(link);
      return link;
    },

    getTileCanvasSize() {
      const maxHeight = document.documentElement.clientHeight * 0.9;
      const maxWidth = document.documentElement.clientWidth * 0.9;

      let w = (this.gridCols / this.gridRows) * maxHeight;
      let h = maxHeight;

      if (w > maxWidth) {
        w = maxWidth;
        h = (this.gridRows / this.gridCols) * maxWidth;
      }

      return {
        width: w,
        height: h,
      };
    },

    initTile() {
      this.g = new Tile(this.gridCols, this.gridRows);
      this.mfmRenderer = new MFMRenderer(this.g, document.querySelector("#mfm"), this.getTileCanvasSize().width, this.getTileCanvasSize().height);

      this.mfmRenderer.timeSpeed = this.timeSpeed ? this.timeSpeed : 5000;
      this.curSelectedElement = this.curSelectedElement ? this.curSelectedElement : "DReg";
      this.curSelectedFunc = this.curSelectedFunc ? this.curSelectedFunc : DReg.CREATE;
      this.selectElement(this.curSelectedElement, this.curSelectedFunc);
    },
    selectElement(name: string, func: Function) {
      this.curSelectedElement = name;
      this.curSelectedFunc = func;
      this.mfmRenderer.curSelectedElement = this.curSelectedElement;
      this.mfmRenderer.curSelectedElementFunction = this.curSelectedFunc;
    },
    reload() {
      this.mfmRenderer.killAll();
    },
    clearAllOfType() {
      this.mfmRenderer.killType(this.curSelectedFunc().type);
    },

    getParams(url: string) {
      var params: any = {};
      var parser = document.createElement("a");
      parser.href = url;
      var query = parser.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        params[pair[0]] = decodeURIComponent(pair[1]) as any;
      }
      return params;
    },
  },
  computed: {
    gridCols() {
      return this.gridSize.split("x")[0];
    },
    gridRows() {
      return this.gridSize.split("x")[1];
    },
    typeMap() {
      return ElementIncludes.ELEMENT_MENU_MAP;
    },
  },
  watch: {
    tenex(val: boolean) {
      this.mfmRenderer.timeSpeed = this.tenex ? 10 * this.mfmRenderer.timeSpeed : this.mfmRenderer.timeSpeed / 10;
    },
    timeSpeed(val: number) {
      this.mfmRenderer.timeSpeed = this.tenex ? 10 * val : val;
    },
    gridSize(val: string) {
      this.mfmRenderer.deconstruct();
      this.initTile();
    },
    customSequence(val: string) {
      this.mfmRenderer.customSequence = this.customSequence;
    },
    shouldRender(val: boolean) {
      console.log("should render", val);
      this.mfmRenderer.shouldRender = val;
    },
    shouldExecute(val: boolean) {
      console.log("should execute", val);
      this.mfmRenderer.shouldExecute = val;
    },
  },
});
