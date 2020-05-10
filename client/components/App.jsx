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
      fields: [
        {
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
        {
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
      ],
      position: { x: 200, y: 200 }
    }
  }
};

export default class App extends Container {
  constructor() {
    super();

    this.past = [];
    this.future = [];

    this.state = {
      tables: []
    };
  }

  setState(...args) {
    if (typeof args[args.length - 1] === 'object') {
      this.past.push(this.cloneState());
      this.future = [];
    }
    
    return super.setState(...args);
  }

  componentDidMount() {
    this.setState(EXAMPLE);
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
    let newtables = [ ...this.state.tables ];
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
      console.log( curPos);
      this.setState('tables', id, { position: curPos });
      window.removeEventListener('mousemove', startMove);
      window.removeEventListener('mouseup', endMove);
    };

    window.addEventListener('mousemove', startMove);
    window.addEventListener('mouseup', endMove);
  };
  linkManager = () => { 

  };

  undo = () => {
    const state = this.past.pop();
    if (state) {
      this.future.push(this.cloneState());
      super.setState(state);
    }
  };
  redo = () => {
    const state = this.future.pop();
    if (state) {
      this.past.push(this.cloneState());
      super.setState(state);
    }
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
      .catch(err => console.log(err));
  };

  render() {
    return (
      <div className='App'>
        <div className="toolbar">
          <button onClick={() => this.addTable()}>new table</button>
          <button onClick={() => this.toSql()}>export SQL</button>
          <button onClick={() => this.undo()}>undo</button>
          <button onClick={() => this.redo()}>redo</button>
        </div>
        <div className='tables'>
          {this.mapTables((table, id) =>
              <div ref={"wrapper"+id} style={{position: "absolute", left: table.position.x, top: table.position.y}}>
                <Table
                  key={"table"+id}
                  move={() => this.moveManager(id)}
                  remove={() => this.removeTable(id)}
                  update={this.setState('tables', id, this.validateTable)}
                  {...table} />
              </div>
          )}
        </div>
      </div>
    );
  }
}