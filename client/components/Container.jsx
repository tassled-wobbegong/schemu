import React from 'react';

import { clone, merge } from './util.js';

export default class Container extends React.Component {
  /* 
  delegate([string] ...path, ([function] validator));
    Given a series of accessors 'path' and an optional validator callback,
    finds the corresponding object in Container.state and returns a function
    which when invoked, behaves just like Container.prototype.setState, but 
    relative to the object denoted by 'path'.
  */
  delegate = (...path) => {
    let validate;
    if (typeof path[path.length - 1] === 'function') {
      validate = path.pop();
    }

    return (...args) => {
      /* here be dragons */
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
