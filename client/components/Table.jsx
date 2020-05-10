import Field from "./Field.jsx";
import React from "react";

export default function Table(props) {
  const fields = props.fields.map((el, i) => {
    return (
      <div>
        <Field
          key={i}
          {...el}
          update={props.update(fields, i)}
          removeField={() => removeField(i)}
        />
      </div>
    );
  });

  let newName;
  function handleChange(e) {
    newName = e.target.value;
    props.update({ name: newName });
  }
  function addField() {
    props.update({
      fields: [
        ...fields,
        {
          name: "id",
          type: "uuid",
          length: undefined,
          primaryKey: true,
          unique: false,
          notNull: false,
          defaultValue: "uuid_generate_v4()",
          checkCondition: null,
          foreignKey: null,
        },
      ],
    });
  }
  function removeField(i) {
    const field2 = props.fields.filter((el, ind) => ind !== i);
    props.update({
      fields: field2,
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
          <div class="column-header">Name</div>
          <div class="column-header">Type</div>
          <div class="column-header">Length</div>
          <div class="column-header">Default</div>
          <div class="column-header">Condition</div>
          <div class="column-header">P</div>
          <div class="column-header">U</div>
          <div class="column-header">R</div>
          <div class="column-header">Foreign Key</div>
          <div class="column-header">Update</div>
        </div>
        {fields}
      </div>
    </div>
  );
}
