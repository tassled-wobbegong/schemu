import React from 'react';

export default class Container extends React.Component {
  /*
    Overrides native react setState method.

    Use:
      setState([string] ...path, [object] delta);
        Given a series of accessors 'path', finds the corresponding object
        in Container.state and applies the changes specified in 'delta'

      setState([string] ...path, ([function] validator));
        Given a series of accessors 'path' and an optional validator callback,
        finds the corresponding object in Container.state and returns a function
        which when invoked, behaves just like Container.setState, but relative
        to the object denoted by 'path';

    Example:

  */
  setState(...args){
    /*
      crawl([object] target, [array] path, [object] delta);
        Given a series of accessors 'path', finds the corresponding object
        in 'target' and applies the changes specified in 'delta'
    */
    const crawl = (target, path, delta) => {
      const key = path.shift();

      let result;
      if (Array.isArray(target)) {
        result = [ ...target ];
        if (key !== undefined) {
          result[key] = crawl(target[key], path, delta);
        } else {
          for (let i in delta) {
            result[i] = delta[i];
          }
        }
      } else if (typeof target === 'object') {
        if (key !== undefined) {
          result = { ...target, [key]: crawl(target[key], path, delta) };
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

    /* 
      updater([string] ...path, ([function] validator));
        Given a series of accessors 'path' and an optional validator callback,
        finds the corresponding object in Container.state and returns a function
        which when invoked, behaves just like Container.setState, but relative
        to the object denoted by 'path';
    */
    const updater = (...path) => {
      let validate;
      if (typeof path[path.length - 1] === 'function') {
        validate = path.pop();
      }

      return (..._args) => {
        if (_args.length && typeof _args[0] === 'object') {
          let delta = _args.shift();
          if (!validate || validate(delta, _args) === true) {
            return this.setState(...path, ..._args, delta);
          } 
        } else {
          return updater(...path, ..._args);
        }
      };
    };

    //if the last argument is an object, change this.state,
    //otherwise return a callback which will allow state to be changed
    //later, within the scope denoted by the accessors (all previous arguments)
    if (args.length && typeof args[args.length - 1] === 'object') {
      const delta = args.pop();
      super.setState(crawl(this.state, [...args], delta));
    } else {
      return updater(...args);
    }
  };
}
