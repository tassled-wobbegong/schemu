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
    if (payload) {
      if (payload.tableName === props.tableName && payload.fieldName === props.name) {
        target = null;
      } else {
        props.update({ foreignKey: payload });
      } 
    }

    if (target === null) {
      const { foreignKey } = Field.defaults();
      props.update({ foreignKey });
    }

    props.update("link", prefix)({ target });
  }; 

  // each field has two handles, one on the left and one on the right. When the user clicks in one handle and drags the mouse to another handle, the identity of the second handle will be passed to the initial handlers callback function. In this case, the identity of each handle stores its table and field names and well which side of the field it exists on. The callback function defines a foreign key constraint.
  const tableName = props.tableName;
  const fieldName = props.name;
  const handles = ["l", "r"].map((prefix) =>
    <Handle id={`${prefix}_${tableName}_${fieldName}`}
      target={props.link[prefix].target} 
      payload={{ tableName, fieldName }}
      onChange={updateHandle(prefix)} 
    />
  );
  
  // the foreign key constraint for the field composed of two properties on the props.foreignKey object.
  const { tableName: ftable, fieldName: ffield } = props.foreignKey;
  const data = { ...props, foreignKey: ftable ? `${ftable}.${ffield}` : "" };

  const fields = {};
  ["name", "length", "defaultValue", "checkCondition", "foreignKey"].forEach((name) => fields[name] = {
    type: "text",
    name,
    value: data[name],
    onChange: handleChange,
    autoComplete: "off"
  });
  ["primaryKey", "unique", "notNull"].forEach((name) => fields[name] = {
    className: "small",
    type: "checkbox",
    name,
    checked: data[name],
    onChange: handleChange
  });
  fields.type = (
    <select value={data.type} name="type" onChange={handleChange}>
      <option value="bool">bool</option>
      <option value="bytea">bytea</option>
      <option value="char">char</option>
      <option value="date">date</option>
      <option value="decimal">decimal</option>
      <option value="float4">float4</option>
      <option value="float8">float8</option>
      <option value="int">int</option>
      <option value="int2">int2</option>
      <option value="int8">int8</option>
      <option value="json">json</option>
      <option value="money">money</option>
      <option value="serial2">serial2</option>
      <option value="serial4">serial4</option>
      <option value="serial8">serial8</option>
      <option value="text">text</option>
      <option value="time">time</option>
      <option value="timetz">timetz</option>
      <option value="timestamptz">timestamptz</option>
      <option value="uuid">uuid</option>
      <option value="varbit">varbit</option>
      <option value="varchar">varchar</option>
      <option value="xml">xml</option>
    </select>
  );

  const remove = (
    <button className="small icon delete" onClick={data.removeField} title="Remove Field"></button>
  );

  return (
    <div className="Field">
      {handles[0]}
      <input {...fields.name} />
      <input {...fields.type} />
      {props.expanded ? <>
        <input {...fields.length} />
        <input {...fields.defaultValue} />
        <input {...fields.checkCondition} />
        <input {...fields.primaryKey} />
        <input {...fields.unique} />
        <input {...fields.notNull} />
        <input {...fields.foreignKey} />
        {remove}
      </> : null}
      {handles[1]}
    </div>
  );
}

// default properties of a new field
Field.defaults = (id) => ({
  name: `field${id}`,
  type: "",
  length: "",
  primaryKey: false,
  unique: false,
  notNull: false,
  defaultValue: "",
  checkCondition: "",
  foreignKey: {
    tableName: "",
    fieldName: "",
  },
  link: {
    l: {},
    r: {}
  }
});
