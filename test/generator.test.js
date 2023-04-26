import assert from "assert/strict";
import generate from "../src/generator.js";

import analyze from "../src/analyzer.js";
import optimize from "../src/optimizer.js";

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

const fixtures = [
  {
    name: "hello",
    source: `
      holler(1)
    `,
    expected: dedent`
      console.log(1)
    `,
  },
  {
    name: "varDec", //for lines 49-51
    source: `
      lasso x = 1
      holler(x)
    `,
    expected: dedent`
      let x_1 = 1;
      console.log(x_1)
    `,
  },
  {
    name: "FuncDec", //for lines 70-72
    source: `
      yeehaw multiply(firstNum, secondNum){
        rodeo 1 * 2
      }
      lasso answer = multiply(5,10)
      holler(answer)
    `,
    expected: dedent`
      function multiply(firstNum, secondNum) {
        return 1 * 2
      }
      let answer = multiply(5,10)
      console.log(answer)
    `,
  },
  {
    name: "var", //for lines 75-79
    source: `
      lasso cowName = "bessy"
    `,
    expected: dedent`
      let cowName_1 = "bessy";
    `,
  },
  {
    name: "func", //for lines 82
    source: `
      yeehaw scream(){
        holler("AAAAAA")
      }
      scream._()
    `,
    expected: dedent`
      function scream() {
        console.log("AAAAAA");
      }
      scream();
    `,
  },
  {
    name: "ass", //for lines 91
    source: `
      lasso x = 1
      x = x + 5
      holler(x)
    `,
    expected: dedent`
      let x = 1;
      x = x + 5;
      console.log(x);
    `,
  },
  {
    name: "ifstmt", //103-112
    source: `
      lasso x = 1
      lasso y = 1
      ifin x - y == 0 hit holler x fine
    `,
    expected: dedent`
      let x_1 = 1;
      let y_2 = 1;
      if (((x_1 - y_2) === 0)) {
        console.log(x_1)
      } else {
      }
    `,
  },
  {
    name: "ifelsestmt", //for lines 106-107
    source: `
      lasso x = 1
      lasso y = 5
      ifin x - y == 0 hit holler x miss holler y fine
    `,
    expected: dedent`
      let x_1 = 1;
      let y_2 = 5;
      if (((x_1 - y_2) === 0)) {
        console.log(x_1)
      } else {
        console.log(y_2)
      }
    `,
  },
  {
    name: "bool", //for lines 200-203
    source: `
      lasso bullseye = hit
      lasso airball = miss
      holler(bullseye)
    `,
    expected: dedent`
      let bullseye_1 = true;
      let airball_2 = false;
      console.log(bullseye_1)
    `,
  },
];

const sampleProgram = "holler 0";

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(fixture.source)));
      assert.deepEqual(actual, fixture.expected);
    });
  }
});
