import { EventWindow } from "../Eventwindow";
import { Elem } from "../Elem";
import { ElementTypes, IElementType } from "../ElementTypes";
import { Site } from "../Site";
import { EmptyElement } from "./EmptyElement";
import { Atom } from "../Atom";
import { LinkedListElement } from "./LinkedListElement";
import { MFMUtils } from "../../utils/utils";

export class LoopWormElement extends LinkedListElement {

  pCHANCE_TO_EAT: number = 500;
  WORMSIZE: number;
  birthCount: number;
  isConnected: boolean = false;
  idleCount: number = 0;

  expandCount: number = 0;

  constructor(size: number = 4, prev: number = undefined, next: number = undefined) {

    super(ElementTypes.LOOPWORM, prev, next);
    this.birthCount = this.WORMSIZE = size;

  }

  isStuck(ew: EventWindow): boolean {

    const compareMap = new Map<number, IElementType>();
    compareMap.set(1, ElementTypes.EMPTY);
    compareMap.set(2, ElementTypes.EMPTY);
    compareMap.set(3, ElementTypes.EMPTY);
    compareMap.set(4, ElementTypes.EMPTY);

    return ew.windowNotCompare(compareMap);

  }

  connectToTail(ew: EventWindow) {

    let choices: number[] = EventWindow.ADJACENT4WAY;
    let relativeSiteToGo: number = choices[Math.random() * choices.length >> 0];
    let possibleTail: Site = this.getSiteDirection(ew, relativeSiteToGo);

    if (possibleTail && possibleTail.atom.type === ElementTypes.LOOPWORM) {
      const pt: LinkedListElement = (possibleTail.atom.elem as LinkedListElement);

      if (pt && pt.isAtTail()) {
        console.log("CONNECTED TAIL!!");
        this.prev = relativeSiteToGo;
        pt.next = this.oppositeDirection(relativeSiteToGo);
        this.isConnected = true;
      }
    }

  }

  connectToHead(ew: EventWindow) {

    let choices: number[] = EventWindow.ADJACENT4WAY;
    let relativeSiteToGo: number = choices[Math.random() * choices.length >> 0];
    let possibleHead: Site = this.getSiteDirection(ew, relativeSiteToGo);

    if (possibleHead && possibleHead.atom.type === ElementTypes.LOOPWORM) {
      const pt: LinkedListElement = (possibleHead.atom.elem as LinkedListElement);

      if (pt && pt.isAtHead()) {
        console.log("CONNECTED HEAD!!");
        this.prev = relativeSiteToGo;
        pt.next = this.oppositeDirection(relativeSiteToGo);
        this.isConnected = true;
      }
    }

  }

  checkConditionsForFiller(ew: EventWindow): boolean {

    const compareMap = new Map<number, IElementType>();
    compareMap.set(2, ElementTypes.EMPTY);
    compareMap.set(13, ElementTypes.LOOPWORM);
    compareMap.set(19, ElementTypes.LOOPWORM);
    compareMap.set(25, ElementTypes.LOOPWORM);
    compareMap.set(27, ElementTypes.LOOPWORM);
    compareMap.set(22, ElementTypes.LOOPWORM);

    const notCompareMap = new Map<number, IElementType>();
    notCompareMap.set(14, ElementTypes.LOOPWORM);
    notCompareMap.set(20, ElementTypes.LOOPWORM);
    notCompareMap.set(23, ElementTypes.LOOPWORM);


    return ew.windowCompare(compareMap) && ew.windowNotCompare(notCompareMap);
  }

  eatLostNodes(ew: EventWindow) {

    let possibleLostNodes: Site[] = ew.getSites(EventWindow.ADJACENT8WAY, ElementTypes.LOOPWORM);

    possibleLostNodes = possibleLostNodes.filter(site => {
      return (
        site
        && (site.atom.elem as LoopWormElement).next
        && (site.atom.elem as LoopWormElement).prev
      );
    });

    if (possibleLostNodes.length) {
      possibleLostNodes.forEach(site => {
        ew.origin.killAtom(site);
      })
    }

  }


