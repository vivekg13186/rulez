import {  RuleParser,traceToDot } from "./rulez.js";
import fs from 'fs';

const raw = fs.readFileSync('./data.json', 'utf-8');
const rules = JSON.parse(raw);


const parser = new RuleParser();
console.time('parseTime');
const engine = parser.parse(rules);
console.timeEnd('parseTime');
const fact1 = { "C1" :false ,"C2" :false ,"C3" :"Low","C4" :"Low","C5":false ,"C6":false ,"C7":false ,"C8":false ,"C9":"Low","C10":"Low"};
console.time('eval1');
var res1 = engine.evaluate(fact1);
console.timeEnd('eval1');
console.time('eval2');
var res2 = engine.evaluate(fact1);
console.timeEnd('eval2');
console.time('eval3');
var res3 = engine.evaluate(fact1);
console.timeEnd('eval3');
console.time('eval4');
var res4 = engine.evaluate(fact1);
console.timeEnd('eval4');
/*console.log(res1.fact);
console.log(res2.fact);
console.log(res4.fact);*/