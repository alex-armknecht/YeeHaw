
import { IfStatement, Type } from "./core.js";

export default function generate(program) {
  const output = [];
  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1);
      }
      return `${entity.name}_${mapping.get(entity)}`;
    };
  })(new Map());

  function gen(node) {
    return generators[node.constructor.name](node);
  }

  const generators = {
    Program(p) {
      gen(p.statements);
    },
    
    PrintStatement(s) {
      output.push(`console.log(${gen(s.argument)})`);
    },

    VariableDeclaration(d) {
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`);
    },

    FunctionDeclaration(d) {
      output.push(`function ${gen(d.fun)}(${gen(d.fun.params).join(", ")}) {`);
      gen(d.body);
      output.push("}");
    },
    Variable(v) {
      return targetName(v);
    },
    Function(f) {
      return targetName(f);
    },

    AssignmentStatement(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`);
    },

    Return(s) {
      output.push(`return ${gen(s.argument)};`);
    },
  
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`);
      gen(s.consequent);
      output.push("} else {");
      gen(s.alternate);
      output.push("}");
    },
    
    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op;
      return `(${gen(e.left)} ${op} ${gen(e.right)})`;
    },
    
    Call(c) {
      return `${gen(c.id)}(${gen(c.args)})`;
    },

    Number(e) {
      return e;
    },
  
    Boolean(e) {
      return e;
    },
    String(e) {
      return e;
    },
    StringLiteral(e) {
      return `"${e.contents}"`;
    },
    Array(a) {
      return a.map(gen);
    },
  };

  gen(program);
  return output.join("\n");
}
