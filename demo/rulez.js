function hashRecord(data) {
    return Object.keys(data)
        .sort()
        .map((k) => `${k}=${String(data[k])}`)
        .join("|");
}
function isMatch(s, p) {
    let i = 0; // pointer for string s
    let j = 0; // pointer for pattern p
    let starIdx = -1; // last position of '*'
    let matchIdx = 0; // position in s when '*' was found
    while (i < s.length) {
        // Case 1: characters match or '?'
        if (j < p.length && (p[j] === s[i] || p[j] === "?")) {
            i++;
            j++;
        }
        // Case 2: '*' found in pattern
        else if (j < p.length && p[j] === "*") {
            starIdx = j;
            matchIdx = i;
            j++;
        }
        // Case 3: mismatch but previous '*' exists → backtrack
        else if (starIdx !== -1) {
            j = starIdx + 1;
            matchIdx++;
            i = matchIdx;
        }
        // Case 4: mismatch and no '*'
        else {
            return false;
        }
    }
    // Skip remaining '*' in pattern
    while (j < p.length && p[j] === "*") {
        j++;
    }
    return j === p.length;
}
class Condition {
    lhs;
    op;
    rhs;
    constructor(lhs, op, rhs) {
        this.lhs = lhs;
        this.op = op;
        this.rhs = rhs;
    }
    eval(fact) {
        const value = fact[this.lhs];
        switch (this.op) {
            case "=":
                return value === this.rhs;
            case "!=":
                return value !== this.rhs;
            case ">":
                return typeof value === "number" && typeof this.rhs === "number"
                    ? value > this.rhs
                    : false;
            case "<":
                return typeof value === "number" && typeof this.rhs === "number"
                    ? value < this.rhs
                    : false;
            case ">=":
                return typeof value === "number" && typeof this.rhs === "number"
                    ? value >= this.rhs
                    : false;
            case "<=":
                return typeof value === "number" && typeof this.rhs === "number"
                    ? value <= this.rhs
                    : false;
            case "..": {
                if (typeof value !== "number" ||
                    !Array.isArray(this.rhs) ||
                    this.rhs.length !== 2) {
                    return false;
                }
                const [min, max] = this.rhs;
                return value > min && value < max;
            }
            case "=~":
                return (typeof value === "string" &&
                    typeof this.rhs === "string" &&
                    isMatch(value, this.rhs));
            default:
                return false;
        }
    }
    get id() {
        return JSON.stringify([this.lhs, this.op, this.rhs]);
    }
}
class AlphaNode {
    id;
    condition;
    children = [];
    constructor(condition) {
        this.condition = condition;
        this.id = `A(${condition.id})`;
    }
    activate(fact, ctx) {
        if (this.condition.eval(fact)) {
            ctx.alphaFired(this); // trace
            this.children.forEach((beta) => ctx.markMatched(beta));
        }
    }
}
class BetaNode {
    id;
    conditionsCount;
    actions = [];
    salience;
    constructor(conditionsCount, id, salience) {
        this.conditionsCount = conditionsCount;
        this.id = id;
        this.salience = salience;
    }
    fire(fact, ctx) {
        this.actions.forEach((a) => a.execute(fact, ctx));
    }
}
class Action {
    lhs;
    value;
    constructor(lhs, value) {
        this.lhs = lhs;
        this.value = value;
    }
    execute(fact, ctx) {
        if (ctx)
            ctx.actionFired(this);
        fact[this.lhs] = this.value;
        if (fact[this.lhs] !== undefined) {
            console.warn(`Overwriting '${this.lhs}'`);
        }
        fact[this.lhs] = this.value;
    }
}
class EvaluationContext {
    matches = new Map();
    trace = [];
    markMatched(beta) {
        this.matches.set(beta, (this.matches.get(beta) ?? 0) + 1);
        this.trace.push({ type: "beta", id: beta.id });
    }
    getReadyBetas() {
        return [...this.matches.entries()]
            .filter(([b, count]) => count === b.conditionsCount)
            .map(([b]) => b);
    }
    alphaFired(alpha) {
        this.trace.push({ type: "alpha", id: alpha.id });
    }
    actionFired(action) {
        this.trace.push({ type: "action", id: action.lhs, value: action.value });
    }
}
export class RuleEngine {
    alphaRoots;
    betas;
    cache = new Map();
    enableCache;
    constructor(alphaRoots, betas) {
        this.alphaRoots = alphaRoots;
        this.betas = betas;
        this.enableCache = false;
    }
    evaluate(input) {
        const fact = structuredClone(input);
        const hash = hashRecord(fact);
        if (this.enableCache && this.cache.has(hash)) {
            const cached = this.cache.get(hash);
            // return deep clones to avoid mutation
            return {
                fact: structuredClone(cached.fact),
                trace: structuredClone(cached.trace),
            };
        }
        const ctx = new EvaluationContext();
        this.alphaRoots.forEach((alpha) => alpha.activate(fact, ctx));
        ctx
            .getReadyBetas()
            .sort((a, b) => b.salience - a.salience)
            .forEach((beta) => beta.fire(fact, ctx)); // pass context to record actions
        if (this.enableCache) {
            this.cache.set(hash, { fact: structuredClone(fact), trace: structuredClone(ctx.trace) });
        }
        return { fact, trace: ctx.trace };
    }
}
class Header {
    name;
    isAction;
    constructor(name, isAction) {
        this.isAction = isAction;
        this.name = name;
    }
}
export class RuleParser {
    alphaMap = new Map();
    parse(table) {
        const headers = this.parseHeader(table[0]);
        const alphaRoots = new Set();
        const betas = [];
        table.slice(1).forEach((row, rowIndex) => {
            const conditions = [];
            const actions = [];
            row.forEach((cell, i) => {
                const header = headers[i];
                if (cell == null)
                    return;
                if (header.isAction) {
                    actions.push(new Action(header.name, cell));
                }
                else {
                    const cond = this.parseCondition(header.name, cell);
                    if (!cond)
                        return;
                    const alpha = this.getOrCreateAlpha(cond);
                    conditions.push(alpha);
                }
            });
            //row order become salience
            const beta = new BetaNode(conditions.length, `B${rowIndex}`, rowIndex);
            beta.actions.push(...actions);
            betas.push(beta);
            conditions.forEach((alpha) => {
                alpha.children.push(beta);
                alphaRoots.add(alpha);
            });
        });
        return new RuleEngine([...alphaRoots], betas);
    }
    parseHeader(row) {
        return row.map((col) => {
            let name = col;
            let isAction = false;
            if (typeof col === "string" && col.startsWith("@")) {
                isAction = true;
                name = col.slice(1);
            }
            return new Header(name, isAction);
        });
    }
    validateOperator(op) {
        const allowed = ["=", "!=", ">", "<", ">=", "<=", "..", "=~"];
        if (!allowed.includes(op)) {
            throw new Error(`Invalid operator: ${op}`);
        }
    }
    parseCondition(lhs, exp) {
        if (typeof exp === "number" || typeof exp === "boolean") {
            return new Condition(lhs, "=", exp);
        }
        if (typeof exp === "string") {
            if (!exp.includes(" ")) {
                return new Condition(lhs, "=", exp);
            }
            const [op, raw] = exp.split(" ", 2);
            this.validateOperator(op);
            let rhs;
            if (op === "..") {
                const parts = raw.split(",").map(Number);
                if (parts.length !== 2 || parts.some(isNaN)) {
                    throw new Error(`Invalid range syntax: ${raw}`);
                }
                rhs = parts;
            }
            else if (op === "=~") {
                rhs = raw;
            }
            else {
                rhs = isNaN(Number(raw)) ? raw : Number(raw);
            }
            return new Condition(lhs, op, rhs);
        }
        return null;
    }
    getOrCreateAlpha(cond) {
        if (!this.alphaMap.has(cond.id)) {
            this.alphaMap.set(cond.id, new AlphaNode(cond));
        }
        return this.alphaMap.get(cond.id);
    }
}
function escapeMermaidLabel(label) {
    return label
        .replace(/\\/g, " ") // escape backslash
        .replace(/"/g, '&quot;') // escape double quotes
        .replace(/\[/g, " ") // escape [
        .replace(/\]/g, " ") // escape ]
        .replace(/\|/g, " ") // escape |
        .replace(/</g, "&lt;") // replace <
        .replace(/>/g, "&gt;"); // replace >
}
export function traceToDot(trace) {
    const headers = ["start[label=\"Start\"];", "end[label=\"End\"];"];
    const links = [];
    let lastNodeId = "start";
    trace.forEach((event, index) => {
        const nodeId = `${event.type}_${index}`;
        let label = "";
        switch (event.type) {
            case "alpha":
                label = escapeMermaidLabel(`Alpha: ${event.id}`);
                headers.push(`${nodeId}[label="${label}",shape="rectangle",color="red"];`);
                break;
            case "beta":
                headers.push(`${nodeId}[label="Beta: ${event.id}]",shape="diamond",color="blue"];`);
                break;
            case "action":
                headers.push(`${nodeId}[label="Action: ${event.id} = ${event.value}",shape="rectangle",color="green"];`);
                break;
        }
        links.push(`${lastNodeId} -> ${nodeId};`);
        lastNodeId = nodeId;
    });
    links.push(`${lastNodeId} -> end`);
    return `digraph{ 
${headers.join("\n")}
${links.join("\n")}
};`;
}
