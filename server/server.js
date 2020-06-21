const path = require("path");
const crypto = require("crypto");
const express = require("express");
const enableWs = require("express-ws");

const app = express();

const sessions = {};

app.use("/build", express.static(path.resolve(__dirname, "../build")));

app.get('/', async (req, res, next) => {
  const id = crypto.randomBytes(32).toString('base64').replace(/[=\/\+]/g, "");
  sessions[id] = {
    clients: [],
    state: {}
  };
  return res.redirect(`/${id}`);
});
app.get('/:id', async (req, res, next) => {
  if (!req.params.id || !sessions[req.params.id]) {
    return res.redirect("/");
  }

  res.sendFile(path.resolve(__dirname, '../index.html'));
});

enableWs(app);
app.ws("/api/session/:id", function (ws, req) {
  const id = req.params.id;
  const session = sessions[id];

  if (!session) {
    return ws.close();
  }
  
  session.clients.push(ws);

  ws.send(JSON.stringify(session.state));

  ws.on('message', function(msg) {
    const data = JSON.parse(msg);
    if (typeof data === "object") {
      session.state = data;
      for (let client of session.clients) {
        if (client !== ws) {
          client.send(JSON.stringify(session.state));
        }
      }
    }
  });

  ws.on("close", function () {
    session.clients = session.clients.filter((client) => client !== ws);
    if (session.clients.length === 0) {
      delete sessions[id];
    }
  });
});

app.listen(3000, () => console.log("listening..."));
