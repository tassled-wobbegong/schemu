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
  sessionController.setCookie,
  (req, res) => res.status(200).json(true));

router.get('/verify',
  sessionController.authenticateToken,
  (req, res) => res.status(200).json(res.locals.verifiedUser));

router.get('/logout', 
  sessionController.deleteToken,
  (req, res) => res.status(200).send('cookies cleared'));


module.exports = router;
