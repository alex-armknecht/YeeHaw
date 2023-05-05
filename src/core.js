import util from "util";

export class Program {
  constructor(statements) {
    this.statements = statements;
  }
}

export class Type {
  static BOOLEAN = new Type("boolean");
  static NUMBER = new Type("number");
  static STRING = new Type("string");
  static VOID = new Type("void");
  static ANY = new Type("any");
  constructor(description) {
    Object.assign(this, { description });
  }
}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument;
  }
}

export class VariableDeclaration {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer });
  }
}

export class Variable {
  constructor(name, type) {
    Object.assign(this, { name, type });
  }
}

export class AssignmentStatement {
  constructor(target, source) {
    Object.assign(this, { target, source });
  }
}

export class IfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate });
  }
}

export class BinaryExpression {
  constructor(op, left, right, type) {
    Object.assign(this, { op, left, right, type });
  }
}

export class StringLiteral {
  constructor(contents) {
    this.contents = contents;
  }
}

export class Return {
  constructor(argument) {
    this.argument = argument;
  }
}

export class FunctionDeclaration {
  constructor(fun, body) {
    Object.assign(this, { fun, body });
  }
}

export class Function {
  constructor(name, params) {
    Object.assign(this, { name, params });
  }
}

export class DotCall {
  constructor(id1, id2, params) {
    Object.assign(this, { id1, id2, params });
  }
}

export class Call {
  constructor(id, args) {
    Object.assign(this, { id, args });
  }
}

export class CallStatement {
  constructor(call) {
    Object.assign(this, { call });
  }
}

export class DotExp {
  constructor(id1, id2) {
    Object.assign(this, { id1, id2 });
  }
}

export class Loop {
  constructor(iterator, range, body) {
    Object.assign(this, { iterator, range, body });
  }
}

export class BreakStatement {

}

Program.prototype[util.inspect.custom] = function () {
  const tags = new Map();

  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return;
    tags.set(node, tags.size + 1);
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child);
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`;
      if (Array.isArray(e)) return `[${e.map(view)}]`;
      return util.inspect(e);
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let type = node.constructor.name;
      let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`);
      yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`;
    }
  }

  tag(this);
  return [...lines()].join("\n");
};

String.prototype.type = Type.STRING;
Number.prototype.type = Type.NUMBER;
Boolean.prototype.type = Type.BOOLEAN;
