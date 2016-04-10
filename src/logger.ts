let currentLevel = 0;
const logLevel = 2;
const logFull = false;

function indentation(level: number) {
  let output = '';
  for (let i = 0; i < level; i++) {
    output += '|  ';
  }
  return output;
}

function getLogFunction(full: boolean, originalFunc: Function, name: string, className: string): Function {
  return function(...args) {
    if (currentLevel <= logLevel) {
      console.log(indentation(currentLevel) + '->', name, 'of', className);
      if (full && args.length) {
        console.log(indentation(currentLevel + 2) + 'Arguments:', args);
      }
    }

    currentLevel++;
    const returnValue = originalFunc.apply(this, args);
    currentLevel--;
    
    if (currentLevel <= logLevel) {
      console.log(indentation(currentLevel) + '<-', name, 'of', className);
      if (full && returnValue) {
        console.log(indentation(currentLevel + 2) + 'Result:', returnValue);
      }
    }
    
    return returnValue;
  }
}

function LogDecorator() {
  return function(target) {
    decorateClass(target);
  }
}

(<any>LogDecorator).Full = function() {
  return function(target: any, name?: string) {
    if (name) {
      target.constructor._logInfo = target.constructor._logInfo || {};
      target.constructor._logInfo[name] = {
        full: true
      };
    }
    else {
      decorateClass(target, true);
    }
  }
};

function decorateClass(target: any, full: boolean = false) {
  for (let a in target.prototype) {
    if (target.prototype.hasOwnProperty(a)) {
      let isFuncDeclaredFull= false;
      if (target._logInfo && target._logInfo[a]) {
        isFuncDeclaredFull = target._logInfo[a].full;
      }

      target.prototype[a] = getLogFunction(isFuncDeclaredFull || full || logFull, target.prototype[a], a, target.name);
    }
  }
}

export const Log = LogDecorator;