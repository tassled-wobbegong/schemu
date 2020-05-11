import React from "react";
import Connector from './Connector.jsx';

export default class Handle extends React.Component {
  constructor() {
    super();
    
    this.state = { source: null, target: null };
  }

  linkManager = (from) => {
    this.setState( { source: { x:parseInt(from.target.style.left), y:parseInt(from.target.style.top) } });

    const update = (ev) => {
      this.setState({ target: { x:parseInt(ev.clientX), y:parseInt(ev.clientY) } });
    };
    window.addEventListener('mousemove', update);

    const finalize = (to) => {
      const payload = to.target.dataset.payload;
      if (payload && this.props.callback(payload)) {
        this.setState({ target: { x:parseInt(to.target.style.left), y:parseInt(to.target.style.top) } });
      } else {
        this.setState({ source: null, target: null });
      }
      window.removeEventListener('mouseup', finalize);
      window.removeEventListener('mousemove', update);
    };
    window.addEventListener("mouseup", finalize);
  };
  
  render() {
    const style = {
      position: 'absolute',
      width: '25px',
      height: '25px',
      backgroundColor: 'blue',
      top: this.props.pos.y,
      left: this.props.pos.x
    };

    let connector;
    let { source, target } = this.state;
    if (source && target) {
      const d = {
        x: target.x - source.x,
        y: target.y - source.y
      };
      const o = {
        x: d.x < 0 ? d.x : 0,
        y: d.y < 0 ? d.y : 0
      };
      connector = (
        <svg width={Math.abs(d.x)} height={Math.abs(d.y)} style={{position: 'absolute', top: o.y, left: o.x}}>
          <line x1={-o.x} y1={-o.y} x2={d.x - o.x} y2={d.y - o.y} stroke="red" stroke-width="2px" fill="transparent"/>
        </svg>
      ); 
    }

    return (
      <div style={style} onMouseDown={this.linkManager} data-payload={this.props.payload}>
        {connector}
      </div>
    );
  }
}
