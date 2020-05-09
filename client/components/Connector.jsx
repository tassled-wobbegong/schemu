import React from "react";

export default function Connector(props) {
  const { from, to } = props;
  return (
    <svg width={to.x - from.x} height={to.y - from.y} style={{position: 'absolute', top: from.y, left: from.x}}>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="black" fill="transparent"/>
    </svg>
  );
}
