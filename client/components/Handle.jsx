import React from "react";
import Connector from './Connector.jsx';

export default class Handle extends React.Component {
  constructor() {
    super();
    
    this.state = { source: null, target: null };
  }

  linkManager = (from) => {
    this.setState( { source: { x: from.target.offsetLeft, y: from.target.offsetTop } });

    const update = (ev) => {
      this.setState({ target: { x: ev.clientX, y: ev.clientY } });
    };
    window.addEventListener('mousemove', update);

    const finalize = (to) => {
      const payload = to.target.dataset.payload;
      if (payload && this.props.callback(payload)) {
        this.setState({ target: { x: to.target.offsetLeft, y: to.target.offsetTop } });
      } else {
        this.setState({ source: null, target: null });
      }
      window.removeEventListener('mouseup', finalize);
      window.removeEventListener('mousemove', update);
    };
    window.addEventListener("mouseup", finalize);
  };
  
  render() {
    const boxSize = 10;
    const strokeWidth = 2;
    const boxStyle = {
      position: 'relative',
      width: boxSize + 'px',
      height: boxSize + 'px',
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

      const strokeStyle = {
        position: 'absolute', 
        top: o.y + boxSize / 2, 
        left: o.x + boxSize / 2
      };

      connector = (
        <svg width={Math.abs(d.x) + strokeWidth} height={Math.abs(d.y) + strokeWidth} style={strokeStyle}>
          <line x1={-o.x} y1={-o.y} x2={d.x - o.x} y2={d.y - o.y} stroke="red" strokeWidth={strokeWidth+"px"} fill="transparent"/>
        </svg>
      ); 
    }

    return (
      <div className='handle' style={boxStyle} onMouseDown={this.linkManager} data-payload={this.props.payload}>
        {connector}
      </div>
    );
  }
}
