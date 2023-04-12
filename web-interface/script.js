//script.js
//JavaScript for web interface of Team Rocket flight recorder

console.log("script.js: loaded");

//declare variables
var recorder_on = false;
var socketio = io();
console.log("loaded socket.io");

//declare functions
function connected()
{
  $("#connection-status").addClass("connected");
  $("#connection-status").text("Connected");
}

function record()
{
  console.log("record()");
  socketio.emit('record', record_started_callback);
}

function record_started_callback(response)
{
  console.log("record_started_callback(" + response + ")");
  console.log("response.recording = " + response.recording);
  recorder_on = true;
  update_page();
}

function update_page()
{
  if(recorder_on)
  {
    $("#start-stop").html("Stop");
    $("#start-stop").addClass("running");
  }
  else
  {
    $("#start-stop").html("Start");
    $("#start-stop").removeClass("running");
  }
}


//set up events
socketio.on("connected", connected);
socketio.on("record-acknowledgement", record_started_callback);


$(document).ready(update_page);
