const { MongoClient } = require('mongodb');

const MURI = 'mongodb://schemu:8lTGM4So4bhIjjmI@cluster0-shard-00-00-n177k.mongodb.net:27017,cluster0-shard-00-01-n177k.mongodb.net:27017,cluster0-shard-00-02-n177k.mongodb.net:27017/Cluster0?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';

const collection = (name) => async (callback) => {
  const client = new MongoClient(MURI, { 
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