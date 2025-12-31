

function test1() {
  const rules = [
    ["age", "country", "@status"],
    ["> 18", "'US'", "adult-us"],
    ["> 65", "'US'", "senior-us"],
    ["> 18", "'CA'", "adult-ca"],
  ];
  const parser = new RuleParser();
  const engine = parser.parse(rules);

  const fact1 = { age: 20, country: "US" };
  var res1 = engine.evaluate(fact1);
  console.log(res1);
  // { age: 20, country: "US", status: "adult-us" }

  const fact2 = { age: 70, country: "US" };
  var res2 = engine.evaluate(fact2);
  console.log(res2);
  // { age: 70, country: "US", status: "senior-us" }

  const fact3 = { age: 25, country: "CA" };
  var res3 = engine.evaluate(fact3);
  console.log(res3);
  // { age: 25, country: "CA", status: "adult-ca" }
}

test1();

function test2() {
  const rules = [
    ["age", "name", "@segment"],

    [".. 18,65", "=~ 'Jo*'", "working-jo"],
    [">= 65", "=~ *son", "senior-son"],
    ["< 18", "=~ *", "minor"],
  ];
  var parse = new RuleParser();
  const engine = parse.parse(rules);
  var result = engine.evaluate({ age: 30, name: "John" });
  // → { age: 30, name: "John", segment: "working-jo" }
  console.log(result);

  var resutl2 = engine.evaluate({ age: 70, name: "Anderson" });
  // → { age: 70, name: "Anderson", segment: "senior-son" }
  console.log(resutl2);
}

test2();
