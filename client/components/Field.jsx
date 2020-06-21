import React, { Component } from 'react';
import Handle from './Handle.jsx';

export default function Field(props) {
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

  const setIdentity = (prefix) => (identity) => {
    const [ _prefix, tableName, fieldName] = identity.split("_");

    if (tableName === props.tableName && fieldName === props.name) {
      return false;
    }

    props.update({
      foreignKey: { tableName, fieldName }
    });
    props.update("link", prefix)({ 
      target: identity 
    });

    return true;
  };

  const identity = `${props.tableName}_${props.name}`;
  const handles = ["l", "r"].map((prefix) =>
    <Handle target={props.link[prefix].target} 
      update={props.update("link", prefix)} 
      identity={`${prefix}_${identity}`} 
      callback={setIdentity(prefix)}/>);
  
  const { tableName: ftable, fieldName: ffield } = props.foreignKey;
  const data = { ...props, foreignKey: ftable ? `${ftable}.${ffield}` : "" };

  const fields = {};
  ["name", "length", "defaultValue", "checkCondition", "foreignKey"].forEach((name) => fields[name] = 
    <input className="inputs" type="text" name={name} value={data[name]} onChange={handleChange} />);
  ["primaryKey", "unique", "notNull"].forEach((name) => fields[name] = 
    <input type="checkbox" name={name} checked={data[name]} onChange={handleChange}/>);
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

  const remove = 
    <button className="RemoveField" onClick={data.removeField}>X</button>;

  return (
    <form className="row">
      {handles[0]}
      {fields.name}
      {fields.type}
      {fields.length}
      {fields.defaultValue}
      {fields.checkCondition}
      {fields.primaryKey}
      {fields.unique}
      {fields.notNull}
      {fields.foreignKey}
      {remove}
      {handles[1]}
    </form>
  );
}

Field.defaults = (id) => ({
  id: `field${id}`,
  name: "",
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
