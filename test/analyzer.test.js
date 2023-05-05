import util from "util";
import assert from "assert/strict";
import analyze, { error } from "../src/analyzer.js";

const semanticChecks = [
  [
    "variable declarations",
    'lasso name = "Woody" lasso age = 20 lasso bullseye = hit',
  ],
  ["variables can be printed", "lasso x = 5 holler x"],
  ["variables can be reassigned", "lasso x = 1 x = 5"],
  ["string literals", 'lasso horsename = "Jerry"'],
  ["binary expressions", "lasso x = 5 lasso y = 2 lasso z = x - y "],
  ["if statement without else", "lasso x = 1 lasso y = 1 ifin x - y == 0 hit holler x fine"],
  ["if statement with var", "lasso x = 1 lasso y = 1 lasso z = x - y == 0 ifin z hit holler x fine"],
  ["if statement with bool",'lasso z = miss lasso x = 1 lasso y = 1 ifin z hit holler x fine'],
  ["if statement with else", "lasso x = 1 lasso y = 1 ifin x - y == 0 hit holler x miss holler 1 fine"],
  ["return statements", "yeehaw func(z) { rodeo z }"],
  ["function declarations", "yeehaw function(num) { rodeo num }"],
  ["for loops", "corrale (x : 5) {holler 3} "],
  ["skedaddle", "corrale (x : 5) {skedaddle} "],
  ["dot call", "cows.herd()"],
  ["dot expression", "favoriteCow.name"],
  ["holler", 'holler("YEEE_HAWWW")'],
  ["globals", "lasso x = 1 yeehaw f() {holler x}"],
  ["== expression with whole numbers", "lasso x = 1 lasso y = 1 holler x == y"],
  ["== expression with non-whole numbers", "lasso x = 1.0 lasso y = 1.0 holler x == y"],
  ["== expression with mixed numbers","lasso x = 1 lasso y = 1.0 holler x == y"],
  ["adding mixed numbers", "lasso x = 1 lasso y = 1.0 holler x + y"],
  ["call statement", "lasso x = 1 yeehaw f() {holler x} f()"],
];

const semanticErrors = [
  [
    "using undeclared identifiers",
    "holler x",
    /Sugar I think you forgot to declare x above/,
  ],
  [
    "re-declared identifier",
    "lasso x = 1 lasso x = 2",
    /Darlin' you already declared x above/,
  ],
  [
    "return outside of function",
    "rodeo 1",
    /Honeypie this rodeo must be contained in the function/,
  ],
  ["subtract strings", 'holler "a" - "b"', /Sugar I'm expecting a number here/],
  ["adding strings", 'holler "a" + "b" ', /Sugar I'm expecting a number here/],
  [
    "invalid type for *",
    'holler "a" *  3',
    /Sugar I'm expecting a number here/,
  ],
  [
    "invalid type for /",
    'holler "a" /  3',
    /Sugar I'm expecting a number here/,
  ],
  [
    "invalid type for ifin",
    "lasso x = 1 ifin x hit holler x fine",
    /Sweetie I'm looking for a boolean here/,
  ],
  [
    "non-int range",
    "corrale (x : 5.1) {holler x} ",
    /There shouldn't be any decimal values here puddin'/,
  ],
  [
    "non-number as range",
    'corrale (x : "string") {holler x} ',
    /Sugar I'm expecting a number here/,
  ],
  [
    "variable initialized before for loop",
    'lasso x = "string" corrale (x : 5) {holler x}',
    /Darlin' you already declared x above/,
  ],
];

describe("The analyzer", () => {
  it("throws on a syntax error", () => {
    assert.throws(() => analyze("1 +"));
  });
  it("can invoke the error function", () => {
    assert.throws(() => error("Something bad happened"));
  });
  it("can invoke the error function with a node", () => {
    assert.throws(() => error("OOOH", {}));
  });
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(source));
    });
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(source), errorMessagePattern);
    });
  }
});
