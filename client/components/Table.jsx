import React from "react";
import Field from "./Field.jsx";

import '../styles/Table.scss';

/** Represents a SQL table schema. 
 * @param {*} props See Table.defaults for the expected props structure. 
 */
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
  // Called when a field name is changes. Asserts that the field name is not already used within the table.
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

  const fields = Object.keys(props.fields).map((id) =>
    <Field {...props.fields[id]}
      key={`field${id}`}
      update={props.update("fields", id, validateField)}
      removeField={() => removeField(id)}
      tableName={props.name} 
      expanded={props.expanded} />
  );

  const labels = ['', 'Name', 'Type', ''];
  if (props.expanded) {
    labels.splice(3, 0, 'Length', 'Default', 'Cond.', 'P', 'U', 'R', 'F. Key', '');
  }

  const edit = (
    <button className={props.expanded ? 'icon check' : 'icon edit'} 
      title={props.expanded ? "Hide Details" : "Show Details"}
      onClick={() => props.update({expanded: !props.expanded})}>
    </button>
  );

  return (
    <div className="Table">
      <div>
        <input className="tableName" type="text" size='1' value={props.name} onChange={changeName} autoComplete="off"></input>
        {edit}
        <button className='icon add' title="Add Field" onClick={addField}></button>
        <button className='icon delete' title="Delete Table" onClick={props.remove}></button>
        <button className='icon move' title="Drag Table" onMouseDown={props.move} onTouchStart={props.move}></button>
      </div>
      <div className='labels'>
        {labels.map((label) => <span className={label.length < 2 ? "small" : null}>{label}</span>)}
      </div>
      {fields}
    </div>
  );
}

Table.defaults = (id, x, y = x) => ({ 
  name: `table${id}`,
  expanded: false,
  constraints: [], 
  fields: {
    1: Field.defaults(1)
  }, 
  position: { x, y }
});