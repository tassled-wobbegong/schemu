import React, { Component } from 'react';
import Handle from './Handle.jsx';

import '../styles/Field.scss';

/** Represents a field in a table schema. Renders the passed-down props as an HTML form. When form values are changed, passes the changed values as key-value pairs on an object to a function ```props.update```.
 * @param {*} props See Field.defaults for the expected props structure.
 */
export default function Field(props) {
  // HTML event handler for form field changes
  const handleChange = (event) => {
    const change = {};
    const target = event.target;
    if (target.type === "checkbox") {
      change[target.name] = target.checked;
    } else {
      change[target.name] = target.value;
    }
    props.update(change)
  };

  // Updates the field's foreign key constraint. Called when a line is drawn between one of this field's handles, and some other field's handle. 
  const updateHandle = (prefix) => (target, payload) => {
    if (payload && payload.tableId === props.tableId && payload.fieldId === props.id) {
      target = null;
    }
    props.update("link")({ target, prefix });
  }; 

  // each field has two handles, one on the left and one on the right. When the user clicks in one handle and drags the mouse to another handle, the identity of the second handle will be passed to the initial handlers callback function. In this case, the identity of each handle stores its table and field names and well which side of the field it exists on. The callback function defines a foreign key constraint.
  const handles = ["l", "r"].map((prefix) =>
    <Handle id={`${prefix}_${props.tableId}_${props.id}`}
      target={prefix === props.link.prefix ? props.link.target : null} 
      payload={{ tableId: props.tableId, fieldId: props.id }}
      title='Create Foreign Key'
      onChange={updateHandle(prefix)} 
    />
  );

  const fields = {};
  ["name", "length", "defaultValue", "checkCondition"].forEach((name) => fields[name] = {
    name,
    type: "text",
    value: props[name],
    onChange: handleChange,
    autoComplete: "off"
  });
  ["primaryKey", "unique", "notNull"].forEach((name) => fields[name] = {
    name,
    className: "small",
    type: "checkbox",
    checked: props[name],
    onChange: handleChange
  });

  const types = [
    'bool', 'bytea', 'char', 'date', 'decimal', 'float4', 'float8', 'int', 
    'int2', 'int8', 'json', 'money', 'serial2', 'serial4', 'serial8', 'text', 
    'time', 'timetz', 'timestamptz', 'uuid', 'varbit', 'varchar', 'xml'
  ];
  const options = types.map((val) => (
    <option key={val} value={val}>val</option>
  ));
  fields.type = (
    <select value={props.type} name="type" onChange={handleChange}>
      {options}
    </select>
  );

  const remove = (
    <button className="small icon delete" onClick={props.removeField} title="Remove Field"></button>
  );

  return (
    <div className="Field">
      {handles[0]}
      <input {...fields.name} />
      {fields.type}
      {props.expanded ? <>
        <input {...fields.length} />
        <input {...fields.defaultValue} />
        <input {...fields.checkCondition} />
        <input {...fields.primaryKey} />
        <input {...fields.unique} />
        <input {...fields.notNull} />
        {remove}
      </> : null}
      {handles[1]}
    </div>
  );
}

// default properties of a new field
Field.defaults = (id) => ({
  id: id,
  name: `field${id}`,
  type: "",
  length: "",
  primaryKey: false,
  unique: false,
  notNull: false,
  defaultValue: "",
  checkCondition: "",
  link: {
    target: null,
    prefix: null
  }
});
