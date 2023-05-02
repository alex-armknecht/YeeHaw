import assert from "node:assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

const sampleProgram = "holler 0";
const return2 = new core.Return(2)

const tests = [
  ["folds +", new core.BinaryExpression("+", 5, 8), 13],
  ["folds -", new core.BinaryExpression("-", 5n, 8n), -3n],
  ["folds *", new core.BinaryExpression("*", 5, 8), 40],
  ["folds /", new core.BinaryExpression("/", 5, 8), 0.625],
]

describe("The optimizer", () => {
  it("knows how to call the optimizer", () => {
    assert.ok(() => optimize());
  });
});

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after);
    });
  }
});