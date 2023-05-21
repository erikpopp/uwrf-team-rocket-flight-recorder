//script.js
//JavaScript for web interface of Team Rocket flight recorder

console.log("script.js: loaded");

//declare state variables
var clear_logs_button;
var logs;
var messages;
var recording = false;
var live_data;
var show_clear_logs_link;
var socketio = io();

//declare document variables
var connection_status;
var start_stop;

//declare functions
function accordion()
{
//designed to be run as an onClick handler for a link inside an accordion wrapper with an accordion body
  var wrapper = $(this).parent().closest(".accordion-wrapper");
  wrapper.toggleClass("closed open");
}


function client_clear_logs()
{
  console.log("clearing logs");
  socketio.emit("client_clear_logs");
  show_clear_logs_link.removeClass().addClass("hidden");
  clear_logs_button.removeClass().addClass("hidden");
}


function connected(server_recording)
{
  console.log("connected; server recording status: " + server_recording);
  recording = server_recording;

  start_stop.removeClass().addClass("connected");
  start_stop.text("Start");

  (recording) ? record_callback() : stop_callback();  //update the UI when the server is restarted or disconnected and then reconnects
}


function disconnected()
{
  console.log("disconnected");
  start_stop.removeClass().addClass("reconnecting");
  start_stop.text("Reconnecting...");
}

function display_flight_data(flight_data)
{
  live_data.html("Live Flight Data:<br>" + JSON.stringify(flight_data) );
}


function display_logs(log_list)
{
  var logs_html;
  logs.empty();
  for(var loop_counter = 0; loop_counter < log_list.length; loop_counter++)
  {
    logs.append("<li id=\"" + log_list[loop_counter] + "\"><button class=\"download-button\">" + log_list[loop_counter] + "</button></li>");
  }
  logs.html(logs_html);

  if(loop_counter == 0)
  {
    clear_logs_button.removeClass().addClass("hidden");
    show_clear_logs_link.removeClass().addClass("hidden");
  }
  else
  {
    show_clear_logs_link.removeClass().addClass("visible");
  }
}


function download_file(event)
{
  var element_clicked = event.target;
  var parent_cell = element_clicked.parentNode;

  if(element_clicked.className == "download-button")
  {
    console.log("clicked on download button for file \"" + parent_cell.id + "\"");
    var link = document.createElement("a");
    link.download = parent_cell.id;
    link.href = "flight-data/" + parent_cell.id;
    link.click();
  }
  else
  {
    console.log("clicked on log download page, but not on a download button. this shouldn't be a problem, but if lots of these messages are showing up and nothing is downloading, check function download_file()");
  }
}


function record()
{
  console.log("starting recording");
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
//  $("#live-data-wrapper").removeClass("closed").addClass("open");
}


function setup()
{
  messages = $("#messages");
  clear_logs_button = $("#clear-logs-button");
  clear_logs_button.click(client_clear_logs);
  connection_status = $("#connection-status");
  logs = $("#logs");
  logs.click(download_file);
  live_data = $("#live-data");
  show_clear_logs_link = $("#show-clear-logs");
  show_clear_logs_link.click(show_clear_logs);
  start_stop = $("#start-stop");
  start_stop.click(record);

  $(".accordion-button").click(accordion);
}


function server_handle_error(error_message)
{
  console.log("Received an error from sense-hat.js: " + JSON.stringify(error_message) );
  messages.html("Error:<br>" + JSON.stringify(error_message) );
  $("#messages-wrapper").removeClass("closed").addClass("open");
  start_stop.removeClass().addClass("error");
  start_stop.text("Error");
  start_stop.off("click").click(record);
}


function show_clear_logs()
{
  clear_logs_button.removeClass().addClass("visible");
  show_clear_logs_link.removeClass().addClass("hidden");
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
  start_stop.removeClass().addClass("connected");
  start_stop.text("Start");
  live_data.text("");
  $("#live-data-wrapper").removeClass("open").addClass("closed");
}


//set up events
socketio.on("connected", connected);
socketio.on("disconnect", disconnected);
socketio.on("record-acknowledgement", record_callback);
socketio.on("sense_hat_error", server_handle_error);
socketio.on("server_flight_data_sample", display_flight_data);
socketio.on("server_list_logs", display_logs);
socketio.on("stop", stop_callback);

$(document).ready(setup);
