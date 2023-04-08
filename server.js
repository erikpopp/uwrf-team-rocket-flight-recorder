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

//load modules
const http               = require('http'     );
const express            = require('express'  );
const path               = require('path'     );
const socketio           = require('socket.io');


//initialize modules
const app                = express();
app.use(express.json() );
app.use(express.static("web-interface") );

const http_server        = http.createServer(app);
const sense_stream       = new socketio.Server(http_server);

//serve local socket.io script from package repository
app.use('/socket.io.js', function(req,res) {
  res.sendFile(path.join(__dirname + '/node_modules/socket.io/client-dist/socket.io.js') );
});

//set up express to serve interface
app.use('/', function(req,res){
    res.sendFile(path.join(__dirname+'/web-interface/index.html'));  //__dirname = project folder
  });


const port = 80;
http_server.listen(port);
console.debug('Server listening on port ' + port);
