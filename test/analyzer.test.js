import util from "util";
import assert from "assert/strict";
import analyze from "../src/analyzer.js";

const semanticChecks = [
  ["variables can be printed", "lasso x = 5 holler x"],
  ["variables can be reassigned", "lasso x = 1 x = x * 5 / ((3) + x)"],
  ["string literals work", 'lasso horsename = "Jerry"'],
  ["binary expressions work", "lasso x = 5 y = 2 lasso z = x - y "],
  [
    "if statement works",
    "lasso x = 1 lasso y = 1 ifin x - y == 0 hit holler x fine",
  ],
  //   [
  //     "all predefined identifiers",
  //     "print ln(sqrt(sin(cos(hypot(π,1) + exp(5.5E2)))));",
  //   ],
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
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(source));
    });
  }
  //   for (const [scenario, source, errorMessagePattern] of semanticErrors) {
  //     it(`throws on ${scenario}`, () => {
  //       assert.throws(() => analyze(source), errorMessagePattern);
  //     });
  //}
  //   it(`produces the expected graph for the simple sample program`, () => {
  //     assert.deepEqual(util.format(analyze(sample)), expected);
  //   });
});
