import React from 'react';

import { clone, merge, debounce } from './util.js';

export default class Container extends React.Component {
  static createSession(app) {
    const id = (new URLSearchParams(window.location.search)).get('id');
    const socket = new WebSocket(`ws://localhost:3000/api/session/${id}`);
  
    socket.onopen = function(event) {
      console.log("Connection established...");
    };
    socket.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (typeof data === 'object') {
        if (!data.tables) {
          data.tables = [];
        }
        app.setState(data, true);
      }
      console.log("Message received: ", data);
    };
    socket.onclose = function(event) {
      if (event.wasClean) {
        console.log(`Goodbye!`);
      } else {
        console.log('Connection died.');
      }
    };
    socket.onerror = function(error) {
      console.log(`Error: ${error.message}.`);
    };

    return {
      sync(state) {
        socket.send(JSON.stringify(state));
      }
    };
  }
  
  constructor() {
    super();

    this.session = null;

    this.past = [];
    this.future = [];
    this.updating = null;
  }

  setState(...args) {
    let state, callback;
    let historic = false;
    let external = false;
    
    if (args.length === 1 && typeof args[0] === 'number') {
      historic = true;
      let dir = args.pop();
      if (dir < 0) {
        state = this.past.pop();
        if (state) {
          this.future.push(this.snapshot());
        }
      } else if (dir > 0) {
        state = this.future.pop();
        if (state) {
          this.past.push(this.snapshot());
        }
      }
    } else if (typeof args[0] === 'object' && args[1] === true) {
      external = true;
      state = args[0];
    } else if (typeof args[0] === 'object') {
      state = args.pop();
      callback = args.pop();
    }

    if (!historic) {
      if (!this.updating) {
        const snapshot = this.snapshot();
        this.updating = debounce(500, () => {
          this.future = [];
          this.past.push(snapshot);
          this.updating = null;
        });
      }

      this.updating();
    }

    if (state) {
      return super.setState(state, (...args) => {
        if (!external) {
          this.session.sync(this.state);
        }
        if (callback) {
          callback(...args);
        }
      });
    }
  }

  componentDidMount() {
    this.session = Container.createSession(this);
  }

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
