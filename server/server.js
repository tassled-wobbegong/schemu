const express = require('express');
const path = require('path');
const app = express();
const expressWs = require('express-ws')(app);

const sessions = {};
const clients = {};

app.use('/session', (req, res, next) => {
  if (!sessions[req.query.id]) {
    const id = Buffer.from(`${Math.random() * 9999999999}`).toString('base64');
    sessions[id] = {};
    clients[id] = [];
    return res.redirect(`/session?id=${id}`);
  }
  next();
});

app.use('/', express.static(path.resolve(__dirname, '../dist')));

app.ws('/api/session/:id', function(ws, req) {
  const id = req.params.id;
  if (!sessions[id]) {
    return ws.close();
  }
  clients[id].push(ws);

  ws.on('message', function(msg) {
    const data = JSON.parse(msg);
    if (typeof data === 'object') {
      sessions[id] = { ...sessions[id], ...data };
      for (let client of clients[id]) {
        client.send(JSON.stringify(sessions[id]));
      }
    }
  });
  ws.on('close', function() {
    clients[id] = clients[id].filter(client => client !== ws);
    if (clients[id].length === 0) {
      delete sessions[id];
      delete clients[id];
    }
  });
});

app.listen(3000, () => console.log('listening...'));
