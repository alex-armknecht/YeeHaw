import util from "util";
import assert from "assert/strict";
import analyze, { error } from "../src/analyzer.js";

const semanticChecks = [
  // Test 1
  ["variable declarations work", 'lasso name = "Woody" lasso age = 20 lasso bullseye = hit'],
  // Test 2
  // ["class declaration with constructor works", 'cowhide myClass{ yeehaw ***cactus***(){} yeehaw sayHowdy(){}}'],
  // Test 3
  ["variables can be printed", "lasso x = 5 holler x"],
  // Test 4
  ["variables can be reassigned", "lasso x = 1 x = x * 5 / ((3) + x)"],
  // Test 5
  ["string literals work", 'lasso horsename = "Jerry"'],
  // Test 6
  ["binary expressions work", "lasso x = 5 y = 2 lasso z = x - y "],
  // Test 7
  [
    "if statement without else works",
    "lasso x = 1 lasso y = 1 ifin x - y == 0 hit holler x fine",
  ],
  // Test 8
  [
    "if statement with else works",
    "lasso x = 1 lasso y = 1 ifin x - y == 0 hit holler x miss holler 1 fine",
  ],
  // Test 9
  ["return statements work", "lasso z = 2 + 2 rodeo z"],
  // Test 10
  ["function declaration works", "yeehaw square(num) { rodeo num * num }"],
  // Test 11
  // ["constructor with params works", "cowhide myClass{ yeehaw ***cactus***(myVar1, myVar2){} yeehaw sayHowdy(){}}"],
  // Test 12
  // ["loops works", "corrale (x : 5) {holler x} "],
  // Test 13
  //   [
  //     "all predefined identifiers",
  //     "print ln(sqrt(sin(cos(hypot(π,1) + exp(5.5E2)))));",
  //   ],
  // Test 14
  // ["dot expression works", "cows.herd()"]
  // Test 15
  // ["dot call works", favoriteCow.name]
];

const sample = `let x=sqrt(9) function f(x)=3*x while(true){x=3 print(0?f(x):2)}`;

// const expected = `   1 | Program statements=[#2,#6,#10]
//    2 | VariableDeclaration variable=#3 initializer=#4
//    3 | Variable name='x' readOnly=false
//    4 | Call callee=#5 args=[9]
//    5 | Function name='sqrt' paramCount=1 readOnly=true
//    6 | FunctionDeclaration fun=#7 params=[#8] body=#9
//    7 | Function name='f' paramCount=1 readOnly=true
//    8 | Variable name='x' readOnly=true
//    9 | BinaryExpression op='*' left=3 right=#8
//   10 | WhileStatement test=true body=[#11,#12]
//   11 | Assignment target=#3 source=3
//   12 | PrintStatement argument=#13
//   13 | Conditional test=0 consequent=#14 alternate=2
//   14 | Call callee=#7 args=[#3]`;

describe("The analyzer", () => {
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
  // for (const [scenario, source, errorMessagePattern] of semanticErrors) {
  //   it(`throws on ${scenario}`, () => {
  //     assert.throws(() => analyze(source), errorMessagePattern);
  //   });
  // }
  //   it(`produces the expected graph for the simple sample program`, () => {
  //     assert.deepEqual(util.format(analyze(sample)), expected);
  //   });
});
