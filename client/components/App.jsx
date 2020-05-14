import React from 'react';
import Container from './Container.jsx';

import { downloadAsFile, onPause, createSQL } from './util.js';
import Table from './Table.jsx';
import Handle from './Handle.jsx';
import UserControlPanel from './userControlPanel.jsx'
import './App.scss';

// app receives functionality like delegate from Container
export default class App extends Container {
  static Session(app) { /* <--- crazy use of capital letter, TODO: refactor to use lower case letter */

    const id = (new URLSearchParams(window.location.search)).get('id'); // grab id from browsers http path
    const socket = new WebSocket(`ws://localhost:3000/api/session/${id}`); // connect a websocket session
  
    /* 
     set up socket event listeners onopen, onmessage, onerror, onclose, s
     sync is not part of the socket api, is a custom property added
     to wrap around sockets send api 
    */
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
      if (event.wasClean) { // check if it was a user created disconnect
        console.log(`Goodbye!`);
      } else { // if the user did not manually disconnect then the connection was disconnected
              // by other means, i.e. user timed out, computer froze.
        console.log('Connection died.');
      }
    };
    socket.onerror = function(error) {
      console.log(`Error: ${error.message}.`);
    };


    // send data through websocket
    socket.sync = (state) => {
      // state is an object that is connected to App's state
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
    this.updating = false;  /* <-----
                              updating variable is changing types through out the application 
                              runtime from a boolean, null, and function. <.< 
                              TODO: refactor to have a consistent type 
                            */
                        
    // creating a reference for the instance name element to read its value
    this.refInputInstance = React.createRef();
    this.loadAllInstances = this.loadAllInstances.bind(this)
    this.saveInstance = this.saveInstance.bind(this)
    this.loadStateFromInstance = this.loadStateFromInstance.bind(this)
    this.instanceButtons = this.instanceButtons.bind(this)

    // state will be read at custom mode setState of App component to send to the websocket server
    this.state = {
      tables: {},
      instances: []
    };
  }

  // handles some undo/redo logic... more investigation needed
  setState(...args) {
    // the state variable eventually will hold state that will be called by super.setState()
    let state, callback;
    let historic = false; // flag that is set when the state should be stored in the past?
    let external = false; // flag that is set when we what to send the state to the web socket server
    
    if (args.length === 1 && typeof args[0] === 'number') {
      // if only a number was passed then we are going through the history of past and future
      // the number if positive will go forward in history, and backwards in history if negative
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
      // not historic and an object has been passdown and args[1] flag
      // tells us if we want to send the state to the websocket server
      external = true;
      state = args[0];
    } else if (typeof args[0] === 'object') {
      state = args.pop();
      callback = args.pop();
    }

    if (!historic && !state.instances) { // if nots historic the code will try to push a snapshot on the array
      if (!this.updating) {
        const snapshot = this.snapshot();
        this.updating = onPause(500, () => { /* updating is now holding a method, i.e. witchcraft */
          this.future = [];
          this.past.push(snapshot);
          this.updating = null;
        });
      } else {
        this.updating();
      }
    }


    if (state) { // make sure we have state to send to react setState
      return super.setState(state, (...args) => {
        if (!external) { // read flag if we need to send this to the websocket server aswell
          this.session.sync(this.state);
        }
        if (callback) { /* not sure what callbacks are about here */
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
      /* add event listeners on the mouse so we can keep tracks of its state and send to websocket server */
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
    /* request instances from the server */
    fetch('/saved', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then((res) => {
      return res.json();
    }).then( (objects) => {
      /* if request valid the server sends an array of instance objects */
      const instances = objects.map((obj) => {
        const { savedstate } = obj;
        const { currentState, pastState, futureState } = savedstate;
        return { instanceName: obj.name, currentState, pastState, futureState };
      })
      this.setState({instances}); /* update the state with newly objects */
    }).catch( () => alert('error loading instances from server'))
  }

  loadStateFromInstance = (e) => {
    /* 
      instance objects are stored in the state object of the component 
      find the instance of state that the user wants to load and sync the current state
      with the found state 
    */
    const instance = this.state.instances.find((el) => el.instanceName === e.target.value);
    this.past = instance.pastState;
    this.future = instance.futureState;
    this.setState({tables: instance.currentState.tables});
  }

  saveInstance = () => {
    /* save the current state of the application in an instance object */
    const savedObj = { // create instance
      instanceName: this.refInputInstance.current.value,
      currentState: {tables: this.state.tables}, /* TODO: change currentState to currentTables let alex know */
      pastState: this.past,
      futureState: this.future
    };
    fetch('/saved', {
      // post the object to the server, where the server will save that instance
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(savedObj)
    }).then((res) => {
      return res.json();
    }).then( () => {
      // on success update instances
      const instances = this.state.instances;
      instances.push(savedObj);
      this.setState({instances: instances});
    }).catch( () => alert('error saving instance!'));
  }

  instanceButtons = () => {
    /* creates the select drop down of options that represent loadable instances in the client */
    const options = this.state.instances.map((instance) => {
      console.log(instance.instanceName);
      return <option>{instance.instanceName}</option>
    });
    return <select onChange={this.loadStateFromInstance}>
      {options}
    </select>
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
          Saved Instances
          {this.instanceButtons()}
        </div>
         <UserControlPanel  loadAllInstances = {this.loadAllInstances} saveInstance = {this.saveInstance} loadStateFromInstance = {this.loadStateFromInstance}
                          instanceButtons = {this.instanceButtons} refInputInstance = {this.refInputInstance} instances = {this.state.instances}/>
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
