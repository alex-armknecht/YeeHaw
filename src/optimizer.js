import * as core from "./core.js";
import generate from "../src/generator.js";
import analyze from "../src/analyzer.js";

const optimizers = {
  BinaryExpression(e) {
    e.op = optimize(e.op);
    e.left = optimize(e.left);
    e.right = optimize(e.right);
    if (e.op == "+") return e.left + e.right;
    else if (e.op == "-") return e.left - e.right;
    else if (e.op == "*") return e.left * e.right;
    else return e.left / e.right;
  },
};

export default function optimize(node) {
  if (optimizers[node.constructor.name] == undefined) {
    return node;
  } else {
    return optimizers[node.constructor.name](node);
  }
}
