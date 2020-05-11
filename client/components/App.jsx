import React from 'react';
import Container from './Container.jsx';

import Table from './Table.jsx';
import Connector from './Connector.jsx';

import './App.scss';

const EXAMPLE = {
  tables: {
    0: {
      name: 'users',
      constraints: [],
      fields: {
        3: {
          name: 'id',
          type: 'uuid',
          length: undefined,
          primaryKey: true,
          unique: false,
          notNull: false,
          defaultValue: 'uuid_generate_v4()',
          checkCondition: null,
          foreignKey: null
        },
        5: {
          name: 'username',
          type: 'varchar',
          length: 64,
          primaryKey: false,
          unique: true,
          notNull: true,
          defaultValue: null,
          checkCondition: null,
          foreignKey: null
        }
      },
      position: { x: 200, y: 200 }
    }
  }
};

export default class App extends Container {
  static Session(app) {
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

    socket.sync = (state) => socket.send(JSON.stringify(state)); 

    return socket;
  }
  constructor() {
    super();

    this.session = null;

    this.past = [];
    this.future = [];

    this.state = {
      tables: {}
    };
  }

  setState(...args) {
    let state, callback;
    let historic = false;
    let external = false;
    
    if (args.length === 1 && typeof args[0] === 'number') {
      historic = true;
      console.log(this.past);
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
      this.future = [];
      this.past.push(this.snapshot());
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
    this.session = App.Session(this);
  }

  addTable = () => {
    const id = parseInt(Object.keys(this.state.tables).pop()) + 1 || 1;

    const newTable = { 
      name: "table"+id,
      constraints: [], 
      fields: [], 
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
  mapTables = (transform) => {
    const tables = [];
    for (const id in this.state.tables) {
      const table = this.state.tables[id];
      tables.push(transform ? transform(table, id) : table);
    }
    return tables;
  };

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

      const el = this.refs[`wrapper${id}`];
      el.style.left = curPos.x+"px";
      el.style.top = curPos.y+"px";
    };
    const endMove = () => {
      this.delegate('tables', id)({ position: curPos });
      window.removeEventListener('mousemove', startMove);
      window.removeEventListener('mouseup', endMove);
    };

    window.addEventListener('mousemove', startMove);
    window.addEventListener('mouseup', endMove);
  };
  linkManager = () => { 

  };

  toSql = () => {
    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/plain"
      },
      body: JSON.stringify({ tables: this.state.tables })
    };

    fetch('/api/sql', options)
      .then(res => {
        return res.blob();
      })
      .then(blob => {
        const href = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = href;
        a.download = 'query.txt';
        a.click();
        a.href = '';
      })
      .catch(err => console.log(err));
  };

  render() {
    return (
      <div className='App'>
        <div className="title">NoMoreQuery.io</div>
        <div className="toolbar">
          <button onClick={() => this.addTable()}>new table</button>
          <button onClick={() => this.toSql()}>export SQL</button>
          <button onClick={() => this.setState(-1)}>undo</button>
          <button onClick={() => this.setState(1)}>redo</button>
        </div>
        <div className='tables'>
          {this.mapTables((table, id) =>
              <div ref={"wrapper"+id} style={{position: "absolute", left: table.position.x, top: table.position.y}}>
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