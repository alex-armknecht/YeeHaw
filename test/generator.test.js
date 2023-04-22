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
      console.log(1);
    `,
  },
  {
    name: "varDec", //for lines 49-51
    source: `
      lasso x = 1
      holler(x)
    `,
    expected: dedent`
      let x = 1;
      console.log(x);
    `,
  },
  {
    name: "FuncDec", //for lines 70-72
    source: `
      yeehaw multiply(firstNum, secondNum){
        rodeo firstNum * secondNum
      }
      holler(multiply(5,10))
    `,
    expected: dedent`
      function multiply(firstNum, secondNum) {
        return firstNum * secondNum ;
      }
      console.log(multiple(5,10)) ;
    `,
  },
  {
    name: "var", //for lines 75-79
    source: `
      lasso cowName = "bessy"
    `,
    expected: dedent`
      let cowName =  "bessy";
    `,
  },
  {
    name: "func", //for lines 82
    source: `
      yeehaw square(Num){
        rodeo Num * Num
      }
      square(5)
    `,
    expected: dedent`
      function square(Num) {
        return Num * Num ;
      }
      square(5);
    `,
  },
];

const sampleProgram = "holler 0";

describe("The generator", () => {
  it("knows how to call the generator", () => {
    assert.throws(() => generate());
  });
});
