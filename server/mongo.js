const { MongoClient } = require('mongodb');
const { MONGO_URI } = require('./secret.js');

const collection = (name) => async (callback) => {
  const client = new MongoClient(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });

  let result;

  try {
    await client.connect();

    const db = await client.db('Cluster0')
    const collection = await db.collection(name);

    result = await callback(collection);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
  
  return result;
}

module.exports = collection;