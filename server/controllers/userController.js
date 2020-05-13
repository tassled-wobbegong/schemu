const bcrypt = require('bcrypt');
const db = require('../database/db.js');

const userController = {};
const SALT_WORK_FACTOR = 10;

userController.hashPassword = (req, res, next) => {
  bcrypt.genSalt(SALT_WORK_FACTOR)
    .then((salt) => {
      bcrypt.hash(req.body.password, salt)
        .then((hashedPassword) => {
          res.locals.user = { username: req.body.username, password: hashedPassword };
          console.log(res.locals.user);
          return next();
        });
    })
    .catch((err) => {
      console.log('hashing error: ', err);
      return next();
    });
};

userController.createUser = (req, res, next) => {
  // insert username and password to db
  const { user } = res.locals;
  const query = `INSERT INTO users (username, password)
               VALUES ($1, $2)
               RETURNING *`;
  const values = [user.username, user.password];
  db.query(query, values)
    .then((response) => {
      console.log('User added to database: ', response.rows[0]);
      return next();
    })
    .catch((err) => {
      console.log('Error creating user', err);
    //   res.redirect('/authenticate/signup');
    });
};

userController.verifyUser = (req, res, next) => {
  const { username, password } = req.body;

  const query = `SELECT password FROM users
                WHERE username = $1`;
  const values = [username];

  db.query(query, values)
    .then((response) => {
      const hash = response.rows[0].password;
      bcrypt.compare(password, hash)
        .then((verified) => {
          console.log('verified', verified);
          res.locals.result = verified;
          return next();
        })
        .catch((err) => console.log('error comparing hashes', err));
    })
    .catch((err) => {
      console.log('Error getting hash from db', err);
    });
};


module.exports = userController;
