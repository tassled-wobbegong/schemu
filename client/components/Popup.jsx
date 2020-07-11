import React from "react";

import '../styles/Popup.scss';

/**  Renders a popup dialog. */
export default function Popup(props) {
  return (
    <div className='Popup' style={{visibility: props.hidden ? 'hidden' : 'visible'}}>
      <div onClick={(ev) => ev.stopPropagation()}>
        {props.onClose ? <div className='icon delete' onClick={props.onClose}></div> : null}
        <h1>{props.title}</h1>
        {props.children}
        {props.cta ? <button className="accept" onClick={props.onAccept}>{props.cta}</button> : null}
      </div>
    </div>
  );
}