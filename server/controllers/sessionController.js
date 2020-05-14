require('dotenv').config();

const jwt = require('jsonwebtoken');
const db = require('../database/db.js');

const sessionController = {};

/**
 * creates access token and stores on res.locals
 */
sessionController.createJWT = (req, res, next) => {
  const { username } = req.body;
  const user = { username: username };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.locals.token = accessToken;
  return next();
};

sessionController.setCookie = (req, res, next) => {
  res.cookie('token', res.locals.token, {
    secure: false,
    httpOnly: true,
    maxAge: 1000000,
  });

  return next();
};

/**
 * verifies JWT with secret
 */
sessionController.authenticateToken = (req, res, next) => {
  console.log('/verify reached');
  const { token } = req.cookies;
  console.log('req.cookies: ', req.cookies);
  // const token = authHeader && authHeader.split(' ')[1];
  // if (!token) return next({ log: 'Error: No Access Token', status: 401 });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return next({ log: `Error: Invalid Access Token: ${err}`, status: 403 });
    res.locals.verifiedUser = { result: true, username: user.username };
    return next();
  });
};

sessionController.deleteToken = (req, res, next) => {
  console.log('entered deleteToken');
    res.clearCookie('token', {
      secure: false,
      httpOnly: true,
      maxAge: 1000000,
    });
    return next();
  }


module.exports = sessionController;
