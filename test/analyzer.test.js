import util from "util";
import assert from "assert/strict";
import analyze, { error } from "../src/analyzer.js";

const semanticChecks = [
  // Test 1
  [
    "variable declarations",
    'lasso name = "Woody" lasso age = 20 lasso bullseye = hit',
  ],
  // Test 2
  // ["class declaration with constructor works", 'cowhide myClass{ yeehaw ***cactus***(){} yeehaw sayHowdy(){}}'],
  // Test 3
  ["variables can be printed", "lasso x = 5 holler x"],
  // Test 4
  ["variables can be reassigned", "lasso x = 1 x = 5"],
  // Test 5
  ["string literals", 'lasso horsename = "Jerry"'],
  // Test 6
  ["binary expressions", "lasso x = 5 lasso y = 2 lasso z = x - y "],
  // Test 7
  [
    "if statement without else",
    "lasso x = 1 lasso y = 1 ifin x - y == 0 hit holler x fine",
  ],
  [
    "if statement with var",
    "lasso x = 1 lasso y = 1 lasso z = x - y == 0 ifin z hit holler x fine",
  ],
  //  [
  //   "if statement with bool",
  //   'lasso z = miss lasso x = 1 lasso y = 1 ifin z hit holler x fine',
  // ],
  // Test 8
  [
    "if statement with else",
    "lasso x = 1 lasso y = 1 ifin x - y == 0 hit holler x miss holler 1 fine",
  ],
  // Test 9
  ["return statements", "yeehaw func(z) { rodeo z }"],

  // Test 10
  ["function declarations", "yeehaw function(num) { rodeo num }"],
  // Test 11
  // ["constructor with params works", "cowhide myClass{ yeehaw ***cactus***(myVar1, myVar2){} yeehaw sayHowdy(){}}"],
  // Test 12
  ["for loops", "corrale (x : 5) {holler x} "],
  // Test 13
  //   [
  //     "all predefined identifiers",
  //     "print ln(sqrt(sin(cos(hypot(π,1) + exp(5.5E2)))));",
  //   ],
  // Test 14
  ["dot call", "cows.herd()"],
  // Test 15
  ["dot expression", "favoriteCow.name"],
  // Test 16
  // ["while loops work", ""]
  ["holler", 'holler("YEEE_HAWWW")'],
  // Test 17
  ["globals", "lasso x = 1 yeehaw f() {holler x}"],
  //Test 18
  ["== expression with whole numbers", "lasso x = 1 lasso y = 1 holler x == y"],
  // Test 19
  [
    "== expression with non-whole numbers",
    "lasso x = 1.0 lasso y = 1.0 holler x == y",
  ],
  // Test 20
  [
    "== expression with mixed numbers",
    "lasso x = 1 lasso y = 1.0 holler x == y",
  ],
  // Test 21
  ["adding mixed numbers", "lasso x = 1 lasso y = 1.0 holler x + y"],
  // Test 22 (call statement)
  ["call statement", "lasso x = 1 yeehaw f() {holler x} f()"],
];

// const sample = `let x=sqrt(9) function f(x)=3*x while(true){x=3 print(0?f(x):2)}`;
const semanticErrors = [
  // Test 1
  [
    "using undeclared identifiers",
    "holler x",
    /Sugar I think you forgot to declare x above/,
  ],
  // //Test 2
  // [
  //   "a variable used as function",
  //   "lasso x = 1 holler(x(2))",
  //   /Expected "." or "="/,
  // ],
  //Test 3
  [
    "re-declared identifier",
    "lasso x = 1 lasso x = 2",
    /Darlin' you already declared x above/,
  ],
  //Test 4
  [
    "return outside of function",
    "rodeo 1",
    /Honeypie this rodeo must be contained in the function/,
  ],
  //Test 5
  ["subtract strings", 'holler "a" - "b"', /Sugar I'm expecting a number here/],
  //Test 6
  ["adding strings", 'holler "a" + "b" ', /Sugar I'm expecting a number here/],
  //Test 7
  [
    "invalid type for *",
    'holler "a" *  3',
    /Sugar I'm expecting a number here/,
  ],
  //Test 8
  [
    "invalid type for /",
    'holler "a" /  3',
    /Sugar I'm expecting a number here/,
  ],
  //Test 9
  [
    "invalid type for ifin",
    "lasso x = 1 ifin x hit holler x fine",
    /Sweetie I'm looking for a boolean here/,
  ],
  // Test 10
  // Having issues getting the type of a previously declared var so this doesn't work yet
  // ["invalid variable reassignment", 'lasso x = 1 x = "string"', /Operands must have same type/]
  // Test 11
  [
    "non-int range",
    "corrale (x : 5.1) {holler x} ",
    /There shouldn't be any decimal values here puddin'/,
  ],
  // Test 12
  [
    "non-number as range",
    'corrale (x : "string") {holler x} ',
    /Sugar I'm expecting a number here/,
  ],
  //Test 13
  [
    "variable initialized before for loop",
    'lasso x = "string" corrale (x : 5) {holler x}',
    /Darlin' you already declared x above/,
  ],
];

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
  // it(`produces the expected graph for the simple sample program`, () => {
  //   assert.deepEqual(util.format(analyze(sample)), expected);
  // });
});
