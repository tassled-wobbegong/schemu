import Field from "./Field.jsx";
import React from "react";

export default function Table(props) {
  const changeName = (event) => {
    props.update({ name: event.target.value });
  }
  const addField = () => {
    const id = parseInt(Object.keys(props.fields).pop()) + 1 || 1;
    props.update("fields")({
      [id]: Field.defaults(id),
    });
  }
  const removeField = (id) => {
    const fields = { ...props.fields };
    delete fields[id];
    props.update({ fields });
  }
  const validateField = (delta, path) => {
    if (delta.name) {
      for (const id in props.fields) {
        const field = props.fields[id];
        if (field.name === delta.name) {
          throw new Error(`Cannot rename table '${field.name}' to '${delta.name}' because the name is already in use.`)
        }
      }
    }
    return true;
  }

  return (
    <div id="tables" onMouseDown={props.move}>
      <input type="text" id="Rename" value={props.name} onChange={changeName}></input>
      <button className="fieldButtons" id="addtable" onClick={addField}>+</button>
      <button className="removeTable" id="removetable" onClick={props.remove}>X</button>
      <div className="fieldsList" onMouseDown={(ev) => ev.stopPropagation()}>
        <div className="row">
          <div></div>
          <div className="column-header">Name</div>
          <div className="column-header">Type</div>
          <div className="column-header">Length</div>
          <div className="column-header">Default</div>
          <div className="column-header">Condition</div>
          <div className="column-header">P</div>
          <div className="column-header">U</div>
          <div className="column-header">R</div>
          <div className="column-header">F-Key</div>
          <div></div>
        </div>
        {Object.keys(props.fields).map((id) =>
          <Field {...props.fields[id]}
            update={props.update("fields", id, validateField)}
            removeField={() => removeField(id)}
            tableName={props.name} />)}
      </div>
    </div>
  );
}

Table.defaults = (id, x, y = x) => ({ 
  name: `table${id}`,
  constraints: [], 
  fields: {}, 
  position: { x, y }
});