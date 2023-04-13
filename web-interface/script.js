//script.js
//JavaScript for web interface of Team Rocket flight recorder

console.log("script.js: loaded");

//declare state variables
var recording = false;
var socketio = io();

//declare document variables
var connection_status;
var start_stop;

//declare functions
function connected(server_recording)
{
  console.log("connected; server recording status: " + server_recording);
  recording = server_recording;
  connection_status.removeClass().addClass("connected");
  connection_status.text("Connected");

  (recording) ? record_callback() : stop_callback();  //update the UI when the server is restarted or disconnected and then reconnects
}

function disconnected()
{
  console.log("disconnected");
  connection_status.removeClass().addClass("reconnecting");
  connection_status.text("Reconnecting...");
}

function record()
{
  console.log("record()");
  socketio.emit("record", record_callback);
}

function record_callback()
{
  console.log("record_started_callback()");
  recording = true;
  start_stop.off("click").on("click", stop);
  start_stop.removeClass().addClass("running");
  start_stop.text("Stop");
}

function setup()
{
  connection_status = $("#connection-status");
  start_stop = $("#start-stop");
  start_stop.click(record);
}

function stop()
{
  console.log("stop()");
  socketio.emit("stop", stop_callback);
}

function stop_callback()
{
  console.log("stop_callback()");
  recording = false;
  start_stop.off("click").on("click", record);
  start_stop.removeClass();
  start_stop.text("Start");
}


//set up events
socketio.on("connected", connected);
socketio.on("disconnect", disconnected);
socketio.on("record-acknowledgement", record_callback);
socketio.on("stop", stop_callback);

$(document).ready(setup);
