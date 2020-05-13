const path = require("path");
const express = require("express");
const databaseController = require(path.resolve(__dirname, "../controllers/databaseController.js"))

const router = express.Router();

router.post('/', databaseController.saveToDatabase, (req, res) => {
  res.status(200).json(res.locals.savedFiles)
})

router.get('/',
            databaseController.loadFromDatabase,
            (req,res) => {
              res.status(200).json(res.locals.retrievedFiles);
            })

router.get('/:filename',
            databaseController.getSingleFile,
            (req,res)=>{
              res.status(200).json(res.locals.singleFile)
            })

module.exports = router;