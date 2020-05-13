
const databaseController = {};

databaseController.saveToDatabase = (req, res, next) => {
console.log("Our body is here",req.body)
return next()
//put into SQL db
}

module.exports = databaseController;