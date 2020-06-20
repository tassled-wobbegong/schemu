import React from 'react';
import Container from './Container.jsx';

import { downloadAsFile, toSql } from './util.js';
import Table from './Table.jsx';

import './App.scss';

export default class App extends Container {  
  state = {
    tables: {}
  };

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

      this.delegate('tables', id)({ position: curPos });
    };
    const endMove = () => {
      window.removeEventListener('mousemove', startMove);
      window.removeEventListener('mouseup', endMove);
    };

    window.addEventListener('mousemove', startMove);
    window.addEventListener('mouseup', endMove);
  };

  toSql = () => {
    const data = new Blob(
      [ toSql(this.state.tables) ], 
      { type: 'text/plain' }
    );
    downloadAsFile(data, 'query.txt');
  };

  render() {
    return (
      <div className='App'>
        <div className="title">NoMoreQuery.io</div>
        <div className="toolbar">
          <button onClick={() => this.addTable()}>New Table</button>
          <button onClick={() => this.toSql()}>Export SQL</button>
          <button onClick={() => this.step(-1)}>Undo</button>
          <button onClick={() => this.step(1)}>Redo</button>
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