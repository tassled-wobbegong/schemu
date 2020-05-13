const db = require('../database/db.js');
const databaseController = {};

/*  const savedObj = {
  instanceName: this.refInputInstance.current.value,
  currentState: this.state,
  pastState: this.past,
  futureState: this.future
};*/

databaseController.saveToDatabase = (req, res, next) => {
console.log("Our body is here",req.body)
const query = `INSERT INTO savedStates (name, savedstate)
               VALUES ($1, $2)
               RETURNING *`
const values = [req.body.instanceName,{currentState: req.body.currentState, pastState: req.body.pastState, futureState: req.body.futureState}]
db.query(query,values)
.then(response =>{
  console.log("Our database entry now looks like this", response.rows[0])
  res.locals.savedFiles = response.rows[0]
  return next()
})
.catch(err => {
  console.log("We got an error saving to database",err)
  return next()})
}

module.exports = databaseController;