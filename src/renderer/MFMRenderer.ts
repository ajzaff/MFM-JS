///<reference types="pixi.js"/>

import { ParticleContainer, DisplayObject, Texture, Sprite, Application, utils, interaction, Point, Rectangle } from "pixi.js";
import "../mfm/ElementIncludes";
import { IElementType, ElementTypes } from "../mfm/classes/ElementTypes";
import { Tile } from "../mfm/classes/Tile";
import { EventWindow } from "../mfm/classes/EventWindow";
import { Site } from "../mfm/classes/Site";
import { SiteRenderer } from "./SiteRenderer";
import { Atom } from "../mfm/classes/Atom";
import { Mason } from "../mfm/classes/elements/MasonElement";
import { GridCoord } from "../mfm/interfaces/IGridCoord";
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
import { SortMaster } from "../mfm/classes/elements/SortMasterElement";
import { OnewayDoor } from "../mfm/classes/elements/OnewayDoorElement";

export class MFMRenderer {
  appX: number = 800;
  appY: number = 800;
  selectedSite: Site;
  timeSpeed: number = 5000;
  siteSize: number = 8;
  siteSpacing: number = 0;
  gridOffset: number = 10;
  srContainer: ParticleContainer = new ParticleContainer(200000, { tint: true });
  siteRenderers: Map<Sprite, SiteRenderer> = new Map<Sprite, SiteRenderer>();
  rendererMap: Map<Site, SiteRenderer> = new Map<Site, SiteRenderer>();
  container: Element;
  keysHeld: Set<string>;
  pointerDown: boolean = false;
  siteTexture: Texture = Texture.from("/resources/element.png");
  clickArea: DisplayObject;
  curSelectedElement: string;
  webGLSupported: boolean = utils.isWebGLSupported();

  ewCache: Map<GridCoord, EventWindow> = new Map<GridCoord, EventWindow>();

  customSequence: string;

  tile: Tile;

  pixiapp: Application;

  constructor(_tile: Tile, _container: Element) {
    this.tile = _tile;
    this.container = _container;
    this.siteSize = Math.floor(this.appX / this.tile.width);

    this.init();
  }

  deconstruct() {
    this.ewCache.clear();
    this.siteRenderers.clear();
    this.rendererMap.clear();
    this.pixiapp.stop();
    this.pixiapp.destroy(true);
  }

  init() {
    this.keysHeld = new Set<string>();

    this.pixiapp = new Application({
      width: this.appX,
      height: this.appY,
      antialias: false,
      transparent: false,
      backgroundColor: 0x222222,
      resolution: 1
    });

    this.srContainer.x = this.gridOffset;
    this.srContainer.y = this.gridOffset;
    this.pixiapp.stage.addChild(this.srContainer);

    this.clickArea = new DisplayObject();
    this.clickArea.hitArea = new Rectangle(0, 0, 800, 800);
    this.clickArea.interactive = true;
    this.pixiapp.stage.addChild(this.clickArea);

    this.clickArea.on("pointerdown", (e: interaction.InteractionEvent) => {
      this.pointerDown = true;
      this.handleClick(e);
    });

    this.clickArea.on("pointerup", (e: interaction.InteractionEvent) => {
      this.pointerDown = false;
    });

    this.clickArea.on("pointermove", this.handleClick, this);

    document.addEventListener("keydown", (key: any) => {
      this.onKeyDown(key);
    });
    document.addEventListener("keyup", (key: any) => {
      this.onKeyUp(key);
    });

    this.initSites();

    console.log("added game loop")
    this.pixiapp.ticker.add((delta: number) => this.gameLoop(delta));
    this.container.appendChild(this.pixiapp.view);
  }

  initSites() {
    let sitesArray: Site[] = Array.from(this.tile.sites.values());
    let siteLen: number = sitesArray.length;
    let site: Site;

    for (let i = 0; i < siteLen; i++) {
      site = sitesArray[i];
      let sr: SiteRenderer = new SiteRenderer(site, this.siteSize, this.siteSpacing, this.siteTexture);

      this.srContainer.addChild(sr.visual);
      this.siteRenderers.set(sr.visual, sr);
      this.rendererMap.set(site, sr);

      //cached event windows ++
      this.ewCache.set(site.tilePos, new EventWindow(this.tile, site.tilePos));
    }


  }

  gameLoop(delta: number) {


    let ew: EventWindow;
    let renders: Set<SiteRenderer> = new Set<SiteRenderer>();
    let i = 0;

    for (i; i < this.timeSpeed; i++) {

      ew = this.ewCache.get(this.tile.getRandomSite().tilePos);

      if (ew.window && !ew.origin.atom.is(Empty.TYPE_DEF)) {

        ew.origin.atom.exec(ew);
        ew.getAll().forEach(site => {

          if (site)
            renders.add(this.rendererMap.get(site));
        })
      }
    }

    const arr = Array.from(renders.values());
    let j = 0;
    let len = arr.length;
    for (j; j < len; j++) {
      arr[j].update();
    }

  }

