import React, { Component } from 'react'

// A field, recieves an Object with the following format:
// {
//   name: 'id',
//   type: 'uuid',
//   length: undefined,
//   primaryKey: true,
//   unique: false,
//   notNull: false,
//   defaultValue: 'uuid_generate_v4()',
//   checkCondition: null,
//   foreignKey: null
// }

// // Basic styling
// .field-container {
//   width: 100%;
//   display: flex;
//   height: 50px; //?
// }

// .field-prop {
//   text-align: center;
//   verticle-align: middle;
// }


export default class Field extends Component {
  constructor(props){
    super(props);

    const { update, ...receivedState} = props;
    this.state = receivedState;
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let change = {};
    if (event.target.type === "checkbox") {
      change[event.target.id] = event.target.checked;
    } else {
      change[event.target.id] = event.target.value;
    }
    // this.setState(change);
    console.log(change)
    this.props.update(change)
  }

  render() {
    return (
      <form className="row" onSubmit={(event) => {
          // event.preventDefault();
          // this.props.update(this.state); 
        }}>
        <input type="text" name="name" id="name" value={this.props.name} onChange={this.handleChange} />
        <select value={this.props.type} name="type" id="type" onChange={this.handleChange} >
          <option value="boolean">Boolean</option>
          <option value="date">Date</option>
          <option value="integer">Integer</option>
          <option value="json">JSON</option>
          <option value="money">Money</option>
          <option value="text">Text</option>
          <option value="time">Time</option>
          <option value="timestamp">Timestamp</option>
          <option value="uuid">UUID</option>
        </select>
        <input type="text" name="length" id="length" value={this.props.length} onChange={this.handleChange}/>
        <input type="text" name="defaultValue" id="defaultValue"value={this.props.defaultValue} onChange={this.handleChange}/>
        <input type="text" name="checkCondition" id="checkCondition" value={this.props.checkCondition} onChange={this.handleChange}/>
        <input type="checkbox" id="primaryKey" name="primaryKey" checked={this.props.primaryKey} onChange={this.handleChange}/>
        <input type="checkbox" id="unique" name="unique" checked={this.props.unique} onChange={this.handleChange}/>
        <input type="checkbox" id="notNull" name="notNull" checked={this.props.notNull} onChange={this.handleChange}/>
        <input class="text-box" type="text" name="foreignKey" id="foreignKey" value={this.props.foreignKey} onChange={this.handleChange}/>
        {/* <button class="submit" type='submit'>Submit</button> */}
        <button className="RemoveField" onClick={this.props.removeField}>X</button>
      </form>
    )
  }
}



