//In your analyzer.js file, implement the part of the compile that produces the AST, without doing any contextual checks.
import ohm from "ohm-js";
import fs from "fs";
import * as core from "./core.js";

const YeeHawGrammar = ohm.grammar(fs.readFileSync("src/YeeHaw.ohm"));

// Change to cowboy names later
// const INT = core.Type.INT
const NUMBER = core.Type.NUMBER;
const STRING = core.Type.STRING;
const BOOLEAN = core.Type.BOOLEAN;
const ANY = core.Type.ANY;
const VOID = core.Type.VOID;

// Throw an error message that takes advantage of Ohm's messaging
export function error(message, node) {
  if (node) {
    throw new Error(`${node.source.getLineAndColumnMessage()}${message}`);
  }
  throw new Error(message);
}

// CHECKING FUNCTIONS (need atleast 5 checking functions)
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

// function mustHaveSameType(e1, e2, at) {
//   console.log(e1.type)
//   console.log(e2.type)
//   must(e1.type === e2.type, "Operands must have same type", at)
// }

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
// function mustBeInLoop(context, at) {
//   must(context.inLoop, "Break can only appear in a loop", at)
// }

// CONTEXT CLASS (inspired by Carlos)
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
    // Search "outward" through enclosing scopes
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
      // mustHaveSameType(target.rep(), source.rep())
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
      // TODO: CHECK THAT entity is a function
      return new core.Call(
        entity,
        args.asIteration().children.map((a) => a.rep())
      );
      // TODO: check # of args
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
      return new core.Loop(id, range, body);
    },

    FuncDec(_yeehaw, id, _open, params, _close, body) {
      // Inspired by Carlos
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

    // Statement_break(_Skedaddle) {
    //   mustBeInLoop(context)
    //   return new core.BreakStatement()
    // },

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
