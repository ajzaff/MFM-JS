/// <reference path="./../../node_modules/@types/pixi.js/index.d.ts" />

import * as PIXI from "pixi.js";
import { IElementType, ElementTypes } from "../mfm/classes/ElementTypes";
import { Tile } from "../mfm/classes/Tile";
import { MFMUtils } from "../mfm/utils/utils";
import { EventWindow } from "../mfm/classes/Eventwindow";
import { Site } from "../mfm/classes/Site";
import { SiteRenderer } from "./SiteRenderer";
import { Atom } from "../mfm/classes/Atom";
import { MasonElement } from "../mfm/classes/elements/MasonElement";

export class MFMRenderer {
  selectedSite: Site;
  timeSpeed: Number = 5000;
  siteSize: number = 16;
  siteSpacing: number = 0;
  gridOffset: number = 14;
  srContainer: PIXI.Container = new PIXI.Container();
  siteRenderers: Map<PIXI.Sprite, SiteRenderer> = new Map<PIXI.Sprite, SiteRenderer>();
  rendererMap: Map<Site, SiteRenderer> = new Map<Site, SiteRenderer>();
  container: Element;
  keysHeld: Set<string>;
  pointerDown: boolean = false;

  tile: Tile;

  pixiapp: PIXI.Application;

  constructor(_tile: Tile, _container: Element) {
    this.tile = _tile;
    this.container = _container;

    this.init();
  }

  init() {
    this.keysHeld = new Set<string>();

    this.pixiapp = new PIXI.Application({
      width: 800,
      height: 800,
      antialias: false,
      transparent: false,
      resolution: 1
    });

    this.srContainer.x = this.gridOffset;
    this.srContainer.y = this.gridOffset;
    this.pixiapp.stage.addChild(this.srContainer);

    document.addEventListener("keydown", (key: any) => {
      this.onKeyDown(key);
    });
    document.addEventListener("keyup", (key: any) => {
      this.onKeyUp(key);
    });

    this.initSites();

    this.pixiapp.ticker.add((delta: number) => this.gameLoop(delta));
    this.container.appendChild(this.pixiapp.view);
  }

  initSites() {
    let sitesArray: Site[] = Array.from(this.tile.sites.values());
    let siteLen: number = sitesArray.length;
    let site: Site;

    for (let i = 0; i < siteLen; i++) {
      site = sitesArray[i];
      let sr: SiteRenderer = new SiteRenderer(site, this.siteSize, this.siteSpacing);
      sr.visual.on(
        "click",
        (e: PIXI.interaction.InteractionEvent) => {
          this.pointerDown = true;
          this.handleClick(e);
          this.pointerDown = false;
        },
        this
      );
      sr.visual.on("pointerdown", () => {
        this.pointerDown = true;
      });

      sr.visual.on("pointerup", () => {
        this.pointerDown = false;
      });

      sr.visual.on("pointermove", this.handleClick, this);
      this.srContainer.addChild(sr.visual);
      this.siteRenderers.set(sr.visual, sr);
      this.rendererMap.set(site, sr);
    }
  }

  gameLoop(delta: number) {
    let ew: EventWindow;

    for (var i = 0; i < this.timeSpeed; i++) {
      ew = MFMUtils.GenerateEventWindow(this.tile, this.tile.width, this.tile.height);

      if (ew.window) {
        ew.origin.atom.exec(ew);

        //ends up being slower as elements populate the board
        // ew.getAll().forEach(site => {
        //   this.rendererMap.get(site).update();
        // });
      }
    }

    Array.from(this.siteRenderers.values()).forEach(sr => {
      sr.update();
    });
  }

  onKeyDown(key: any) {
    this.keysHeld.add(key.key);
  }

  onKeyUp(key: any) {
    this.keysHeld.delete(key.key);
  }

  handleClick(e: PIXI.interaction.InteractionEvent) {
    if (this.pointerDown && e.target) {
      let sr: SiteRenderer = this.siteRenderers.get(e.target as PIXI.Sprite);
      let site: Site = sr.site;
      this.selectedSite = site;

      if (site) {
        if (this.keysHeld.has("r")) {
          site.atom = new Atom(ElementTypes.RES);
        } else if (this.keysHeld.has("w")) {
          site.atom = new Atom(ElementTypes.WALL);
        } else if (this.keysHeld.has("z")) {
          site.atom = new Atom(ElementTypes.MASON, [MasonElement.boxPath(12)]);
        } else if (this.keysHeld.has("Z")) {
          site.atom = new Atom(ElementTypes.MASON, [MasonElement.boxPath(24)]);
        } else if (this.keysHeld.has("x")) {
          site.atom = new Atom(ElementTypes.MASON, [MasonElement.linePath(48, "E")]);
        } else if (this.keysHeld.has("c")) {
          site.atom = new Atom(ElementTypes.MASON, [MasonElement.linePath(48, "S")]);
        } else if (this.keysHeld.has("e")) {
          site.atom = new Atom(ElementTypes.EMPTY);
        } else if (this.keysHeld.has("b")) {
          site.atom = new Atom(ElementTypes.FORK_BOMB);
        } else if (this.keysHeld.has("a")) {
          site.atom = new Atom(ElementTypes.ANTI_FORK_BOMB);
        } else if (this.keysHeld.has("s")) {
          site.atom = new Atom(ElementTypes.SENTRY);
        } else if (this.keysHeld.has("p")) {
          site.atom = new Atom(ElementTypes.SEEKER, [{ row: 0, col: 0 }]);
        } else if (this.keysHeld.has("d")) {
          site.atom = new Atom(ElementTypes.DATA, undefined, {
            value: (Math.random() * 10) >> 0
          });
        } else if (this.keysHeld.has("u")) {
          site.atom = new Atom(ElementTypes.UBER, [{ row: 0, col: 0 }, { row: 40, col: 40 }]);
        } else if (this.keysHeld.has("t")) {
          site.atom = new Atom(ElementTypes.REDUCER);
        } else {
          site.atom = new Atom(ElementTypes.DREG);
        }
      }

      sr.update();
    }
  }
}
