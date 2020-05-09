import React from 'react';
import Container from './Container.jsx';

import Table from './Table.jsx';
import Connector from './Connector.jsx';

import './App.scss';

const EXAMPLE = {
  tables: [
    {
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
      ]
    }
  ],
  positions: [
    { x: 200, y: 200 }
  ]
};

export default class App extends Container {
  constructor() {
    super();

    this.state = {
      tables: [],
      positions: []
    };
  }

  componentDidMount() {
    this.setState(EXAMPLE);
  }

  validateTable = (delta, path) => {
    if (delta.name) {
      for (let table of this.state.tables) {
        if (table.name === delta.name) {
          throw new Error(`Cannot rename table '${table.name}' to '${delta.name}' because the name is already in use.`)
        }
      }
    }
    return true;
  }

  addTable = (name = null) => {
    const newTable = { 
      name: "",
      constraints: [], 
      fields: [] 
    };
    this.setState({ 
      tables: [ ...this.state.tables, newTable ],
      positions: [ ...this.state.positions, { x: 0, y: 0 } ]
    });
  }
  removeTable = (index) => {
    let newtables = [ ...this.state.tables ];
    delete newtables[index];
    this.setState({ tables: newtables });
  };
  getTables = (transform) => {
    const tables = [];
    for (let index in this.state.tables) {
      const el = this.state.tables[index];
      if (el) {
        tables.push(transform ? transform(el, index) : el);
      }
    }
    return tables;
  };

  toSql = () => {
    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/plain"
      },
      body: JSON.stringify({ tables: this.getTables() })
    };

    fetch('/api/sql', options)
      .catch(err => console.log(err));
  };

  moveManager = (index) => {
    let lastEv;
    const  moveTable = (ev) => {
      if (!lastEv) {
        lastEv = ev;
      }

      const curPos = this.state.positions[index];        
      const newPos = {
        x: curPos.x + (ev.clientX - lastEv.clientX),
        y: curPos.y + (ev.clientY - lastEv.clientY)
      };
      lastEv = ev;
      
      this.setState('positions', index, newPos);
    };

    window.addEventListener('mousemove', moveTable);
    window.addEventListener('mouseup', (ev) => {
      window.removeEventListener('mousemove', moveTable);
    });
  };

  render() {
    return (
      <div className='App'>
        <div className="toolbar">
          <button onClick={() => this.addTable()}>new table</button>
          <button onClick={() => this.toSql()}>export SQL</button>
        </div>
        <div className='tables'>
          {this.getTables((table, index) => 
            <div style={{position: "absolute", left: this.state.positions[index].x, top: this.state.positions[index].y}}>
              <Table
                key={index}
                move={() => this.moveManager(index)}
                remove={() => this.removeTable(index)}
                update={this.setState('tables', index, this.validateTable)}
                {...table} />
            </div>    
          )}
        </div>
      </div>
    );
  }
}