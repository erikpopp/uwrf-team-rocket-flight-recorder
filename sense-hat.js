//sense-hat.js
//read from sense hat
//store data into files for later use

/*
TO DO:
X Find a way to limit the rate of reading from the sense hat so that I get accurate readings
X Find a way to efficiently pipe a data stream to the web UI
*/


//load libraries
//const child_process = require("child_process");
const cli_argparse  = require("cli-argparse");
const libsensehat   = require("node-sense-hat");
const fs            = require("fs");


//initialize libraries
var IMU = new libsensehat.Imu.IMU();
var getValue = IMU.getValue;


//declare variables
var help = ["",
            "sense-hat.js",
            "",
            "Usage:",
            "node /path/to/sense-hat.js [-h|--help] [--sensor-read-interval=interval_in_ms] [--child-process]",
            "",
            "Description:",
            "Reads data from the Raspberry Pi Sense Hat and saves it to a file. It is designed to be used by server.js, but can be run as a standalone script.",
            "",
            "Options:",
            "--sensor-read-interval=interval_in_ms   Sets the interval in milliseconds at which sense-hat.js will read from the sense hat. Default is 1000.",
            "--child-process                         Puts sense-hat.js in child process mode. It will attempt to set up event handlers to communicate with server.js, and exit if that attempt fails.",
            "",
            "Author:",
            "Erik Popp",
            "",
            "Written for the UWRF rocket club for the Spring 2023 launch.",
            ""].join("\n");
var log_file_name;
var log_file_name_base = "uwrf-rocket-club-flight-data-";
var log_file_directory = "./flight-data";
var loop_counter = 0;
var report;
var sensor_read_interval_ms = 1000;
var sensor_read_interval_handle;
var server_api;


//declare functions
function get_valid_log_file_name()
{
  var log_number_candidate = 1;
  var log_file_name_candidate;

  do
  {
    log_number_candidate++;
    log_file_name_candidate = log_file_directory + "/" + log_file_name_base + log_number_candidate.toString() + ".log";
    console.log("trying \"" + log_file_name_candidate + "\"");
  }
  while(fs.existsSync(log_file_name_candidate) );

  console.log("decided to use \"" + log_file_name_candidate + "\"");
  return log_file_name_candidate;
};


function Message(type, body)
{
  this.type = type;
  this.body = body;
}


function process_message(message)
{
  console.log("received new message: " + JSON.stringify(message) );
}


function report_console()
{
  console.log(JSON.stringify(flight_data_sample) );
}

function report_server()
{
  report_console();
  process.send(new Message("flight data sample", flight_data_sample) );
}


function sensor_read()
{
  console.log("IMU = " + JSON.stringify(IMU) );
  IMU.getData(sensor_read_callback);
}


function sensor_read_callback(err, data)
{
  console.log("reading data...");

//inform of any errors in sensor reading
  if(err !== null)
  {
    console.error("could not read sensor data: ", err);
    return;
  }

  var flight_data_sample = {...data};
  flight_data_sample.altitude_calculated = altitude_hypersometric(flight_data_sample.temperature, flight_data_sample.pressure);

  console.log("Recording sample: " + JSON.stringify(flight_data_sample) );
  log_file_stream.write(JSON.stringify(flight_data_sample) + "\n");
}



function start_recording()
{
  console.log("Starting recording every " + sensor_read_ms + " ms");
  sensor_read_interval_handle = setInterval(getValue.bind(IMU), sensor_read_interval_ms, sensor_read_callback); //binding to IMU object is necessary to keep getValue() in proper scope to work
}


function altitude_hypersometric(temperature, pressure)
{
//altitude is in meters
//formula requires pressure in hPa
//sense hat gives pressure in millbars, but 1mbar = 1hPa
//formula and constants copied from "https://keisan.casio.com/has10/SpecExec.cgi?id=system/2006/1224585971"
  var pressure_sea_level = 1013.25;
//273.15 is the difference between celsius and kelvin - this formula requires temperatures in kelvin

  return ( (Math.pow(pressure_sea_level/pressure, 1/5.257) - 1) * (temperature + 273.15) ) / 0.0065;
}



//process arguments
var parsed_arguments = cli_argparse();
console.log("parsed_arguments = " + JSON.stringify(parsed_arguments));

if( (parsed_arguments.raw.length == 0) || (parsed_arguments.flags.h) || (parsed_arguments.flags.help) )
{
  console.log(help);
  process.exit();
}

if(typeof parsed_arguments.options.sensorReadInterval == "string")  //cli_argparse() returns option values as strings
{
  console.log("reading sense hat data every " + parsed_arguments.options.sensorReadInterval + " ms");
  sensor_read_interval_ms = parseInt(parsed_arguments.options.sensorReadInterval);
}


//initialize variables
log_file_name = get_valid_log_file_name();
log_file_stream = fs.createWriteStream(log_file_name, {flags: 'a', AutoClose: true} );  //file handle flag "a" means append mode
server_api = {
start: start_recording
};


//if called with --child-process argument, listen for commands from parent
if(parsed_arguments.flags.childProcess)
{
  console.log("I've been told that I am a child process; checking if this is true");
  console.log("typeof process.send = " + typeof process.send);
  if(typeof process.send === "function")
  {
    console.log("I can access the nodejs API for communicating with a parent process; setting up event listeners for communicating with server.js");
    process.on("message", process_message);
  }
  else
  {
    console.log("I could not access the nodejs API for communicating with a parent process; are you sure that you called me as a child process of another node process? I expect to be called using process.fork()");
    process.exit();
  }
}

//otherwise, assume that I'm being run directly and start reading sensor data
else
{
  sensor_read_interval_handle = setInterval(getValue.bind(IMU), sensor_read_interval_ms, sensor_read_callback);  //binding to IMU object is necessary to keep getValue() in proper scope to work
}
