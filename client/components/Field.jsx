import React, { Component } from 'react';
import Handle from './Handle.jsx';

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

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let change = {};
    if (event.target.type === "checkbox") {
      change[event.target.name] = event.target.checked;
    } else {
      change[event.target.name] = event.target.value;
    }
    this.props.update(change)
  }

  render() {
    return (
      
      <form className="row">
        <Handle identity={`${this.props.tableName}_${this.props.name}`} callback={(indentity) => {
          const indentityArr = indentity.split("_")
          console.log(indentityArr)
          this.props.update({foreignKey: {
            tableName: indentityArr[0],
            fieldName: indentityArr[1],
          }})
        }}/>
        <input type="text" className="inputs" name="name" value={this.props.name} onChange={this.handleChange} />
        <select value={this.props.type} name="type" onChange={this.handleChange} >
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
        <input type="text" className="inputs" name="length" value={this.props.length} onChange={this.handleChange}/>
        <input type="text" className="inputs" name="defaultValue"value={this.props.defaultValue} onChange={this.handleChange}/>
        <input type="text" className="inputs" name="checkCondition" value={this.props.checkCondition} onChange={this.handleChange}/>
        <input type="checkbox" name="primaryKey" checked={this.props.primaryKey} onChange={this.handleChange}/>
        <input type="checkbox" name="unique" checked={this.props.unique} onChange={this.handleChange}/>
        <input type="checkbox" name="notNull" checked={this.props.notNull} onChange={this.handleChange}/>
        <input className="text-box" className="inputs" type="text" name="foreignKey" value={`${this.props.foreignKey.tableName}_${this.props.foreignKey.fieldName}`} onChange={this.handleChange}/>
        {/* <button class="submit" type='submit'>Submit</button> */}
        <button className="RemoveField" onClick={this.props.removeField}>X</button>
        <Handle identity={`${this.props.tableName}_${this.props.name}`} callback={(indentity) => {
          const indentityArr = indentity.split("_")
          this.props.update({foreignKey: {
            tableName: indentityArr[0],
            fieldName: indentityArr[1],
          }})
          return true;
        }}/>
      </form>
    )
  }
}



