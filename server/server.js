const path = require("path");
const crypto = require("crypto");
const express = require("express");
const enableWs = require("express-ws");
const db = require('./mongo')('schemu');

const PORT = 3000;
const app = express();

const sessions = {};
const createSession = (key) => {
  return sessions[key] = {
    clients: [],
    state: {},
    timeout: null
  };
};
const loadSession = async (key, create = false) => {
  if (sessions[key]) {
    return sessions[key];
  }

  if (create) {
    return createSession(key);
  }

  return db(async (collection) => {
    const result = await collection.findOne({ key });

    if (!result) {
      return;
    }

    const session = createSession(key);
    session.state = result.state;
    return session;
  });
};
const storeSession = async (key) => {
  const session = sessions[key];

  if (!session) {
    return;
  }

  return db(async (collection) => {
    const result = await collection.replaceOne({ key }, { key, state: session.state }, { upsert: true });
    delete sessions[key];
    return !!result;
  });
}

app.use("/build", express.static(path.resolve(__dirname, "../build")));

app.get('/', async (req, res, next) => {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

app.get('/:id', async (req, res, next) => {
  if (!req.params.id || !(await loadSession(req.params.id))) {
    return res.redirect("/");
  }

  res.sendFile(path.resolve(__dirname, '../index.html'));
});

app.post('/api/session', async (req, res, next) => {
  const id = crypto.randomBytes(32).toString('base64').replace(/[=\/\+]/g, "");
  loadSession(id, true);
  return res.json({ session_id: id });
});

// basic WebSocket relay server exposed to ws://[hostname]/api/session/:id
enableWs(app);
app.ws("/live/session/:id", async (socket, req) => {
  // make sure the id provided in the url params corresponds to a valid session
  const id = req.params.id;
  const session = await loadSession(id);
  if (!session) {
    return socket.close();
  }
  
  session.clients.push(socket);

  if (session.timeout) {
    clearTimeout(session.timeout);
    session.timeout = null;
  }

  // send the initial session state on connect
  socket.send(JSON.stringify(session.state));

  // whenever a message is received, replace the current session state and broadcast to all other clients
  socket.on('message', function(msg) {
    const data = JSON.parse(msg);
    if (typeof data === "object") {
      session.state = data;
      for (let client of session.clients) {
        if (client !== socket) {
          client.send(JSON.stringify(session.state));
        }
      }
    }
  });

  socket.on("close", function () {
    session.clients = session.clients.filter((client) => client !== socket);
    if (session.clients.length === 0) {
      session.timeout = setTimeout(() => storeSession(id), 5000);
    }
  });
});

app.listen(PORT, () => console.log(`listening on port ${PORT}...`));
