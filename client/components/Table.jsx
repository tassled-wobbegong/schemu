import Field from "./Field.jsx";
import React from "react";

export default function Table(props) {
  const fields = [];
  for (let id in props.fields) {
    const el = props.fields[id];
    fields.push(
      <div>
        <Field
          key={"field"+id}
          {...el}
          update={props.update("fields", id)}
          removeField={() => removeField(id)}
          tableName={props.name}
        />
      </div>
    );
  }

  let newName;
  function handleChange(e) {
    newName = e.target.value;
    props.update({ name: newName });
  }
  function addField() {
    const id = parseInt(Object.keys(props.fields).pop()) + 1 || 1;
    props.update({
      fields: {
        ...props.fields,
        [id]: {
          name: "id",
          type: "uuid",
          length: undefined,
          primaryKey: true,
          unique: false,
          notNull: false,
          defaultValue: "uuid_generate_v4()",
          checkCondition: null,
          foreignKey: {
            tableName: null,
            fieldName: null,
          },
        },
      }
    });
  }
  function removeField(id) {
    const newFields = { ...props.fields };
    console.log(id);
    delete newFields[id];
    props.update({
      fields: newFields
    });
  }

  return (
    <div id="tables">
      <div id="TableName">{props.name}</div>
      <input type="text" id="Rename" onChange={handleChange}></input>

      <button className="fieldButtons" onMouseDown={props.move}>
        Move
      </button>
      <button className="fieldButtons" onClick={addField}>
        Add Field
      </button>

      <div className="fieldsList">
        <div class="row">
          <div></div>
          <div class="column-header">Name</div>
          <div class="column-header">Type</div>
          <div class="column-header">Length</div>
          <div class="column-header">Default</div>
          <div class="column-header">Condition</div>
          <div class="column-header">P</div>
          <div class="column-header">U</div>
          <div class="column-header">R</div>
          <div class="column-header">F-Key</div>
          <div></div>
        </div>
        {fields}
      </div>
    </div>
  );
}
