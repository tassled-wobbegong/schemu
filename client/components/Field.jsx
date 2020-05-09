import React from 'react'

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

export default function Field(props) {
  return (
    <div className='field-container'>
      <div className='field-prop' >{props.name}</div>
      <div className='field-prop' >{props.type}</div>
      <div className='field-prop' >{props.length}</div>
      <div className='field-prop' >{props.primaryKey}</div>
      <div className='field-prop' >{props.unique}</div>
      <div className='field-prop' >{props.notNull}</div>
      <div className='field-prop' >{props.defaultValue}</div>
      <div className='field-prop' >{props.checkCondition}</div>
      <div className='field-prop' >{props.foreignKey}</div>
    </div>
  )
}
