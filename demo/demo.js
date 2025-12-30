import * as Viz from "https://esm.run/@viz-js/viz";
import {  RuleParser,traceToDot } from "./rulez.js";
document.getElementById("run").addEventListener("click", () => {
  const parser = new RuleParser();
  const engine = parser.parse(
    JSON.parse(document.getElementById("ruleTable").value)
  );
  var res1 = engine.evaluate(
    JSON.parse(document.getElementById("ruleInput").value)
  );
  document.getElementById("ruleResult").value = JSON.stringify(
    res1.fact,
    null,
    4
  );
  document.getElementById("ruleTrace").value = JSON.stringify(
    res1.trace,
    null,
    4
  );
  const el = document.getElementById("diagram");
  var dia_code = traceToDot(res1.trace);
  console.log(dia_code);
  Viz.instance().then((viz) => {
    el.appendChild(viz.renderSVGElement(dia_code));
  });
});
