//In your analyzer.js file, implement the part of the compile that produces the AST, without doing any contextual checks.
import ohm from "ohm-js";
import fs from "fs";
import * as core from "./core.js";

// Throw an error message that takes advantage of Ohm's messaging
function error(message, node) {
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`);
  }
  throw new Error(message);
}

const YeeHawGrammar = ohm.grammar(fs.readFileSync("src/YeeHaw.ohm"));

export default function analyze(sourceCode) {
  const match = YeeHawGrammar.match(sourceCode);
  if (!match.succeeded()) error(match.message);
  console.log("you're good!");
}
