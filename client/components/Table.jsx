import Field from "/Field.jsx";

export default function FieldContainer() {
  const fields = this.props.fields.map((el, i) => {
    return <Field key={i} info={el} props={this.props} />;
  });

  return (
    <div>
      <div id="TableName">{props.name}</div>
      <button className="changeName" onClick={props.update(name)}>
        Change Name
      </button>
      <button className="moveBox" onClick={props.move()}>
        Move
      </button>
      <button className="addField" onClick={props.add()}>
        Add Field
      </button>
      <div className="fieldsGoHere">{fields}</div>
      <button className="RemoveField" onClick={props.remove(i)}>
        Remove Field
      </button>
    </div>
  );
}
