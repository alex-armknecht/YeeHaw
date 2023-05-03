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
  // String(e) {
  //   return e;
  // },
  // Number(e) {
  //   return e;
  // },
  // Dict(e) {
  //   return e;
  // },
  // FunctionDeclaration(d) {
  //   d.fun = optimize(d.fun)
  //   if (d.body) d.body = optimize(d.body)
  //   return d
  // },
  // ReturnStatement(s) {
  //   s.expression = optimize(s.expression)
  //   return s
  // },
  // VariableDeclaration(d) {
  //   d.variable = optimize(d.variable)
  //   d.initializer = optimize(d.initializer)
  //   return d
  // },
  // PrintStatement(p) {
  //   p.statement = optimize(p.statement)
  //   return p
  // },
  // Assignment(s) {
  //   s.source = optimize(s.source)
  //   s.target = optimize(s.target)
  //   if (s.source === s.target) {
  //     return []
  //   }
  //   return s
  // }
};

export default function optimize(node) {
  if (optimizers[node.constructor.name] == undefined) {
    return node;
  } else {
    return optimizers[node.constructor.name](node);
  }
}
