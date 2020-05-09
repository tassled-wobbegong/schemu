import React from 'react';

export default class Container extends React.Component {
  setState(...args){
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
    const updater = (...path) => {
      let validate;
      if (typeof path[path.length - 1] === 'function') {
        validate = path.pop();
      }

      return (..._args) => {
        if (_args.length && typeof _args[0] === 'object') {
          let delta = _args.shift();
          if (!validate || validate(delta, _args) === true) {
            return this.update(delta, ...path, ..._args);
          } 
        } else {
          return updater(...path, ..._args);
        }
      };
    };

    if (args.length && typeof args[0] === 'object') {
      let delta = args.shift();
      super.setState(crawl(this.state, [...args], delta));
    } else {
      return updater(...args);
    }
  };
}
