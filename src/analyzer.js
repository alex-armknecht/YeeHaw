
import ohm from "ohm-js";
import fs from "fs";
import * as core from "./core.js";

const YeeHawGrammar = ohm.grammar(fs.readFileSync("src/YeeHaw.ohm"));

const NUMBER = core.Type.NUMBER;
const STRING = core.Type.STRING;
const BOOLEAN = core.Type.BOOLEAN;
const ANY = core.Type.ANY;
const VOID = core.Type.VOID;

export function error(message, node) {
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`);
  }
  throw new Error(message);
}

function must(condition, message, errorLocation) {
  if (!condition) error(message, errorLocation);
}

function mustNotAlreadyBeDeclared(context, name) {
  must(!context.sees(name), `Darlin' you already declared ${name} above`);
}

function mustHaveBeenFound(entity, name) {
  must(entity, `Sugar I think you forgot to declare ${name} above`);
}

function mustBePositive(e, at) {
  must(e >= 0, "This number must be positive moonpie", at);
}

function mustHaveTypeNumber(e, at) {
  must(e.type === NUMBER, "Sugar I'm expecting a number here", at);
}

function mustBeInt(e, at) {
  must(e % 1 == 0, "There shouldn't be any decimal values here puddin'", at);
}

function mustHaveBooleanType(e, at) {
  must(e.type === BOOLEAN, "Sweetie I'm looking for a boolean here", at);
}
function mustBeInsideFunction(context, at) {
  must(
    context.function,
    "Honeypie this rodeo must be contained in the function",
    at
  );
}

class Context {
  constructor({
    parent = null,
    locals = new Map(),
    inLoop = false,
    function: f = null,
  }) {
    Object.assign(this, { parent, locals, inLoop, function: f });
  }
  sees(name) {
    return this.locals.has(name) || this.parent?.sees(name);
  }
  add(name, entity) {
    mustNotAlreadyBeDeclared(this, name);
    this.locals.set(name, entity);
  }
  lookup(name) {
    const entity = this.locals.get(name) || this.parent?.lookup(name);
    mustHaveBeenFound(entity, name);
    return entity;
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() });
  }
}

export default function analyze(sourceCode) {
  let context = new Context({});

  const analyzer = YeeHawGrammar.createSemantics().addOperation("rep", {
    Program(body) {
      return new core.Program(body.rep());
    },

    Statement(statement) {
      return statement.rep();
    },

    Params(params) {
      return params.asIteration().rep();
    },

    Block(_left, block, _right) {
      return block.rep();
    },

    PrintStmt(_holler, argument) {
      return new core.PrintStatement(argument.rep());
    },

    VarDec(_lasso, id, _eq, initializer) {
      const e = initializer.rep();
      const variable = new core.Variable(id.rep(), e.type);
      context.add(id.rep(), variable);
      return new core.VariableDeclaration(variable, e);
    },

    AssignStmt(target, _eq, source) {
      return new core.AssignmentStatement(target.rep(), source.rep());
    },

    IfStmt_else(_ifin, test, _hit, consequent, _miss, alternate, _fine) {
      mustHaveBooleanType(test.rep());
      return new core.IfStatement(
        test.rep(),
        consequent.rep(),
        alternate.rep()
      );
    },

    IfStmt_noelse(_ifin, test, _hit, consequent, _fine) {
      mustHaveBooleanType(test.rep());
      return new core.IfStatement(test.rep(), consequent.rep(), []);
    },

    id(chars) {
      return this.sourceString;
    },

    Var(id) {
      const entity = context.lookup(id.rep());
      mustHaveBeenFound(entity);
      return entity;
    },

    Exp_equal(left, _plus, right) {
      return new core.BinaryExpression("==", left.rep(), right.rep(), BOOLEAN);
    },

    Exp0_add(left, _plus, right) {
      mustHaveTypeNumber(left.rep());
      mustHaveTypeNumber(right.rep());
      return new core.BinaryExpression(
        "+",
        left.rep(),
        right.rep(),
        left.rep().type
      );
    },

    Exp0_sub(left, _plus, right) {
      mustHaveTypeNumber(left.rep());
      mustHaveTypeNumber(right.rep());
      return new core.BinaryExpression(
        "-",
        left.rep(),
        right.rep(),
        left.rep().type
      );
    },

    Exp1_div(left, _plus, right) {
      mustHaveTypeNumber(left.rep());
      mustHaveTypeNumber(right.rep());
      return new core.BinaryExpression(
        "/",
        left.rep(),
        right.rep(),
        left.rep().type
      );
    },

    Exp1_mul(left, _plus, right) {
      mustHaveTypeNumber(left.rep());
      mustHaveTypeNumber(right.rep());
      return new core.BinaryExpression(
        "*",
        left.rep(),
        right.rep(),
        left.rep().type
      );
    },

    Term_parens(_open, expression, _close) {
      return expression.rep();
    },

    Term_call(id, _open, args, _close) {
      const entity = context.lookup(id.sourceString);
      return new core.Call(
        entity,
        args.asIteration().children.map((a) => a.rep())
      );
    },

    numeral(_leading, _dot, _fractional) {
      return Number(this.sourceString);
    },

    hit(_) {
      return true;
    },

    miss(_) {
      return false;
    },

    strlit(_open, chars, _close) {
      return new core.StringLiteral(chars.sourceString);
    },

    _iter(...children) {
      return children.map((child) => child.rep());
    },

    Loop(_corrale, _open, id, _colon, range, _close, body) {
      context = context.newChildContext({ inLoop: true });
      context = context.parent;
      mustNotAlreadyBeDeclared(context, id.rep());
      mustHaveTypeNumber(range.rep());
      mustBeInt(range.rep());
      mustBePositive(range.rep());
      return new core.Loop(id.sourceString, range.rep(), body.rep());
    },

    FuncDec(_yeehaw, id, _open, params, _close, body) {
      const paramNames = params.rep();
      const parameters = paramNames.map(
        (name) => new core.Variable(name, core.Type.NUMBER)
      );
      const f = new core.Function(id.sourceString, parameters);
      context.add(id.rep(), f);
      context = context.newChildContext({ inLoop: false, function: f });
      for (const p of parameters) context.add(p.name, p);
      const b = body.rep();
      context = context.parent;
      return new core.FunctionDeclaration(f, b);
    },

    skedaddle(_) {
      return new core.BreakStatement();
    },

    Return(_rodeo, arg) {
      mustBeInsideFunction(context, _rodeo);
      return new core.Return(arg.rep());
    },

    DotCall(id1, _dot, id2, _open, params, _close) {
      return new core.DotCall(id1.rep(), id2.rep(), params.asIteration().rep());
    },

    Call(id, _open, args, _close) {
      const entity = context.lookup(id.sourceString);
      return new core.CallStatement(
        new core.Call(
          entity,
          args.asIteration().children.map((a) => a.rep())
        )
      );
    },

    DotExp(id1, _dot, id2) {
      return new core.DotExp(id1.rep(), id2.rep());
    },
  });

  const match = YeeHawGrammar.match(sourceCode);
  if (!match.succeeded()) throw new Error(match.message);
  return analyzer(match).rep();
}
