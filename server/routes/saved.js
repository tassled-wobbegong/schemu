const path = require("path");
const express = require("express");
const databaseController = require(path.resolve(__dirname, "../controllers/databaseController.js"))

const router = express.Router();

router.post('/', databaseController.saveToDatabase, (req, res) => {
  res.status(200).send('post request to /saved')
})

module.exports = router;