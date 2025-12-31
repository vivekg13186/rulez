import { expect, test } from "vitest";
import { RuleParser } from "./rulez.js";

test("operator .. test", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    [".. 2,13", "between1"],
    [".. 20,33", "between2"],
  ]);
  expect(engine.evaluate({ a: 10 }).fact).toStrictEqual({
    a: 10,
    b: "between1",
  });
  expect(engine.evaluate({ a: 21 }).fact).toStrictEqual({
    a: 21,
    b: "between2",
  });
});

test("operator =~ test", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    ["=~ 'h?llo'", "hello"],
    ["=~ 'w?lc*e'", "welcome"],
  ]);
  expect(engine.evaluate({ a: "hello" }).fact).toStrictEqual({
    a: "hello",
    b: "hello",
  });
  expect(engine.evaluate({ a: "welcome" }).fact).toStrictEqual({
    a: "welcome",
    b: "welcome",
  });
});

test("operator > test", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    ["> 10", "gt 10"],
    ["> 20", "gt 20"],
  ]);
  expect(engine.evaluate({ a: 11 }).fact).toStrictEqual({ a: 11, b: "gt 10" });
  expect(engine.evaluate({ a: 30 }).fact).toStrictEqual({ a: 30, b: "gt 20" });
});
test("operator < test", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    ["< 20", "lt 20"],
  ]);
  expect(engine.evaluate({ a: 10 }).fact).toStrictEqual({ a: 10, b: "lt 20" });
});
test("operator <= test", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    ["<= 20", "lte 20"],
  ]);
  expect(engine.evaluate({ a: 20 }).fact).toStrictEqual({ a: 20, b: "lte 20" });
});
test("operator >= test", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    [">= 20", "lte 20"],
  ]);
  expect(engine.evaluate({ a: 20 }).fact).toStrictEqual({ a: 20, b: "lte 20" });
});
test("operator != test", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    ["!= 20", "nte 20"],
  ]);
  expect(engine.evaluate({ a: 21 }).fact).toStrictEqual({ a: 21, b: "nte 20" });
});

test("operator = test", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    ["= 20", "number"],
  ]);
  expect(engine.evaluate({ a: 20 }).fact).toStrictEqual({ a: 20, b: "number" });
});

test("operator boolean constant", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    ['true', true],
    ['false', false],
  ]);
  expect(engine.evaluate({ a: true }).fact).toStrictEqual({ a: true, b: true });
  expect(engine.evaluate({ a: false }).fact).toStrictEqual({
    a: false,
    b: false,
  });
});

test("operator string constant", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    ["'hello'", "hellob"],
  ]);
  expect(engine.evaluate({ a: "hello" }).fact).toStrictEqual({
    a: "hello",
    b: "hellob",
  });
});
test("operator number constant", () => {
  var engine = new RuleParser().parse([
    ["a", "@b"],
    ['22.3', "22.3"],
  ]);
  expect(engine.evaluate({ a: 22.3 }).fact).toStrictEqual({
    a: 22.3,
    b: "22.3",
  });
});
