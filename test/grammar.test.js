import assert from "assert/strict";
import fs from "fs";
import ohm from "ohm-js";

const syntaxChecks = [
  ["all numeric literal forms", "holler 8 * 89.123"],
  ["complex expressions", "holler 83 - (3)"],
  ["all binary operators", "holler x + 2 - 3"],
  ["end of program inside comment", "holler 0 // yay"],
  ["comments with no text are ok", "holler 1 // print(0);//"],
  ["non-Latin letters in identifiers", "コンパイラ = 100"],
];

const syntaxErrors = [
  // ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  // ["malformed number", "x= 2.", /Line 1, col 6/],
  // ["missing semicolon", "x = 3 y = 1", /Line 1, col 7/],
  // ["a missing right operand", "print(5 -", /Line 1, col 10/],
  // ["a non-operator", "print(7 * ((2 _ 3)", /Line 1, col 15/],
  // ["an expression starting with a )", "x = );", /Line 1, col 5/],
  // ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
  // ["an illegal statement on line 2", "print(5);\nx * 5;", /Line 2, col 3/],
  // ["a statement starting with a )", "print(5);\n) * 5", /Line 2, col 1/],
  // ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
];

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("src/YeeHaw.ohm"));
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(grammar.match(source).succeeded());
    });
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      const match = grammar.match(source);
      assert(!match.succeeded());
      assert(new RegExp(errorMessagePattern).test(match.message));
    });
  }
});
