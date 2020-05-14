require('dotenv').config();

const jwt = require('jsonwebtoken');
const db = require('../database/db.js');

const sessionController = {};

/**
 * creates access token and stores on res.locals
 */
sessionController.createJWT = (req, res, next) => {
  const { username } = req.body;
  const user = { user: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.locals.token = accessToken;
  return next();
};

/**
 * verifies JWT with secret
 */
sessionController.authenticateToken = (req, res, next) => {
  console.log(res.locals.token);
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next({ log: 'Error: No Access Token', status: 401 });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return next({ log: `Error: Invalid Access Token: ${err}`, status: 403 });
    res.locals.user = user;
    return next();
  });
};

module.exports = sessionController;
