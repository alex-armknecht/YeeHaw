//In your analyzer.js file, implement the part of the compile that produces the AST, without doing any contextual checks.
import ohm from "ohm-js";
import fs from "fs";
import * as core from "./core.js";

const YeeHawGrammar = ohm.grammar(fs.readFileSync("src/YeeHaw.ohm"));

// Checking Conditions inpspired by Carlos
function must(condition, message, errorLocation) {
  if (!condition) core.error(message, errorLocation)
}

function mustNotAlreadyBeDeclared(context, name) {
  must(!context.sees(name), `Identifier ${name} already declared`)
}

function mustHaveBeenFound(entity, name) {
  must(entity, `Identifier ${name} not declared`)
}

// Context Class inspired by Carlos
class Context {
  constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
    Object.assign(this, { parent, locals, inLoop, function: f })
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    mustNotAlreadyBeDeclared(this, name)
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name) || this.parent?.lookup(name)
    mustHaveBeenFound(entity, name)
    return entity
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() })
  }
}

export default function analyze(sourceCode) {
  let context = new Context({})

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

    VarDec(_lasso, variable, _eq, initializer) {
      return new core.VariableDeclaration(variable.rep(), initializer.rep());
    },

    AssignStmt(target, _eq, source) {
      return new core.AssignmentStatement(target.rep(), source.rep());
    },

    IfStmt_else(_ifin, test, _hit, consequent, _miss, alternate, _fine) {
      return new core.IfStatement(
        test.rep(),
        consequent.rep(),
        alternate.rep()
      );
    },

    IfStmt_noelse(_ifin, test, _hit, consequent, _fine) {
      return new core.IfStatement(test.rep(), consequent.rep(), []);
    },

    id(chars) {
      return this.sourceString;
    },

    Var(id) {
      return id.rep();
    },

    Exp_equal(left, _plus, right) {
      return new core.BinaryExpression("+", left.rep(), right.rep());
    },
    
    Exp0_add(left, _plus, right) {
      return new core.BinaryExpression("+", left.rep(), right.rep());
    },

    Exp0_sub(left, _plus, right) {
      return new core.BinaryExpression("-", left.rep(), right.rep());
    },

    Exp1_div(left, _plus, right) {
      return new core.BinaryExpression("/", left.rep(), right.rep());
    },

    Exp1_mul(left, _plus, right) {
      return new core.BinaryExpression("*", left.rep(), right.rep());
    },

    Term_parens(_open, expression, _close) {
      return expression.rep();
    },

    numeral(_leading, _dot, _fractional) {
      return Number(this.sourceString);
    },

    strlit(_open, chars, _close) {
      return new core.StringLiteral(chars.sourceString);
    },

    _iter(...children) {
      return children.map((child) => child.rep());
    },

    // Loop(_corrale, _open, type, id, _colon, range, _close, body) {
    //   return new core.Loop(type, id, range, body);
    // },

    FuncDec(_yeehaw, id, _open, params, _close, body) {
      // Inspired by Carlos
      const paramReps = params.asIteration().rep()
      const f = new core.Function(id.sourceString)
      context = context.newChildContext({inLoop: false, function: f})
      for (const p of paramReps) 
        context.add(p)
      const b = body.rep()
      context = context.parent
      return new core.FunctionDeclaration(id.sourceString, paramReps, b)
    },
    
    Return(_rodeo, arg) {
      return new core.Return(arg.rep());
    },

    // _terminal() {
    //   return this.sourceString;
    // },
  });

  const match = YeeHawGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return analyzer(match).rep()
}
