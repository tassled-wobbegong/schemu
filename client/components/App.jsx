import React from 'react';
import Container from './Container.jsx';

import { downloadAsFile, onPause, createSQL } from './util.js';
import Table from './Table.jsx';
import Handle from './Handle.jsx';

import './App.scss';

// app receives functionality like delegate from Container
export default class App extends Container {
  static Session(app) { /* <--- crazy use of capital letter */

    const id = (new URLSearchParams(window.location.search)).get('id');
    const socket = new WebSocket(`ws://localhost:3000/api/session/${id}`);
  
    socket.onopen = function(event) {
      console.log("Connection established...");
    };

    // receive data from websocket
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


    // send data through websocket
    socket.sync = (state) => {
      console.log('Outgoing state', state);
      console.log('trying to stingify', JSON.stringify(state))
      return socket.send(JSON.stringify(state)); 
    }


    return socket;
  }
  
  // initializes state, stores session data and data for undo/redo functionality
  constructor() {
    super();

    this.session = null;

    this.past = [];
    this.future = [];
    this.updating = false;
    this.refInputInstance = React.createRef();

    this.state = {
      tables: {},
      instances: []
    };
  }

  // handles some undo/redo logic... more investigation needed
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
      console.log('setting state');
    }

    if (!historic) {
      if (!this.updating) {
        const snapshot = this.snapshot();
        this.updating = onPause(500, () => {
          this.future = [];
          this.past.push(snapshot);
          this.updating = null;
        });
      } else {
        this.updating();
      }
    }

    console.log('state', state);
    if (state) {
      return super.setState(state, (...args) => {
        if (!external) {
          console.log('sync')
          this.session.sync(this.state);
        }
        if (callback) {
          callback(...args);
        }
      });
    }
  }

  // opens webcoket connection on initial render
  componentDidMount() {
    this.session = App.Session(this);
    this.loadAllInstances();
  }

  // functionality to be passed to child components
  addTable = () => {
    const id = parseInt(Object.keys(this.state.tables).pop()) + 1 || 1;

    const newTable = { 
      name: "table"+id,
      constraints: [], 
      fields: {}, 
      position: { 
        x: id * 25 % window.innerWidth, 
        y: id * 25 % window.innerHeight 
      }
    };

    this.setState({ 
      tables: { ...this.state.tables, [id]: newTable }
    });
  }
  removeTable = (id) => {
    let newtables = { ...this.state.tables };
    delete newtables[id];
    this.setState({ tables: newtables });
  };
  validateTable = (delta, path) => {
    if (delta.name) {
      for (const id in this.state.tables) {
        const table = this.state.tables[id];
        if (table.name === delta.name) {
          throw new Error(`Cannot rename table '${table.name}' to '${delta.name}' because the name is already in use.`)
        }
      }
    }
    return true;
  }

  // calls 'transform' callback on state.tables array and maps results to new arr
  mapTables = (transform) => {
    const tables = [];
    for (const id in this.state.tables) {
      const table = this.state.tables[id];
      tables.push(transform ? transform(table, id) : table);
    }
    return tables;
  };

  // handles xy pos and latter half event handling of click + drag on table component
  moveManager = (id) => {
    let curPos, lastEv;
    const  startMove = (ev) => {
      if (!curPos) {
        curPos = this.state.tables[id].position;
        lastEv = ev;
      }
  
      curPos = {
        x: curPos.x + (ev.clientX - lastEv.clientX),
        y: curPos.y + (ev.clientY - lastEv.clientY)
      };
      lastEv = ev;

      this.delegate('tables', id)({ position: curPos });
    };
    const endMove = () => {
      window.removeEventListener('mousemove', startMove);
      window.removeEventListener('mouseup', endMove);
    };

    window.addEventListener('mousemove', startMove);
    window.addEventListener('mouseup', endMove);
  };

  // creates new file and invokes util to format for download
  toSql = () => {
    downloadAsFile(new Blob(
      [ createSQL({ tables: this.state.tables }) ], 
      { type: 'text/plain' }), 'query.txt');
  };

  loadAllInstances = () => {
    this.setState(
      {
        instances: 
        [
          {
            instanceName: 'dur',
            currentState: {tables: {1: {name: "table1", constraints: [], fields: {}, position: {x: 296, y: 99}}}},
            pastState: [{tables: {}}, {tables: {1: {name: "table1", constraints: [], fields: {}, position: {x: 25, y: 25}}}}],
            futureState: []
          }
        ]
      },
      true
    );
  }

  loadStateFromInstance = () => {
    const loadedObj = {
      instanceName: 'dur',
      currentState: {tables: {1: {name: "table1", constraints: [], fields: {}, position: {x: 296, y: 99}}}},
      pastState: [{tables: {}}, {tables: {1: {name: "table1", constraints: [], fields: {}, position: {x: 25, y: 25}}}}],
      futureState: []
    };
    this.past = loadedObj.pastState;
    this.future = loadedObj.futureState;
    this.setState(loadedObj.currentState);
  }

  saveInstance = () => {
    const savedObj = {
      instanceName: this.refInputInstance.current.value,
      currentState: this.state,
      pastState: this.past,
      futureState: this.future
    };
    console.log('saved object:', savedObj);
    fetch('/saved', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(savedObj)
    }).then((res) => {
      return res.json();
    }).then( () => {
      // success update instances
      const instances = this.state.instances;
      instances.push(savedObj);
      console.log('wtf', this);
      this.setState({...this.state, instances: instances});
    }).catch( () => alert('error saving instance!'));
  }

  render() {
    return (
      <div className='App'>
        <div className="title">NoMoreQuery.io</div>
        <div className="toolbar">
          <button onClick={() => this.addTable()  }>New Table</button>
          <button onClick={() => this.toSql()}>Export SQL</button>
          <button onClick={() => this.setState(-1)}>Undo</button>
          <button onClick={() => this.setState(1)}>Redo</button>
          <input ref={this.refInputInstance} className="instance-name" type="text" placeholder="instance name"/>
          <button onClick={() => this.saveInstance()}>Save</button>
          <button onClick={() => this.loadStateFromInstance()}>Load</button>
        </div>
        <div className='tables'>          
          {this.mapTables((table, id) =>
            <div key={"wrapper"+id} ref={"wrapper"+id} style={{position: "absolute", left: table.position.x, top: table.position.y}}>
              <Table
                key={"table"+id}
                move={() => this.moveManager(id)}
                remove={() => this.removeTable(id)}
                update={this.delegate('tables', id, this.validateTable)}
                {...table} />
            </div>
          )}
        </div>
      </div>
    );
  }
}