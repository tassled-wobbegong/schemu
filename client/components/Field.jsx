import React, { Component } from 'react';
import Handle from './Handle.jsx';

export default class Field extends Component {
  constructor(props){
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  // pulls input from field and passes to update function to update global state
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
    let foreignKeyValue = this.props.foreignKey.tableName ? `${this.props.foreignKey.tableName}_${this.props.foreignKey.fieldName}` : ""


    return (
      
      <form className="row">
        <Handle identity={`l_${this.props.tableName}_${this.props.name}`} callback={(identity) => {
          let handlesIdentity = `${this.props.tableName}_${this.props.name}`
          if (identity.slice(2) === handlesIdentity) return false;
          const identityArr = identity.split("_")
          this.props.update({foreignKey: {
            tableName: identityArr[1],
            fieldName: identityArr[2],
          }})
          return true;
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
        <input className="text-box" className="inputs" type="text" name="foreignKey" value={foreignKeyValue} onChange={this.handleChange}/>
        {/* <button class="submit" type='submit'>Submit</button> */}
        <button className="RemoveField" onClick={this.props.removeField}>X</button>
        <Handle identity={`r_${this.props.tableName}_${this.props.name}`} callback={(identity) => {
          let handlesIdentity = `${this.props.tableName}_${this.props.name}`
          if (identity.slice(2) === handlesIdentity) return false;
          const identityArr = identity.split("_")
          this.props.update({foreignKey: {
            tableName: identityArr[1],
            fieldName: identityArr[2],
          }})
          return true;
        }}/>
      </form>
    )
  }
}
