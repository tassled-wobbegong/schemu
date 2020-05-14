const path = require("path");
const express = require("express");
const userController = require(path.resolve(__dirname, "../controllers/userController.js"));

const router = express.Router();

router.post('/signup',
  userController.hashPassword,
  userController.createUser,
  (req, res) => res.status(200).json(res.locals.user));

router.post('/login',
  userController.verifyUser,
  (req, res) => res.status(200).json(res.locals.result));


module.exports = router;
