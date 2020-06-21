import React from 'react';

import { clone, merge, debounce } from '../etc/util.js';

export default class Container extends React.Component {
  ws_uri = null;

  past = [];
  future = [];
  
  session = null;

  updating = null;
  stepping = false;
  syncing = false;

  constructor(ws_uri) {
    super();
    
    this.ws_uri = ws_uri;
  }

  step(arg) {
    if (typeof arg === "object") {
      if (!this.stepping) {
        if (!this.updating) {
          this.updating = debounce(500, () => {
            this.future = [];
            this.past.push(arg);
            this.updating = null;
          });
        }
        this.updating();
      } else {
        this.stepping = true;
      }
    } else {
      let state;
      if (arg < 0) {
        state = this.past.pop();
        if (state) {
          this.future.push(clone(this.state));
        }
      } else if (arg > 0) {
        state = this.future.pop();
        if (state) {
          this.past.push(clone(this.state));
        }
      }
      this.stepping = true;
      this.setState(state);
    }
  }
  sync(state) {
    if (state === true) {
      if (!this.syncing) {
        this.session.sync(this.state);
      } else {
        this.syncing = false;
      }
    } else {
      this.syncing = true;
      this.setState(state); 
    }
  }
  connect() {
    const socket = new WebSocket(this.ws_uri);
  
    socket.onopen = (event) => {
      console.log("Connection established...");
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (typeof data === 'object') {
        if (!data.tables) {
          data.tables = [];
        }
        this.sync(data);
      }
      console.log("Message received: ", data);
    };
    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`Goodbye!`);
      } else {
        console.log('Connection died.');
      }
    };
    socket.onerror = (error) => {
      console.log(`Error: ${error.message}.`);
    };

    this.session = {
      sync(state) {
        socket.send(JSON.stringify(state));
      }
    };
  }

  componentDidMount() {
    this.connect();
  }
  componentDidUpdate(prevProps, prevState) {
    this.step(prevState);
    this.sync(true);
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
}
