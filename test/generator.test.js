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
];

const sampleProgram = "holler 0";

describe("The generator", () => {
  it("knows how to call the generator", () => {
    assert.throws(() => generate());
  });
});
