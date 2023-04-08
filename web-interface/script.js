//script.js
//JavaScript for web interface of Team Rocket flight recorder

console.log("script.js: loaded");

//declare variables
var recorder_on = false;
var socketio = io();
console.log("loaded socket.io");

//declare functions
function toggle_recorder_on()
{
  console.log("toggle_recorder_on()");
  recorder_on = !recorder_on;  //boolean NOT
  console.log("recorder_on = " + recorder_on);
  console.log("start-stop.className = " + $("#start-stop").className);
  update_page();
}

function update_page()
{
  if(recorder_on)
  {
    $("#start-stop").html("Stop");
    $("#start-stop").addClass("started");
    $("#start-stop").removeClass("stopped");
  }
  else
  {
    $("#start-stop").html("Start");
    $("#start-stop").addClass("stopped");
    $("#start-stop").removeClass("started");
  }
}



$(document).ready(update_page);
