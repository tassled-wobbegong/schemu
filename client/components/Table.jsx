import Field from "./Field.jsx";
import React from "react";

export default function Table(props) {
  const fields = props.fields.map((el, i) => {
    return (
      <div>
        <Field key={i} {...el} />
        <button className="RemoveField" onClick={props.remove}>
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

  return (
    <div>
      <div id="TableName">{props.name}</div>
      <input type="text" id="Rename" onChange={handleChange}></input>

      <button className="moveBox" onClick={props.move}>
        Move
      </button>
      <button className="addField" onClick={addField}>
        Add Field
      </button>
      <div className="fieldsList">{fields}</div>
    </div>
  );
}
