const path = require("path");
const express = require("express");
const databaseController = require(path.resolve(__dirname, "../controllers/databaseController.js"))

const router = express.Router();

router.post('/', databaseController.saveToDatabase, (req, res) => {
  res.status(200).json(res.locals.savedFiles)
})

module.exports = router;