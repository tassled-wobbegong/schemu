import React from 'react';

/*
  merge([object] target, [array] path, [object] delta);
    Given a series of accessors 'path', finds the corresponding object in 
    'target' and applies the changes specified in 'delta' to a copy of 'target'.
    Returns the copied, changed object.

*/
const merge = (target, path, delta) => {
  const key = path.shift();

  let result;
  if (Array.isArray(target)) {
    result = [ ...target ];
    if (key !== undefined) {
      result[key] = merge(target[key], path, delta);
    } else {
      for (let i in delta) {
        result[i] = delta[i];
      }
    }
  } else if (typeof target === 'object') {
    if (key !== undefined) {
      result = { ...target, [key]: merge(target[key], path, delta) };
    } else {
      result = { ...target, ...delta };
    }
  } else {
    if (key !== undefined) {
      throw new Error("Undefined path.");
    } else {
      result = delta;
    }
  }
  return result;
};

const clone = (target) => {
  if (typeof target === "object") {
    const result = Array.isArray(target) ? [] : {};
    for (let key in target) {
      result[key] = clone(target[key]);
    }
    return result;
  } else {
    return target;
  }
};

export default class Container extends React.Component {
  /* 
  delegate([string] ...path, ([function] validator));
    Given a series of accessors 'path' and an optional validator callback,
    finds the corresponding object in Container.state and returns a function
    which when invoked, behaves just like Container.prototype.setState, but relative
    to the object denoted by 'path';
  */
  delegate = (...path) => {
    let validate;
    if (typeof path[path.length - 1] === 'function') {
      validate = path.pop();
    }

    return (...args) => {
      if (args.length && typeof args[args.length - 1] === 'object') {
        const delta = args.pop();
        if (!validate || validate(delta, args) === true) {
          return this.setState(merge(this.state, [...path, ...args], delta));
        } 
      } else {
        return this.delegate(...path, ...args);
      }
    };
  };

  snapshot() {
    return clone(this.state);
  }
}
