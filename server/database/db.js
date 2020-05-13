const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://aqyuqsxm:KuzMZELFjSFd3cwe6jVtGJy3jB2ZF_8m@rajje.db.elephantsql.com:5432/aqyuqsxm',
});

module.exports = {
  query: (text, params, callback) => {
    console.log('Query executed: ', text);
    return pool.query(text, params, callback);
  },
};
