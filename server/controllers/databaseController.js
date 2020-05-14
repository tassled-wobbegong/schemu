const db = require('../database/db.js');
const databaseController = {};



// Here is the structure of expected saved objects for saveToDatabase
/*  const savedObj = {
  instanceName: this.refInputInstance.current.value,
  currentState: this.state,
  pastState: this.past,
  futureState: this.future
};*/

// saves the client's current state to the database for later retrieval


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
  const errorObj = {
    log: `databaseController.saveToDatabase failed to save to database ${err}`,
    status: 500
  }
  return next(errorObj)
  })
}


//this should be called whenever the main page is served so the user has all their files at the ready.
databaseController.loadFromDatabase = (req, res, next) =>{

  const query = `SELECT * FROM savedStates`
  `select * FROM savedStates INNER JOIN WHERE user = req.body.username`
  db.query(query)
  .then(response => {
    console.log(("the files available are, ", response.rows))
    res.locals.retrievedFiles = response.rows
    return next();
  })
  .catch(err =>{
    const errorObj = {
      log: `databaseController.loadFromDatabase failed to get all the files from database ${err}`,
      status: 500
    }
    return next(errorObj)
  })
}


//added single request route just in case. looks for the param after /saved/ to decide the file name it wants

databaseController.getSingleFile =(req,res,next) =>{
  console.log("got the param ", req.params.filename)

  //parametrized query to avoid sql injection attacks

  const query = `SELECT * FROM savedStates
                 WHERE name = $1`
  const value = [req.params.filename]


  db.query(query,value)
  .then(response => {
    console.log(("the file is, ", response.rows))
    res.locals.singleFile = response.rows[0]
    return next();
  })
  .catch(err =>{
    const errorObj = {
      log: `databaseController.getSingleFile failed to grab the file from database ${err}`,
      status: 500
    }
    return next(errorObj)
  })

}

module.exports = databaseController;