import assert from "assert/strict";
import generate from "../src/generator.js";

const sampleProgram = "holler 0";

describe("The generator", () => {
  it("knows how to call the generator", () => {
    assert.throws(() => generate());
  });
});
