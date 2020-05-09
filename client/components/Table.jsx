import Field from "./Field.jsx";
import React from "react";

export default function Table(props) {
  const fields = props.fields.map((el, i) => {
    return (
      <div>
        <Field key={i} {...el} update={props.update(fields, i)} />
        <button className="RemoveField" onClick={() => removeField(i)}>
          Remove Field
        </button>
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
      <div className="fieldButtons">{fields}</div>
    </div>
  );
}
