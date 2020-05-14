/* eslint-disable */
const express = require("express");
const path = require("path");
const app = express();
const savedRouter = require("./routes/saved.js")
const authRouter = require("./routes/authentication.js");
/* expressWs not used in this file require('express-w') returns a function
with app as an argument. that function edits the object and add the .ws property */
// const expressWs = require("express-ws")(app);
require("express-ws")(app);


/* using sessions and clients object to store client information*/
const sessions = {};
const clients = {};

/* sends static assets from build that holds the bundle */
app.use("/build", express.static(path.resolve(__dirname, "../build")));

// required to parse body from post requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {
    /* 
      user is not loading a session based on browser query path and if there
     if a query id it should be loaded in on our sessions 
    */
  if (!req.query.id || !sessions[req.query.id]) {
    /* new session */
    /* setting unique id so other people won't have a chance to join in on your session */
    /* egon stuff here */
    const id = Buffer.from(`${Math.random() * 9999999999}`).toString('base64');
    /* creating random number saving it as a string and then converting it into a base64 string */
    sessions[id] = {}; // sessions is an object holding id as keys and with object values
    clients[id] = []; // clients is an object holding id as keys and array values
    /* why are the objects seperate from one another? what does sessions[id] object store? */
    return res.redirect(`/?id=${id}`); // redirect on successfull session
  }

  /* 
    send app where the client will handle the case where their is query id and a session
    is in play
  */
  res.sendFile(path.resolve(__dirname, '../index.html'));
});
//route any saving/loading functionality
app.use('/saved', savedRouter);

// route authentication functionality
app.use('/authenticate', authRouter);

app.ws("/api/session/:id", function (ws, req) { /* accepting incoming requests, ws is the client */
  /* so websocket can hit up a path? with queries in the path? */
  const id = req.params.id;
  if (!sessions[id]) { // check if session exists if not create new session based on id
    sessions[id] = {};
    clients[id] = [];
    //return ws.close();
  }
  clients[id].push(ws); // pushes socket in the array


  ws.send(JSON.stringify(sessions[id])); /* reading valid sessions state which is the :id and sending it
                                            back to the client */

  ws.on('message', function(msg) {
    const data = JSON.parse(msg); // parses object
    if (typeof data === "object") { // make sure the data is an object
      sessions[id] = { ...sessions[id], ...data }; /* 
                                                      update state in sessions[id] by creating a new obj
                                                      store 2 objects which is sessions[id], data
                                                      data will overwrite common keys and add keys if
                                                      it has any
                                                    */
      /*
        broadcast new updated state to all the clients that are tracked on the client object
        with the sessions key
      */
      for (let client of clients[id]) {
        // loops through the clients that are connected on the session, each client
        // is a socket object
        if (client !== ws) { /* doing a check if we are dealing with a socket */
          // if so then stringify the state and send it to the client
          client.send(JSON.stringify(sessions[id]));
        } else {
          //client.send("Received");
        }
      }
    }
  });
  ws.on("close", function () {
    clients[id] = clients[id].filter((client) => client !== ws); // removes socket from the array
    if (clients[id].length === 0) { // if array is completely empty then no is in the session
      // delete session from memory
      delete sessions[id];
      delete clients[id];
    }
  });
});




// generic error handling route, very useful.

app.use(function (err,req,res,next){
  // console.log(err)
  const defaultErr = {
    log: `MIDDLEWARE ERROR FOUND BUT SOMEONE DIDN'T WRITE A MESSAGE FOR PATHING TO HERE`,
    status: 400,
    message:{err: 'Sorry, something went wrong on our server'}
  }
  const errorObj = Object.assign({}, defaultErr,err)
  console.log(errorObj.log)
  res.status(errorObj.status).json(errorObj.message)
})

app.use('*',(req, res) =>
{
  res.status(404).send("Hey, there's nothing here, go on, get out")
})

app.listen(3000, () => console.log("listening..."));
