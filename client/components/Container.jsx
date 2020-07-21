import React from 'react';

import { clone, merge, debounce } from '../etc/util.js';

export default class Container extends React.Component {
  /** The WebSocket server URI which will manage global component state */
  ws_uri = null;

  /** An array containing undo history state snapshots. */
  past = [];
  /** An array containing redo history state snapshots. */
  future = [];
  
  /** An object representing the WebSocket connection. Contains a function ```sync``` which sends updated state to the server.  */
  session = null;

  /** Flag that stores a debounced callback while state is being updated. */
  updating = null;
  /** Flag indicating that an undo/redo state snapshot is being restored. */
  stepping = false;
  /** Flag indicating that a state update from the server is being assimiliated. */
  syncing = false;

  constructor(ws_uri) {
    super();
    
    this.ws_uri = ws_uri;
  }
  /** Manages undo/redo functionality.
   * @param arg When the argument is a positive integer, initiates a _redo_ action. When the argument is a negative integer, initiates an _undo_ action. When the argument is an object, pushes that object to the array of past states.
   */
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

  /** Syncronizes client/server state.
   * @param state When the argument is an object, replaces current state with the object. When the argument is ```true```, sends current state to the server. 
   */
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

  /** Initiates a WebSocket connection with the server. */
  connect() {
    const socket = new WebSocket(this.ws_uri);
  
    socket.onopen = (event) => {
      console.log("Connection established...");
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (typeof data === 'object' && data.tables) {
        this.sync(data);
      }
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
    // whenever state changes, add it to the history
    this.step(prevState);
    // then send it to the server.
    this.sync(true);
  }

  /** Given a series of accessors ```path``` and an optional validator callback, finds the corresponding object in the instance's{@linkcode state} and returns a function which when invoked, behaves just like {@linkcode Container.prototype.setState}, but relative to the object denoted by ```path```.
   * @param path A list of string keys. If the last entry is a function, it will be used as a validator function for state changes initiated by the resulting callback.
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
