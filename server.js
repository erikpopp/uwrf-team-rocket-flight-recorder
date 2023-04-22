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

//configuration
const sense_hat_file_name = "sense-hat.js";


//load modules
const http          = require('http'         );
const child_process = require('child_process');
const express       = require('express'      );
const path          = require('path'         );
const socketio      = require('socket.io'    );


//define functions
function on_flight_data_sample(message)
{
  console.log("flight data sample: " + JSON.stringify(message) );
}


function start_sense_hat()
{
  sense_hat.restarts++;
  console.log("starting " + sense_hat_file_name + ", try #" + sense_hat.restarts);
  sense_hat.process = child_process.fork(sense_hat_file_name, ["--child-process"]);
  sense_hat.process.on('error', start_sense_hat);
  sense_hat.process.on('close', start_sense_hat);
  sense_hat.process.on("flight data sample", on_flight_data_sample);
}


//initialize modules
const app = express();
app.use(express.json() );
app.use(express.static("web-interface") );

console.log("starting " + sense_hat_file_name);
var sense_hat = {
  process: undefined,
  restarts: 1
};
start_sense_hat();

sense_hat.process.send("start_recording");


//declare state variables
var recording   = false;


//serve local socket.io script from package repository
app.use('/socket.io.js', function(req,res) {
  res.sendFile(path.join(__dirname + '/node_modules/socket.io/client-dist/socket.io.js') );
});


//set up express to serve interface
app.use('/', function(req,res){
    res.sendFile(path.join(__dirname+'/web-interface/index.html'));  //__dirname = project folder
  });


//set up socket.io to support a bidirectional communication channel between the user and the server
const http_server = http.createServer(app);
const io          = new socketio.Server(http_server);

io.on('connection', (socket) => {
  console.log('Received socket.io connection');
  io.emit('connected', recording);
  socket.on('disconnect', () => {
    console.log('Socket.io session disconnected');
  });

  socket.on('record', (acknowledgement) => {
    console.log('starting recording');
    recording = true;
    acknowledgement("Acknowledgement");
   });

  socket.on('stop', (acknowledgement) => {
    console.log('stopping recording');
    recording = false;
    acknowledgement();
  });
});


const port = 80;
http_server.listen(port);
console.debug('Server listening on port ' + port);
