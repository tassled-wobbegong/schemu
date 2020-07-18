import React from 'react';
import Container from './Container.jsx';
import { downloadAsFile, toSql } from '../etc/util.js';
import Table from './Table.jsx';
import Popup from './Popup.jsx';

import '../styles/App.scss';

/** Top-level component that manages all application state. Extends Container, which allows it to synce this state with a WebSocket server and access undo/redo functionality. */
export default class App extends Container {  
  state = { 
    tables: {}, 
    showInfo: false
  };

  constructor() {
    const scheme = window.location.host.includes('localhost') ? 'ws' : 'wss';
    super(`${scheme}://${window.location.host}/live/session${window.location.pathname}`);
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
      const target = ev.clientX ? ev : ev.touches[0];
      ev = { clientX: target.clientX, clientY: target.clientY };

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

      window.removeEventListener('touchmove', startMove);
      window.removeEventListener('touchend', endMove);
    };

    window.addEventListener('mousemove', startMove);
    window.addEventListener('mouseup', endMove);

    window.addEventListener('touchmove', startMove);
    window.addEventListener('touchend', endMove);
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
    const initialized = window.location.pathname !== '/';

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

    const startSession = () => {
      fetch('/api/session', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => window.location.href = data.session_id);
    };

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
        <Popup title='welcome' cta='Get Started' hidden={initialized} onAccept={startSession}>
          <p><b>Schemu</b> is an interactive tool used by teams of developers to collaboratively design PostgresQL database schemas.</p>
          <p>You will be assigned a secure URL that you and your teammates can access in order to interact with your project in real-time.</p>
        </Popup>
        <Popup title='about' hidden={!this.state.showInfo} onClose={() => this.setState({showInfo: false})}>
          <p>Schemu.net is an implementation of the open-source <a href="https://github.com/tassled-wobbegong/schemu">Schemu</a> project, built and maintained by Madison Brown, Henry Black, Derek Lauziere, and Egon Levy.</p>
          <p>Released under the MIT license.</p>
        </Popup>
        <div className='tables'>          
          {tables}
        </div>
      </div>
    );
  }
}