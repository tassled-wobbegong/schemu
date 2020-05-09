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
    this.setState(change);
  }

  render() {
    console.log(this.state)
    return (
      <div className='field-container'>
      <form onSubmit={(event) => {
          event.preventDefault();
          this.props.update(this.state); // CONSOLE LOGS AS _this2.props ?!?!?!?!
        }}>
        
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" value={this.state.name} onChange={this.handleChange} />

        <label htmlFor="type">Type</label>
        <select value={this.state.type} name="type" id="type" onChange={this.handleChange} >
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

        <label htmlFor="length">Length</label>
        <input type="text" name="length" id="length" value={this.state.length} onChange={this.handleChange}/>
        
        <label htmlFor="defaultValue">Default Value</label>
        <input type="text" name="defaultValue" id="defaultValue"value={this.state.defaultValue} onChange={this.handleChange}/>
        
        <label htmlFor="checkCondition">checkCondition</label>
        <input type="text" name="checkCondition" id="checkCondition" value={this.state.checkCondition} onChange={this.handleChange}/>
        
        <label htmlFor="primaryKey">Primary Key</label><br></br>
        <input type="checkbox" id="primaryKey" name="primaryKey" checked={this.state.primaryKey} onChange={this.handleChange}/>
        
        <label htmlFor="unique">Unique</label><br></br>
        <input type="checkbox" id="unique" name="unique" checked={this.state.unique} onChange={this.handleChange}/>

        <label htmlFor="notNull">Required</label><br></br>
        <input type="checkbox" id="notNull" name="notNull" checked={this.state.notNull} onChange={this.handleChange}/>

        <label htmlFor="foreignKey">Foreign Key</label>
        <input type="text" name="foreignKey" id="foreignKey" value={this.state.foreignKey} onChange={this.handleChange}/>

        <button type='submit'>Submit</button>
      </form>
    </div>
    )
  }
}



