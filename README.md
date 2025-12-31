# Rulez

**Rulez** is a lightweight, compact rule engine that runs directly in the browser. It allows you to define and execute rules on client-side applications without any dependencies. Perfect for complex screens where dynamic rule evaluation is required.

## Objective

The goal of Rulez is to provide a simple, fast, and extensible rule engine that can be embedded in browser applications. It supports JSON-style rule definitions and provides tracing capabilities to debug rule execution.

## Features

- Single JavaScript file — easy to include in any project  
- No external dependencies  
- Rete-like rule structure for flexibility  
- Rule caching for better performance  
- JSON-style rule input (no custom DSL required)  
- Lightweight and easy to understand  
- Execution tracing to visualize steps  
- Easily extendable for custom logic  

## Installation

Simply include `rulez.js` in your project:

```html
<script type="module" src="rulez.js"></script>
```

Or import it in your JavaScript/TypeScript project:

```js
import { RuleParser, traceToDot } from "./rulez.js";
```

## Usage

Here is a minimal example:

```js
import { RuleParser, traceToDot } from "./rulez.js";

const rules = [
  ["age", "country", "@status"],
  ["> 18", "US", "adult-us"],
  ["> 65", "US", "senior-us"],
  ["> 18", "CA", "adult-ca"],
];

const parser = new RuleParser();
const engine = parser.parse(rules);

const fact1 = { age: 20, country: "US" };
const res1 = engine.evaluate(fact1);

console.log(res1.fact);  // Resulting fact after rule evaluation
console.log(res1.trace); // Trace of executed rules
```

Check out `demo.html` in the `demo` folder for a live example.

## Rule JSON Format

The first line represents the header columns: the name of the field.  
If this is an output field, prefix the name with `@`.

The following rows represent conditions. Each cell contains a condition expression as follows:

- **Operator with argument:** `op arg` like `> 12`, `<= 12`, `=~ v*k`  ,`.. 23 45`
- **Value only:** like `USD`, `true`, `12` — this is treated as an equality (`=`) operator  
- **null:** the condition is ignored  

Example:

```json
[
  ["age", "country", "married", "@status"],
  ["> 18", "=~ U*", true, "adult-us"],
  ["> 65", "US", false, "senior-us"],
  ["> 18", "CA", null, "adult-ca"]
]
```

## Priority

If multiple row conditions match, they are executed in the order of the rows
`engine.reverseOrder=true` to reverse the order of execution

## Caching

Cache is disabled by default .`engine.enableCache=true` to enable caching.

## Tracing 

Tracing is disabled by default .`engine.enableTrace=true` to enable tracing.

### API

```typescript
type ValueType = string | number | boolean;
interface TraceEvent {
  type: "alpha" | "beta" | "action";
  id: string;
  value?: ValueType;
}

class RuleParser{
   parse(table: any[][]): RuleEngine {}
}

class RuleEngine {
    
  evaluate(input: Record<string, ValueType>): {
    fact: Record<string, ValueType>;
    trace: TraceEvent[];
  } 
}
//returns a dot file diagram
function traceToDot(trace: TraceEvent[]):string{}
```

## Conditions

| operator | description |
| ---------| ------------|
| =   | Equal to; applies to numbers  |
| !=  | Not equal to; applies to  numbers |
| >   | Greater than, numbers only   |
| <   | Less than, numbers only             |
| >=  | Greater than equal, numbers only          |
| <=  | Less than equal, numbers only          |
| ..  | Between; e.g., `.. 20,30` means greater than 20 and less than 30     |
| =~  | String pattern match; use * to match any character and ? for a single character |

```
 - `v*i` matches `v00i`, `vxxxi`, etc.  
 - `v?i` matches `v0i`, `v1i`, etc. 
```

condition values always as string value in json example

- "23.23" - number
- "'hello'" - string enclosed in single quotes
- "true" "false"- boolean values
- "> 23" ">= 23" ".. 23,23" - compare operator
- "=~ 'm>tach string *'". - string match 

## Demo

![/wiki/demo.png](/wiki/demo.png)

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for new features, bug fixes, or improvements.

## Feedback

You can write any feedback to vivek13186@gmail.com

## License

MIT License