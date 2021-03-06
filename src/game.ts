import { Tile } from "./mfm/core/Tile";
import { MFMRenderer } from "./renderer/MFMRenderer";
import { ElementIncludes } from "./mfm/ElementIncludes";
import { loadLevel, Levels, EndScreen, StartScreen } from "./mfm/elements/game/Levels";
import { Goal } from "./mfm/elements/game/Goal";
import { MembraneWall } from "./mfm/elements/MembraneWallElement";
import { Site } from "./mfm/core/Site";
import { Enemy } from "./mfm/elements/game/Enemy";
import { Player } from "./mfm/elements/game/Player";
import { Clearer } from "./mfm/elements/game/Clearer";

import { PlayerEmitter } from "./mfm/elements/game/PlayerEmitter";
import { FlyingEnemy } from "./mfm/elements/game/FlyingEnemy";
import { Wall } from "./mfm/elements/WallElement";
import { Dirt } from "./mfm/elements/game/Dirt";

declare var Vue: any;
declare var Howl: any;

let app = new Vue({
  el: "#game",
  data: function () {
    return {
      gridSize: "128x64" as string,
      timeSpeed: 8000 as number,
      tenex: false as boolean,
      g: undefined as Tile,
      mfmRenderer: MFMRenderer,
      customSequence: "" as string,
      curSelectedElement: "" as string,
      curSelectedFunc: undefined as Function,
      shouldRender: true as boolean,
      fullScreenMode: false as boolean,
      currentLevel: 0 as number,
      gameLoopInterval: undefined as number,
      totalScore: 0 as number,
      isStarted: false as boolean,
      allDone: false as boolean,
      isCountdown: false as boolean,
      countDownEnded: false as boolean,
      countdownTimer: 0 as number,
      isDebug: false as boolean,
      backgroundMusic: undefined as any,
      endingMusic: undefined as any,
      levelEndSound: new Howl({
        src: ["/gameFiles/levelend.mp3"],
        autoplay: false,
        loop: false,
        volume: 0.08,
      }),
      clockTick: new Howl({
        src: ["/gameFiles/tick.wav"],
        autoplay: false,
        loop: false,
        volume: 0.1,
      }),
    };
  },
  mounted() {
    const params = this.getParams(window.location.href);
    if (params.fullscreen) {
      this.fullScreenMode = true;
    }

    if (params.debug) {
      this.isDebug = true;
    }

    this.backgroundMusic = new Howl({
      src: ["/gameFiles/Dreaming.ogg"],
      autoplay: true,
      loop: true,
      volume: 0.2,
    });

    this.backgroundMusic.play();

    this.initTile();
  },
  methods: {
    initTile() {
      this.g = new Tile(this.gridCols, this.gridRows);
      if (this.isDebug) {
        this.mfmRenderer = new MFMRenderer(this.g, document.querySelector("#mfm"), 1600, 800, true);
      } else {
        this.mfmRenderer = new MFMRenderer(this.g, document.querySelector("#mfm"), 1600, 800, false);
      }

      this.mfmRenderer.timeSpeed = this.timeSpeed ? this.timeSpeed : 5000;
      this.curSelectedElement = this.curSelectedElement ? this.curSelectedElement : "Enemy";
      this.curSelectedFunc = this.curSelectedFunc ? this.curSelectedFunc : Enemy.CREATE;
      this.selectElement(this.curSelectedElement, this.curSelectedFunc);

      this.loadStartScreen();
    },

    startGame() {
      this.isStarted = true;
      this.levelEnded();
    },
    startGameLoop() {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = setInterval(this.gameLoop, 100);
    },

    ///COUNTDOWN

    startCountdown() {
      console.log("start countdown");
      if (this.isCountdown && !this.countdownEnded) {
        this.countdownTimer = 30;
        this.tickCountdown();
      }
    },
    tickCountdown() {
      console.log("tick countdown");

      this.countdownTimer -= 1;
      if (this.isCountdown && this.countdownTimer > 0) {
        if (this.countdownTimer < 10) {
          this.clockTick.play();
        }
        setTimeout(this.tickCountdown, 1000);
      }
    },

    loadLevel() {
      const levelData = Levels[this.currentLevel];
      loadLevel(this.g, levelData);
    },

    loadStartScreen() {
      loadLevel(this.g, StartScreen);
    },

    loadEndScreen() {
      this.backgroundMusic.fade(0.3, 0, 1500);
      setTimeout(() => {
        this.backgroundMusic = new Howl({
          src: ["/gameFiles/VoicesFromHeaven.ogg"],
          autoplay: true,
          loop: true,
          volume: 0.2,
        });
        this.backgroundMusic.play();
      }, 1500);

      loadLevel(this.g, EndScreen);
    },
    outputWalls() {
      let atoms: any[] = [];

      const tile = this.g as Tile;
      tile.sites.forEach((s) => {
        switch (s.atom?.type) {
          case Dirt.BASE_TYPE:
          case Wall.BASE_TYPE:
          case MembraneWall.BASE_TYPE:
          case Enemy.BASE_TYPE:
          case FlyingEnemy.BASE_TYPE:
          case PlayerEmitter.BASE_TYPE:
          case Goal.BASE_TYPE:
            atoms.push({
              e: s.atom.type.name,
              gp: s.tilePos,
            });
            break;
        }
      });

      console.log(JSON.stringify(atoms));
    },
    levelIsDone(): boolean {
      const tile = this.g as Tile;
      let isDone = true;

      if (this.isCountdown && this.countdownTimer <= 0) {
        return true;
      }

      tile.sites.forEach((s) => {
        if (s.atom.is(Player.BASE_TYPE) || s.atom.is(PlayerEmitter.BASE_TYPE)) {
          isDone = false;
        }

        if (!this.countDownEnded && !this.isCountdown && s.atom.is(Goal.BASE_TYPE) && (s.atom.elem as Goal).rescued > 0) {
          this.isCountdown = true;
          this.startCountdown();
        }
      });

      return isDone;
    },

    levelEnded() {
      this.levelEndSound.play();

      let goalCount = 0;
      const tile = this.g as Tile;

      this.countDownEnded = false;
      this.isCountdown = false;
      clearInterval(this.gameLoopInterval);

      tile.sites.forEach((s: Site) => {
        if (s.atom.is(Goal.BASE_TYPE)) {
          goalCount += (s.atom.elem as Goal).rescued;
        }
      });

      tile.getRandomSite().atom = Clearer.CREATE();

      if (goalCount > 0) {
        this.totalScore += goalCount;

        if (this.currentLevel < Levels.length - 1) {
          this.currentLevel++;
        } else {
          this.allDone = true;
        }
      } else {
        // if( this.currentLevel > 0 ) {
        //   this.currentLevel--;
        // }
      }

      const waitInterval: any = setInterval(() => {
        let stillClearing: boolean = false;
        tile.sites.forEach((s: Site) => {
          if (s.atom.is(Clearer.BASE_TYPE)) {
            stillClearing = true;
          }
        });

        if (!stillClearing) {
          if (!this.allDone) {
            clearInterval(waitInterval);
            this.loadLevel();
            this.startGameLoop();
          } else {
            //ALL DONE
            clearInterval(waitInterval);
            this.loadEndScreen();
          }
        }
      }, 100);
    },

    gameLoop() {
      if (this.levelIsDone()) {
        console.log("END");
        this.levelEnded();
      }
    },

    turnLeft() {
      const tile = this.g as Tile;
      tile.sites.forEach((s) => {
        if (s.atom?.is(Player.BASE_TYPE)) {
          (s.atom.elem as Player).slightLeft();
        }
      });
    },

    turnRight() {
      const tile = this.g as Tile;
      tile.sites.forEach((s) => {
        if (s.atom?.is(Player.BASE_TYPE)) {
          (s.atom.elem as Player).slightRight();
        }
        // else if(s.atom?.is( SwapWorm.BASE_TYPE && (s.atom.elem as SwapWorm).isAtHead()) {
        //   (s.atom.elem as SwapWorm).slightRight();
        // }
      });
    },

    selectElement(name: string, func: Function) {
      this.curSelectedElement = name;
      this.curSelectedFunc = func;
      this.mfmRenderer.curSelectedElement = this.curSelectedElement;
      this.mfmRenderer.curSelectedElementFunction = this.curSelectedFunc;
    },
    reload() {
      // this.mfmRenderer.deconstruct();
      // this.initTile();
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
    actualLevel() {
      return this.currentLevel + 1;
    },
    totalLevels() {
      return Levels.length;
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
  },
});
