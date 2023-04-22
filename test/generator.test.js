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
      let x = 1
      console.log(x);
    `,
  },
];

const sampleProgram = "holler 0";

describe("The generator", () => {
  it("knows how to call the generator", () => {
    assert.throws(() => generate());
  });
});
