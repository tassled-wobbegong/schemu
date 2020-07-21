import React from "react";
import { svgNode } from '../etc/util';

import '../styles/Handle.scss';

/** Handles are points between which connecting lines can be drawn. Handles take the following props:
 *  1) an 'id' string, which will be used as the DOM node's id and must be unique within the application.
 *  2) a 'target', which contains either the identity string of another Handle component, or an object containing x-y coordinates. A line will be rendered between each handle and the position of its target. 
 *  3) a 'payload' object, used to attach arbitrary data to the handle.
 *  4) an 'onChange' function(target, payload = null) that will be invoked whenever the target changes with either the new target as a position, or, if the user releases the mouse within another handle, the id and payload of that handle. */
export default class Handle extends React.Component {
  // draws an SVG line between the component's position and its target position.
  draw() {
    if (!this.props.id) {
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

      const arrowHead = svgNode('defs', {}, 
        svgNode('marker', {
            id: 'arrowhead',
            viewBox: "0 0 4 4",
            markerWidth: 4,
            markerHeight: 4, 
            markerUnits: 'strokeWidth',
            refX: 4,
            refY: 2,
            orient: 'auto'
          },
          svgNode('path', { 
            d: "M 0 0 L 4 2 L 0 4 z", 
            fill: this.props.lineColor 
          })
        )
      );
      const line = svgNode('line', {
        stroke: this.lineColor,
        'stroke-width': this.lineSize + "px",
        fill: 'transparent',
        x1: -o.x,
        y1: -o.y,
        x2: d.x - o.x,
        y2: d.y - o.y,
        'marker-end': 'url(#arrowhead)'
      });
      const svg = svgNode('svg', { 
        width: Math.abs(d.x) + this.lineSize,
        height: Math.abs(d.y) + this.lineSize
      });

      Object.assign(svg.style, {
        position: 'absolute',
        top: `${source.y + o.y + this.refs.container.offsetHeight / 2}px`,
        left: `${source.x + o.x + this.refs.container.offsetWidth / 2}px`,
        overflow: 'visible',
        pointerEvents: 'none'
      });
      svg.appendChild(arrowHead);
      svg.appendChild(line);
      svg.classList.add(this.props.id);
      document.body.appendChild(svg);
    }
  }
  // removes any SVG lines created by the component.
  erase() {
    document.body.querySelectorAll(`.${this.props.id}`).forEach(n => n.remove());
  }

  componentDidMount() {
    this.draw();
  }
  componentWillUpdate() {
    this.erase();
  }
  componentDidUpdate() {
    this.draw();
  }
  componentWillUnmount() {
    this.erase();
  }

  // initiate a drag and drop session. updates the components target position while the user drags, and invokes the callback function when the user releases within another Handle component.
  linkManager = (from) => {
    if (!this.props.id) {
      return;
    }

    const update = (ev) => {
      const target = ev.clientX ? ev : ev.touches[0];
      ev = { clientX: target.clientX, clientY: target.clientY };
      this.props.onChange({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', update);
    window.addEventListener('touchmove', update);

    const finalize = (to) => {
      let target;
      if (to.changedTouches) {
        const { clientX, clientY } = event.changedTouches[0];
        target = document.elementFromPoint(clientX, clientY);
      } else {
        target = to.target; 
      }

      const { id, dataset: { payload }} = target || {};

      if (!id || !payload) {
        this.props.onChange(null);
      } else {
        this.props.onChange(id, JSON.parse(payload));
      }
      
      window.removeEventListener('mouseup', finalize);
      window.removeEventListener('mousemove', update);

      window.removeEventListener('touchend', finalize);
      window.removeEventListener('touchmove', update);
    };
    window.addEventListener("mouseup", finalize);
    window.addEventListener("touchend", finalize);
  };
  
  render() {
    this.boxSize = this.props.boxSize || 10;
    this.lineSize = this.props.lineSize || 2;
    this.lineColor = this.props.lineColor || 'black';

    return (
      <div id={this.props.id}
        ref="container" 
        className='Handle' 
        onMouseDown={this.linkManager}
        onTouchStart={this.linkManager}
        data-payload={JSON.stringify(this.props.payload || {})}
        style={{position: 'relative'}}>	
      </div>
    );
  } 
}
