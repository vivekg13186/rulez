import { RuleParser, traceToDot } from "./rulez.js";
import fs from "fs";

const raw = fs.readFileSync("./data.json", "utf-8");
const rules = JSON.parse(raw);

function withoutcache() {
  const parser = new RuleParser();
  console.time("parseTime");
  const engine = parser.parse(rules);
  engine.enableCache=true;
  console.timeEnd("parseTime");
  const fact1 = {
    C1: false,
    C2: false,
    C3: "Low",
    C4: "Low",
    C5: false,
    C6: false,
    C7: false,
    C8: false,
    C9: "Low",
    C10: "Low",
  };
  for(var i=0;i<100;i++){
    console.time("eval-"+i);
    engine.evaluate(fact1);
    console.timeEnd("eval-"+i);
  }
  
   
}

function withcache() {
  console.log("With cache");
  const parser = new RuleParser();
  console.time("parseTime");
  const engine = parser.parse(rules);
  console.timeEnd("parseTime");
  const fact1 = {
    C1: false,
    C2: false,
    C3: "Low",
    C4: "Low",
    C5: false,
    C6: false,
    C7: false,
    C8: false,
    C9: "Low",
    C10: "Low",
  };
   for(var i=0;i<100;i++){
    console.time("eval-"+i);
    engine.evaluate(fact1);
    console.timeEnd("eval-"+i);
  }
}
 
withoutcache();
withcache();

