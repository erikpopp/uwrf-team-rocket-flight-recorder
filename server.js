//server.js
//serves the web UI for the rocket brain
//relays commands and data to other parts of the flight data recorder
//written based on tutorial in "https://javascript.plainenglish.io/create-a-single-page-website-using-node-js-and-express-js-a0b53e396e4f"

/*
TO DO:
X Start all parts of the flight recorder:
  + Web server
  + Data recorder
X Make sure that there is a simple and efficient way for the web UI to access the data
  + I would like to have a single file download for each run
  + It should probably be a zip file of all data from that flight run
X Make the UI look good
*/

const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static("web-interface"));

// default URL for website
app.use('/', function(req,res){
    res.sendFile(path.join(__dirname+'/web-interface/index.html'));  //__dirname = project folder
  });
const server = http.createServer(app);
const port = 80;

server.listen(port);
console.debug('Server listening on port ' + port);
