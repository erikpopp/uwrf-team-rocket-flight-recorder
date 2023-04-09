//script.js
//JavaScript for web interface of Team Rocket flight recorder

console.log("script.js: loaded");

//declare variables
var recorder_on = false;
var socketio = io();
console.log("loaded socket.io");

//declare functions
function record()
{
  console.log("record()");
  socketio.emit("start recording", record_started_callback);
}

function record_started_callback(response)
{
  console.log("record_started_callback(" + response + ")");
  console.log("response.recording = " + response.recording);
  recorder_on = true;
  update_page();
}

function dosomething()
{
  socketio.emit("do something", (response) => {
    console.log("response = " + response);
  });
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



$(document).ready(update_page);
