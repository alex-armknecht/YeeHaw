#! /usr/bin/env node

import fs from "fs/promises";
import process from "process";
import compile from "./compiler.js";

const help = `YeeHaw compiler
Syntax: node YeeHaw.js <filename> <outputType>
Prints to stdout according to <outputType>, which must be one of:
  analyzed   the semantically analyzed representation
  optimized  the optimized semantically analyzed representation
  js         the translation to JavaScript
`;

async function compileFromFile(filename, outputType) {
  const buffer = await fs.readFile(filename);
  console.log(compile(buffer.toString(), outputType));
}

if (process.argv.length !== 4) {
  console.log(help);
} else {
  compileFromFile(process.argv[2], process.argv[3]);
}
