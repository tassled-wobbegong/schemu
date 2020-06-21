import React from "react";

export default class Handle extends React.Component {
  componentDidUpdate() {
    this.refs.container.querySelectorAll('*').forEach(n => n.remove());

    if (!this.props.identity) {
      return;
    }

    let source = this.refs.container.getBoundingClientRect();
    source = { x: source.left, y: source.top };

    let target = this.props.target;
    if (typeof target === "string" && (target = document.getElementById(target))) {
      target = target.getBoundingClientRect();
      target = { x: target.left, y: target.top };
    }

    if (source && target) {
      const d = {
        x: target.x - source.x,
        y: target.y - source.y
      };
      const o = {
        x: d.x < 0 ? d.x : 0,
        y: d.y < 0 ? d.y : 0
      };

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', Math.abs(d.x) + this.lineSize);
      svg.setAttribute('height', Math.abs(d.y) + this.lineSize);
      svg.style.position = 'absolute';
      svg.style.top = o.y + this.boxSize / 2;
      svg.style.left = o.x + this.boxSize / 2;

      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', this.lineColor);
      line.setAttribute('stroke-width', this.lineSize + "px");
      line.setAttribute('fill', 'transparent');
      line.setAttribute('x1', -o.x);
      line.setAttribute('y1', -o.y);
      line.setAttribute('x2', d.x - o.x);
      line.setAttribute('y2', d.y - o.y);
      
      svg.appendChild(line);
      this.refs.container.appendChild(svg);
    }
  }

  linkManager = (from) => {
    if (!this.props.identity) {
      return;
    }

    const update = (ev) => {
      this.props.update({ target: { x: ev.clientX, y: ev.clientY } });
    };
    window.addEventListener('mousemove', update);

    const finalize = (to) => {
      const id = to.target.id;
      if (id && this.props.callback(id)) {
        this.props.update({ target: id });
      } else {
        this.props.update({ target: null });
      }
      window.removeEventListener('mouseup', finalize);
      window.removeEventListener('mousemove', update);
    };
    window.addEventListener("mouseup", finalize);
  };
  
  render() {
    this.boxSize = this.props.boxSize || 10;
    this.lineSize = this.props.lineSize || 2;
    this.lineColor = this.props.lineColor || 'red';

    return (
      <div ref="container" 
        className='handle' 
        id={this.props.identity} 
        onMouseDown={this.linkManager}
        style={{position: 'relative', width: this.boxSize + 'px', height: this.boxSize + 'px'}}></div>
    );
  }
}
