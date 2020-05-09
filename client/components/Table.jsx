export default function FieldContainer() {
  const elements = this.props.fields.map((el, i) => {
    return <TableStuff key={i} info={el} />;
  });

  return (
    <div>
      <div id="TableName">{props.name}</div>
      <button className="changeName" onClick={props.update(name)}>
        Change Name
      </button>
      <button className="moveBox" onClick={props.move}>
        Move
      </button>
      <button className="addField" onClick={props.add}>
        Add Field
      </button>
      <div className="fieldsGoHere">{fields}</div>
      <button className="RemoveField" onClick={props.remove}>
        Remove Field
      </button>
    </div>
  );
}
