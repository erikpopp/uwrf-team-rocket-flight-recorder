//script.js
//JavaScript for web interface of Team Rocket flight recorder

console.log("script.js: loaded");

//declare state variables
var clear_logs;
var file_picker;
var recording = false;
var messages;
var socketio = io();

//declare document variables
var connection_status;
var start_stop;

//declare functions
function client_clear_logs()
{
  console.log("clearing logs");
  socketio.emit("client_clear_logs");
}


function connected(server_recording)
{
  console.log("connected; server recording status: " + server_recording);
  recording = server_recording;
  connection_status.removeClass().addClass("connected");
  connection_status.text("Connected");

  (recording) ? record_callback() : stop_callback();  //update the UI when the server is restarted or disconnected and then reconnects

  socketio.emit("client_list_logs", display_logs);
}

function disconnected()
{
  console.log("disconnected");
  connection_status.removeClass().addClass("reconnecting");
  connection_status.text("Reconnecting...");
}

function display_flight_data(flight_data)
{
  messages.html("Flight Data:<br>" + JSON.stringify(flight_data) );
}

function display_logs(log_list)
{
  var file_picker_html;
  file_picker.empty();
  for(var loop_counter = 0; loop_counter < log_list.length; loop_counter++)
  {
    file_picker.append("<li id=\"" + log_list[loop_counter] + "\"><button class=\"download-button\">" + log_list[loop_counter] + "</button></li>");
  }
  file_picker.html(file_picker_html);
}


function download_file(event)
{
  var element_clicked = event.target;
  var parent_cell = element_clicked.parentNode;

  if(element_clicked.className == "download_button")
  {
    console.log("clicked on download button for file \"" + parent_cell.id + "\"");
    var link = document.createElement("a");
    link.download = parent_cell.id;
    link.href = "flight-data/" + parent_cell.id;
    link.click();
  }
}

function record()
{
  console.log("record()");
  start_stop.removeClass().addClass("starting");
  start_stop.text("Starting...");
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
  clear_logs = $("#clear-logs");
  clear_logs.click(client_clear_logs);
  connection_status = $("#connection-status");
  file_picker = $("#file-picker");
  file_picker.click(download_file);
  messages = $("#messages");
  start_stop = $("#start-stop");
  start_stop.click(record);
}

function server_handle_error(error_message)
{
  console.log("Received an error from sense-hat.js: " + JSON.stringify(error_message) );
}

function stop()
{
  console.log("stop()");
  start_stop.removeClass().addClass("stopping");
  start_stop.text("Stopping...");
  socketio.emit("stop", stop_callback);
}

function stop_callback()
{
  console.log("stop_callback()");
  recording = false;
  start_stop.off("click").on("click", record);
  start_stop.removeClass();
  start_stop.text("Start");
  messages.text("");
}


//set up events
socketio.on("connected", connected);
socketio.on("disconnect", disconnected);
socketio.on("record-acknowledgement", record_callback);
socketio.on("sense_hat_handle_error", server_handle_error);
socketio.on("server_flight_data_sample", display_flight_data);
socketio.on("server_list_logs", display_logs);
socketio.on("stop", stop_callback);

$(document).ready(setup);
