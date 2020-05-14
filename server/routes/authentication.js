const express = require('express');

const userController = require('../controllers/userController.js');
const sessionController = require('../controllers/sessionController.js');

const router = express.Router();

router.post('/signup',
  userController.hashPassword,
  userController.createUser,
  (req, res) => res.status(200).json(res.locals.user));

router.post('/login',
  userController.verifyUser,
  sessionController.createJWT,
  sessionController.authenticateToken,
  (req, res) => res.status(200).json(res.locals.user));


module.exports = router;
