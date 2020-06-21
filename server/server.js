const path = require("path");
const crypto = require("crypto");
const express = require("express");
const enableWs = require("express-ws");

const app = express();

const sessions = {};

app.use("/build", express.static(path.resolve(__dirname, "../build")));

// The root endpoint creates a new session associated with a random id and redirects the client to the corresponding url.
app.get('/', async (req, res, next) => {
  const id = crypto.randomBytes(32).toString('base64').replace(/[=\/\+]/g, "");
  sessions[id] = {
    clients: [],
    state: {}
  };
  return res.redirect(`/${id}`);
});

// The /:id endpoint checks that the session id is valid, then serves the client application.
app.get('/:id', async (req, res, next) => {
  if (!req.params.id || !sessions[req.params.id]) {
    return res.redirect("/");
  }

  res.sendFile(path.resolve(__dirname, '../index.html'));
});

// basic WebSocket relay server exposed to ws://[hostname]/api/session/:id
enableWs(app);
app.ws("/api/session/:id", function (socket, req) {
  // make sure the id provided in the url params corresponds to a valid session
  const id = req.params.id;
  const session = sessions[id];
  if (!session) {
    return socket.close();
  }
  
  session.clients.push(socket);

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
      delete sessions[id];
    }
  });
});

app.listen(3000, () => console.log("listening..."));
