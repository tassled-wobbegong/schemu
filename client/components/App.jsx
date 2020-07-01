import React from 'react';
import Container from './Container.jsx';
import { downloadAsFile, toSql } from '../etc/util.js';
import Table from './Table.jsx';

import '../styles/App.scss';

/** Top-level component that manages all application state. Extends Container, which allows it to synce this state with a WebSocket server and access undo/redo functionality. */
export default class App extends Container {  
  state = {
    tables: {},
    showInfo: false
  };

  constructor() {
    const host = window.location.host !== 'localhost:8080' ? window.location.host : ''
    super(`ws://${host}/api/session${window.location.pathname}`);
  }

  addTable = () => {
    const id = parseInt(Object.keys(this.state.tables).pop()) + 1 || 1;
    const pos = id * 50 % window.innerWidth;
    this.setState({ 
      tables: { ...this.state.tables, [id]: Table.defaults(id, pos) }
    });
  }
  removeTable = (id) => {
    let newtables = { ...this.state.tables };
    delete newtables[id];
    this.setState({ tables: newtables });
  };
  /** Called when a table name is changed. Asserts that the table name is not already in use */
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

  /** Initiate a drag and drop session. Given a table id, updates the components position while the user drags. */
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

  /** Convert the current state to a SQL schema, and download it to the users filesystem. */
  toSql = () => {
    const data = new Blob(
      [ toSql(this.state.tables) ], 
      { type: 'text/plain' }
    );
    downloadAsFile(data, 'query.txt');
  };

  render() { 
    const tables = Object.entries(this.state.tables).map(([id, table]) =>
      <div key={"wrapper"+id} ref={"wrapper"+id} style={{position: "absolute", left: table.position.x, top: table.position.y}}>
        <Table
          key={"table"+id}
          move={() => this.moveManager(id)}
          remove={() => this.removeTable(id)}
          update={this.delegate('tables', id, this.validateTable)}
          {...table} />
      </div>
    );

    const popup = (
      <div className="popup" 
        style={{visibility: this.state.showInfo ? 'visible' : 'hidden'}} 
        onClick={() => this.setState({showInfo: false})}>
        <div onClick={(ev) => ev.stopPropagation()}>
          <h1>about</h1>
          <p>Schemu.net is an implementation of the open-source <a href="https://github.com/tassled-wobbegong/schemu">schemu</a> project.</p>
          <p>Built and maintained by Madison Brown, Henry Black, Derek Lauziere, and Egon Levy.</p>
          <p>Release under the MIT license.</p>
        </div>
      </div>
    );

    return (
      <div className='App'>
        <div className="title">
          <span className='logo'></span>
          schemu
        </div>
        <div className='icon info' onClick={() => this.setState({showInfo: true})}></div>
        <div className="toolbar">
          <button className="icon add" title="New Table" onClick={() => this.addTable()}></button>
          <button className="icon download" title="Export SQL" onClick={() => this.toSql()}></button>
          <button className="icon undo" title="Undo" onClick={() => this.step(-1)}></button>
          <button className="icon redo" title="Redo" onClick={() => this.step(1)}></button>
        </div>
        {popup}
        <div className='tables'>          
          {tables}
        </div>
      </div>
    );
  }
}