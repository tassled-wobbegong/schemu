const db = require('./mongo')('schemu');

const sessions = {};

const loadSession = async (key) => {
  if (sessions[key]) {
    return sessions[key];
  }

  return db(async (collection) => {
    const result = await collection.findOne({ key });

    if (!result) {
      return;
    }

    return sessions[key] = {
      clients: [],
      state: result.state,
      timeout: null
    };
  });
};

const storeSession = async (key) => {
  const session = sessions[key];

  if (!session) {
    return;
  }

  return db(async (collection) => {
    const result = await collection.update({ key }, { key, state: session.state }, { upsert: true });
    return !!result;
  });
}
