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
        <Handle payload={`${this.props.tableName}_${this.props.name}`} callback={(payload) => {
          const payloadArr = payload.split("_")
          console.log(payloadArr)
          this.props.update({foreignKey: {
            tableName: payloadArr[0],
            fieldName: payloadArr[1],
          }})
        }}/>
        <input type="text" className="inputs" name="name" value={this.props.name} onChange={this.handleChange} />
        <select value={this.props.type} name="type" onChange={this.handleChange} >
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
        <input type="text" className="inputs" name="length" value={this.props.length} onChange={this.handleChange}/>
        <input type="text" className="inputs" name="defaultValue"value={this.props.defaultValue} onChange={this.handleChange}/>
        <input type="text" className="inputs" name="checkCondition" value={this.props.checkCondition} onChange={this.handleChange}/>
        <input type="checkbox" name="primaryKey" checked={this.props.primaryKey} onChange={this.handleChange}/>
        <input type="checkbox" name="unique" checked={this.props.unique} onChange={this.handleChange}/>
        <input type="checkbox" name="notNull" checked={this.props.notNull} onChange={this.handleChange}/>
        <input class="text-box" className="inputs" type="text" name="foreignKey" value={`${this.props.foreignKey.tableName}_${this.props.foreignKey.fieldName}`} onChange={this.handleChange}/>
        {/* <button class="submit" type='submit'>Submit</button> */}
        <button className="RemoveField" onClick={this.props.removeField}>X</button>
        <Handle payload={`${this.props.tableName}_${this.props.name}`} callback={(payload) => {
          const payloadArr = payload.split("_")
          console.log(payloadArr)
          this.props.update({foreignKey: {
            tableName: payloadArr[0],
            fieldName: payloadArr[1],
          }})
        }}/>
      </form>
    )
  }
}