  exec(ew: EventWindow) {


    let choices: number[];
    let leavingAtom: Atom;
    let relativeSiteToGoTo: number;


    if (this.birthCount > 0) {

      //BE BORN
      choices = EventWindow.ADJACENT4WAY;
      relativeSiteToGoTo = choices[Math.random() * choices.length >> 0];
      leavingAtom = new Atom(ElementTypes.LOOPWORM, [0, relativeSiteToGoTo, this.next]);

      const moved: boolean = this.moveTo(ew, relativeSiteToGoTo, leavingAtom);

      if (moved) {
        this.birthCount--;
      }

      if (this.isStuck(ew)) {
        this.idleCount++;
      } else {
        this.idleCount = 0;
      }

      if (this.idleCount > 100) {
        this.shouldDie = true;
      }



    } else if (this.isConnected) {

      //check that our next and prev are actually loopworms, otherwise, we diconnected somewhere!
      if (!(this.getPrevElement(ew) instanceof LinkedListElement) && !(this.getNextElement(ew) instanceof LinkedListElement)) {
        console.log("disconnected");
        ew.origin.killSelf();
        return;
      }

      //we disconnected... try to reconnect!
      // if (!(this.getPrevElement(ew) instanceof LoopWormElement)) {
      //   //this.isConnected = false;
      //   this.prev = undefined;
      //   this.connectToTail(ew);
      // }

      // if (!(this.getNextElement(ew) instanceof LoopWormElement)) {
      //   //this.isConnected = false;
      //   this.next = undefined;
      //   this.connectToHead(ew);
      // }

      //console.log("is connected");
      const nextEl: LoopWormElement = (this.getNextElement(ew) as LoopWormElement);
      if (nextEl) {
        nextEl.isConnected = true;
      }

      if (this.isSwapping) {
        this.isSwapping = false;
      } else {

        // if (this.checkConditionsForFiller(ew)) {
        //   //ew.origin.mutateSite(ew.getSiteByIndex(2), new Atom(ElementTypes.RES));
        // } 

        if (MFMUtils.oneIn(this.pCHANCE_TO_EAT)) {
          let possibleRes = ew.getAdjacent4Way(ElementTypes.RES);

          if (possibleRes) {
            possibleRes.killSelf();
            this.expandCount++;
            //console.log("ate a res");
          }
        }


        let choices: number[] = EventWindow.ADJACENT4WAY;
        let relativeSiteToGo: number = choices[Math.random() * choices.length >> 0];

        if (this.expandCount > 0 && Math.random() < 0.1) {

          //console.log("time to grow")
          const leavingAtom: Atom = new Atom(ElementTypes.LOOPWORM, [0, relativeSiteToGo, this.next]);
          (leavingAtom.elem as LoopWormElement).isConnected = true;
          const moved = this.moveTo(ew, relativeSiteToGo, leavingAtom, 8);

          if (moved) {
            this.expandCount--;
          }

        } else {

          this.moveTo(ew, relativeSiteToGo, undefined, 8);
        }
      }

      //this.eatLostNodes(ew);

    } else if (this.isAtHead() && this.getNextElement(ew) && !this.getNextElement(ew).isSwapping) {

      //MAKE SWAPPER
      choices = EventWindow.ADJACENT4WAY;
      relativeSiteToGoTo = choices[Math.random() * choices.length >> 0];
      leavingAtom = new Atom(ElementTypes.LOOPWORM, [0, relativeSiteToGoTo, this.next]);
      (leavingAtom.elem as LinkedListElement).isSwapping = true;

      const moved: boolean = this.moveTo(ew, relativeSiteToGoTo, leavingAtom);

      this.connectToTail(ew);

      if (this.isStuck(ew)) {
        this.idleCount++;
      } else {
        this.idleCount = 0;
      }

      if (this.idleCount > 100) {
        this.shouldDie = true;
      }

    }

    super.exec(ew);
  }
}
