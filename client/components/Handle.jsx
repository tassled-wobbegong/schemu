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

      const line = svgNode('line', {
        stroke: this.lineColor,
        'stroke-width': this.lineSize + "px",
        fill: 'transparent',
        x1: -o.x,
        y1: -o.y,
        x2: d.x - o.x,
        y2: d.y - o.y
      });
      const svg = svgNode('svg', { 
        width: Math.abs(d.x) + this.lineSize,
        height: Math.abs(d.y) + this.lineSize
      });
      Object.assign(svg.style, {
        position: 'absolute',
        top: source.y + o.y + this.refs.container.offsetHeight / 2,
        left: source.x + o.x + this.refs.container.offsetWidth / 2,
        pointerEvents: 'none'
      });
      svg.appendChild(line);
      svg.classList.add(this.props.id);
      document.body.appendChild(svg);
    }
  }
  // removes any SVG lines created by the component.
  erase() {
    document.body.querySelectorAll(`.${this.props.id}`).forEach(n => n.remove());
  }

  // When ever the state of the component changes (i.e. it's target position changes), redraw its SVG connecting lines
  componentDidUpdate() {
    this.erase();
    this.draw();
  }
  // Cleanup any remaining lines before unmounting
  componentWillUnmount() {
    this.erase();
  }

  // initiate a drag and drop session. updates the components target position while the user drags, and invokes the callback function when the user releases within another Handle component.
  linkManager = (from) => {
    if (!this.props.id) {
      return;
    }

    const update = (ev) => {
      this.props.onChange({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', update);

    const finalize = (to) => {
      const { id, dataset: { payload }} = to.target;

      if (!id || !payload) {
        this.props.onChange(null);
      } else {
        this.props.onChange(id, JSON.parse(payload));
      }
      
      window.removeEventListener('mouseup', finalize);
      window.removeEventListener('mousemove', update);
    };
    window.addEventListener("mouseup", finalize);
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
        data-payload={JSON.stringify(this.props.payload || {})}
        style={{position: 'relative'}}>
          &#9675;	
      </div>
    );
  } 
}