  onKeyDown(key: any) {
    this.keysHeld.add(key.key);
  }

  onKeyUp(key: any) {
    this.keysHeld.delete(key.key);
    this.keysHeld.delete(key.key.toUpperCase());
  }

  getSiteFromCanvasXY(x: number, y: number): Site {
    x = x - this.gridOffset; //+ this.siteSize * 0.5;
    y = y - this.gridOffset; //+ this.siteSize * 0.5;

    x = (x / this.siteSize) >> 0;
    y = (y / this.siteSize) >> 0;

    return this.tile.getSiteByCoord({ row: y, col: x });
  }

  handleClick(e: interaction.InteractionEvent) {
    if (this.pointerDown && e.target) {

      let p: Point = e.data.getLocalPosition(this.pixiapp.stage);
      let site: Site = this.getSiteFromCanvasXY(p.x, p.y); //this.siteRenderers.get(e.target as Sprite);
      this.selectedSite = site;

      if (site) {
        if (this.keysHeld.has("r")) {
          site.atom = Res.CREATE();
        } else if (this.keysHeld.has("t")) {
          site.atom = new Atom(DReg.TYPE_DEF);
        } else if (this.keysHeld.has("w")) {
          site.atom = new Atom(Wall.TYPE_DEF);
        } else if (this.keysHeld.has("z")) {
          site.atom = new Atom(Mason.TYPE_DEF, [Mason.boxPath(12)]);
        } else if (this.keysHeld.has("Z")) {
          site.atom = new Atom(Mason.TYPE_DEF, [Mason.boxPath(24)]);
        } else if (this.keysHeld.has("x")) {
          site.atom = new Atom(Mason.TYPE_DEF, [Mason.linePath(48, "E")]);
        } else if (this.keysHeld.has("c")) {
          site.atom = new Atom(Mason.TYPE_DEF, [Mason.linePath(48, "S")]);
        } else if (this.keysHeld.has("e")) {
          site.atom = new Atom(Empty.TYPE_DEF);
        } else if (this.keysHeld.has("b")) {
          site.atom = new Atom(ForkBomb.TYPE_DEF);
        } else if (this.keysHeld.has("B")) {
          site.atom = new Atom(SuperForkBomb.TYPE_DEF);
        } else if (this.keysHeld.has("a")) {
          site.atom = new Atom(AntiForkBomb.TYPE_DEF);
        } else if (this.keysHeld.has("s")) {
          site.atom = new Atom(Sentry.TYPE_DEF);
        } else if (this.keysHeld.has("d")) {
          const rval = (Math.random() * 40) >> 0;
          site.atom = Data.CREATE(undefined, {
            value: rval
          });
        } else if (this.keysHeld.has("i")) {
          site.atom = new Atom(Reducer.TYPE_DEF);
        } else if (this.keysHeld.has("n")) {
          site.atom = new Atom(SwapWorm.TYPE_DEF, [7]);
        } else if (this.keysHeld.has("N")) {
          site.atom = new Atom(SwapWorm.TYPE_DEF, [16]);
        } else if (this.keysHeld.has("l")) {
          site.atom = new Atom(LoopWorm.TYPE_DEF, [7]);
        } else if (this.keysHeld.has("L")) {
          site.atom = new Atom(LoopWorm.TYPE_DEF, [16]);
        } else if (this.keysHeld.has("k")) {
          site.atom = new Atom(LoopSeed.TYPE_DEF);
        } else if (this.keysHeld.has("m")) {
          site.atom = new Atom(StickyMembrane.TYPE_DEF);
        } else if (this.keysHeld.has("u")) {
          site.atom = SortMaster.CREATE();
        } else if (this.keysHeld.has("q")) {
          console.log("DEBUG SITE:", site);
        } else if (this.keysHeld.has("C")) {
          site.atom = new Atom(Writer.TYPE_DEF, ["FIRST BE ROBUST  THEN AS CORRECT AS POSSIBLE  AND AS EFFICIENT AS NEEDED"]);
        } else if (this.keysHeld.has("1")) {
          site.atom = OnewayDoor.W_EXIT_EENT();
        } else if (this.keysHeld.has("2")) {
          site.atom = OnewayDoor.S_EXIT_NENT();
        } else if (this.keysHeld.has("3")) {
          site.atom = OnewayDoor.E_EXIT_WENT();
        } else if (this.keysHeld.has("4")) {
          site.atom = OnewayDoor.N_EXIT_SENT();
        } else if (this.keysHeld.has("5")) {
          site.atom = OnewayDoor.NE_EXIT_WENT();
        } else {

          if (this.curSelectedElement && this.curSelectedElement !== "") {
            site.atom = new Atom(ElementTypes.TYPES_MAP.get(this.curSelectedElement));
          }

        }
      }

      if (site) {
        this.rendererMap.get(site).update();
      }

    }
  }
}
