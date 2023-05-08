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
const http          = require('http'            );
const child_process = require('child_process'   );
const express       = require('express'         );
const fs            = require("fs"              );
const path          = require('path'            );
const socketio      = require('socket.io'       );


//declare variables
var flight_data_log_directory = path.normalize("flight-data");
var flight_data_log_list = [];
var list_logs_interval_handle;
var recording = false;
var sense_hat_server_api;
var sense_hat_state = {
  file_name: "sense-hat.js",
  process: undefined,
  start_counter: 0
};


//define functions
function client_clear_logs()
{
  console.log("clearing logs");
  fs.readdir(flight_data_log_directory, (err, file_list) => {
    file_list.forEach(file => {
      var full_file_path = path.normalize("./" + flight_data_log_directory + "/" + file);
      fs.unlink(full_file_path, (err) => {
        console.log("deleting " + full_file_path );
        console.log("error: " + JSON.stringify(err) );
      });
    });
    setTimeout(server_list_logs,1000);
  });
}


function client_connection_callback(socket)
{
  console.log('Received socket.io connection');
  io.emit('connected', recording);
  socket.on("client_clear_logs", client_clear_logs);
  socket.on('disconnect', client_disconnect_callback);
  socket.on('record', client_record_callback);
  socket.on('stop', client_stop_callback);

  server_list_logs();
}


function client_disconnect_callback()
{
  console.log('Socket.io session disconnected');
}


function client_record_callback(ack)
{
  console.log('starting recording');
  recording = true;
  sense_hat_state.process.send("server_start_recording");
  ack("Acknowledgement");
}


function client_stop_callback(ack)
{
  console.log('stopping recording');
  recording = false;
  sense_hat_state.process.send("server_stop_recording");
  server_list_logs();
  ack();
}


function sense_hat_flight_data_sample(flight_data)
{
//  console.log("flight data sample: " + JSON.stringify(flight_data) );
//  console.log("Sending flight data sample to user");
  io.emit("server_flight_data_sample", flight_data);
}


function sense_hat_handle_error(err)
{
  console.log("notifying user of an error with the sense hat script");
  io.emit("sense_hat_error", new SenseHatError(err) );
  start_sense_hat();
}


function sense_hat_process_message(sense_hat_message)
{
//  console.log("server.js: received this message from sense-hat.js: " + JSON.stringify(sense_hat_message) );
//  console.log("server.js: received message from sense-hat.js");
  sense_hat_server_api[sense_hat_message.type].call(this, sense_hat_message);
}


function server_list_logs()
{
//  console.log("listing logs");
  fs.readdir(path.normalize(flight_data_log_directory), (err, file_list) => {
    io.emit("server_list_logs", file_list);
  });
}


function serve_socket_io_js(req,res)
{
  res.sendFile(path.join(__dirname + '/node_modules/socket.io/client-dist/socket.io.js') );
}


function SenseHatError(error)
{
  this.message = "sense-hat.js stopped " + sense_hat_state.start_counter + " times";
  this.error = error;
}


function start_sense_hat()
{
  sense_hat_state.start_counter++;

  if(sense_hat_state.start_counter >= 3)
  {
    io.emit(new SenseHatError("sense-hat.js stopped " + sense_hat_state.start_counter + " times"), null);
    return;
  }

  console.log("starting " + sense_hat_state.file_name + ", try #" + sense_hat_state.start_counter);
  sense_hat_state.process = child_process.fork(sense_hat_state.file_name, ["--child-process"]);
  sense_hat_state.process.on('error', sense_hat_handle_error);
  sense_hat_state.process.on('close', start_sense_hat);
  sense_hat_state.process.on("message", sense_hat_process_message);
}


//initialize modules
const app = express();



//initialize variables
sense_hat_server_api = {
  sense_hat_flight_data_sample: sense_hat_flight_data_sample
};



//not needed for this project, but standard - needed for HTTP POST and PUT requests, but not for GET and DELETE
//see this forum question: https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded
//app.use(express.json() );



//serve local socket.io script from package repository
app.use('/socket.io.js', serve_socket_io_js);


//serve flight data logs
console.log("flight_data_log_directory = " + flight_data_log_directory);
app.use("/flight-data", express.static(flight_data_log_directory) );


//set up express to serve interface
app.use("/", express.static("web-interface") );


//set up socket.io to support a bidirectional communication channel between the user and the server
const http_server = http.createServer(app);
const io          = new socketio.Server(http_server);
io.on('connection', client_connection_callback);

const port = 80;
http_server.listen(port);
console.debug('Server listening on port ' + port);



//start and set up sense hat
start_sense_hat();



//watch log folder for changes
fs.watch(flight_data_log_directory, server_list_logs);
