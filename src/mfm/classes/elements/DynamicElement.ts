import { EventWindow } from "../Eventwindow";
import { Elem } from "../Elem";
import { ElementTypes, IElementType } from "../ElementTypes";
import { Atom } from "../Atom";

export class Probability {

  chance: number;

  constructor(chance: number) {
    this.chance = chance;
  }

  roll(): boolean {
    return Probability.oneIn(this.chance);
  }

  static oneIn(chance: number): boolean {
    return ((Math.random() * chance) < 1);
  }
}


export class Condition {

  name: string;
  targetSet: number[];
  quantifier: number;
  isCompare: boolean;
  checkType: IElementType;

  constructor(name: string) {
    this.name = name;
  }

  parse(conditionString: string) {

    try {
      conditionString = this.removeDuplicateSpaces(conditionString);

      let [quantifier, of, targetSet, isCompare, checkType] = conditionString.split(" ");

      console.log("CONDITION PARSE", quantifier, of, targetSet, isCompare, checkType);

      this.targetSet = this.parseIndexSet(targetSet);
      this.quantifier = this.parseQuantifier(quantifier, this.targetSet.length);
      this.isCompare = (isCompare.indexOf("not") !== -1) ? false : true;
      this.checkType = ElementTypes.TYPES_MAP.get(checkType.toUpperCase());

      if (!this.checkType) {
        throw (`TYPE: "${checkType}" in CONDITION NOT FOUND IN THIS UNIVERSE`);
      }

    } catch (e) {
      console.log(e);
    }

  }

  private parseIndexSet(set: string): number[] {
    return set.slice(1, set.length - 1).split(",").map(i => parseInt(i));
  }

  private parseQuantifier(q: string, max: number): number {
    if (q.indexOf("all") !== -1) {
      return max;
    }

    return parseInt(q);
  }

  private removeDuplicateSpaces(str: string): string {
    return str.replace(/\s+/g, ' ').trim();
  }

  evaluate(ew: EventWindow): number[] {

    const resultSites = ew.getIndexes(this.targetSet, this.checkType, false);

    if (this.isCompare === true) {

      //matched the is compare
      if (resultSites.length >= this.quantifier) {
        return resultSites;
      }

    } else {

      //matched the isnot compare
      if (resultSites.length < this.quantifier) {
        return resultSites;
      }
    }

    return undefined;

  }
}

export class Action {

  name: string;
  probability: Probability;
  actionType: string;
  targetIndexes: number[];
  useResults: boolean;
  leavingType: IElementType
  fromIndexes: number[];

  constructor(name: string) {
    this.name = name;
  }

  parse(actionString: string) {



    const [probability, chanceto, action, targets, fromIndexes] = actionString.split(" ");

    console.log("ACTION PARSE", probability, chanceto, action, targets, fromIndexes);

    this.probability = new Probability(this.parseProbability(probability));

    if (targets.toUpperCase().indexOf("RESULTS") !== -1) {
      this.useResults = true;
    } else {
      this.useResults = false;
      this.targetIndexes = this.parseIndexSet(targets);
    }

    if (fromIndexes) {

      if (fromIndexes.indexOf("[") === -1) {
        this.leavingType = ElementTypes.TYPES_MAP.get(fromIndexes);
      } else {
        this.fromIndexes = this.parseIndexSet(fromIndexes);
      }

    }

    this.actionType = action.toUpperCase();

  }

  private parseIndexSet(set: string): number[] {
    return set.slice(1, set.length - 1).split(",").map(i => parseInt(i));
  }

  private parseProbability(pstr: string): number {
    const [den, num] = pstr.split("in").map(n => parseInt(n));
    return num / den;
  }

  private removeDuplicateSpaces(str: string): string {
    return str.replace(/\s+/g, ' ').trim();
  }

  exec(ew: EventWindow, conditionResult: number[]): boolean {

    if (!this.probability.roll()) {
      return false;
    }

    let success: boolean = true;

    if (this.useResults) {
      this.targetIndexes = conditionResult;
    }

    const target: number = this.targetIndexes[Math.floor(Math.random() * this.targetIndexes.length)];

    let fromIndex: number;
    if (this.fromIndexes) {
      fromIndex = this.fromIndexes[Math.floor(Math.random() * this.fromIndexes.length)];
    }

    this.leavingType = this.leavingType ? this.leavingType : ElementTypes.EMPTY;

    switch (this.actionType) {

      case "CREATE":
        console.log("create", target, this.leavingType.name);
        success = ew.mutate(target, new Atom(this.leavingType));
        break;
      case "MOVE":
        success = ew.move(target, new Atom(this.leavingType), fromIndex);
        break;
      case "SWAP":
        success = ew.swap(target, fromIndex);
        break;
      case "DESTROY":
        success = ew.destroy(target);
        break;
      case "DONE":
      case "STOP":
      case "END":
        break;
    }

    return success;

  }

  oneOf(ew: EventWindow): number {
    return ew.getRandomIndex(this.targetIndexes);
  }

}

export class Decision {

  name: string;
  condition: Condition;
  action: Action;

  constructor(name: string) {
    this.name = name;
  }

  parse(decisionString: string) {

    const [conditionStr, actionStr] = decisionString.split(":");

    this.condition = new Condition("c");
    this.condition.parse(conditionStr);

    this.action = new Action("a");
    this.action.parse(actionStr);

  }

  decide(ew: EventWindow): boolean {

    const resultSet: number[] = this.condition.evaluate(ew);

    //console.log("results: ", resultSet);

    if (resultSet) {
      return this.action.exec(ew, resultSet);
    }

    return false;

  }

}

export class ThoughtProcess {

  processText: string;
  decisions: Decision[];

  constructor() {

    this.decisions = new Array<Decision>();
  }

  parse(processText: string) {

    console.log(processText);
    this.processText = processText;

    const allDecisions = this.processText.split("/");

    allDecisions.forEach(decision => {

      const d: Decision = new Decision("D");
      d.parse(decision);
      this.decisions.push(d);

    })


  }

  exec(ew: EventWindow) {

    let keepGoing: boolean = true;

    this.decisions.forEach(d => {
      keepGoing = d.decide(ew);

      if (!keepGoing) {
        return;
      }
    })

  }
}

export class DynamicElement extends Elem {

  process: ThoughtProcess;
  state: number;

  constructor(elementMarkup: string) {

    super(ElementTypes.DYNAMICELEMENT.name, ElementTypes.DYNAMICELEMENT.type);

    console.log("this is the markup:", elementMarkup);
    this.state = 0;
    this.process = new ThoughtProcess();
    this.process.parse(elementMarkup);

  }
  exec(ew: EventWindow) {

    this.process.exec(ew);
    super.exec(ew);
  }
}

/*

1 of [1,2,3,4] is EMPTY:1in10 chanceto move [RESULTS] [0]

1 of [1,2,3,4] is EMPTY:1in10 chanceto create [RESULTS] RES
1 of [1,2,3,4] is EMPTY:1in1 chanceto move [RESULTS] [0] / all of [1,2,3,4] is DYNAMICELEMENT:1in1 chanceto destroy [0]

1 of [1,2,3,4] is EMPTY:1in1 chanceto move [RESULTS] [0] / all of [7,8,12] is DYNAMICELEMENT:1in1 chanceto create [4] RES / 1 of [1] is RES:1in2 chanceto destroy [4]
1 of [1,2,3,4,5,6,7,8] is WALL:1in1 chanceto destroy [RESULTS]
*/