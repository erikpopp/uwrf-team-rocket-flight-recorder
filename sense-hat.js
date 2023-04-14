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
var log_file_name;
var log_file_name_base = "uwrf-rocket-club-flight-data-";
var log_file_directory = "./flight-data";
var loop_counter = 0;
var sensor_read_interval_handle;


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
  console.log("flight_data_sample.temperature = " + flight_data_sample.temperature + "; flight_data_sample.pressure = " + flight_data_sample.pressure);
  console.log("altitude_hypersometric(" + flight_data_sample.temperature + "," + flight_data_sample.pressure + ") = " + altitude_hypersometric(flight_data_sample.temperature, flight_data_sample.pressure) );
  flight_data_sample.altitude_calculated = altitude_hypersometric(flight_data_sample.temperature, flight_data_sample.pressure);

  log_file_stream.write(JSON.stringify(flight_data_sample) + "\n");
}

function altitude_hypersometric(temperature, pressure)
{
//altitude is in meters
//formula requires pressure in hPa
//sense hat gives pressure in millbars, but 1mbar = 1hPa
//formula and constants copied from "https://keisan.casio.com/has10/SpecExec.cgi?id=system/2006/1224585971"
  var pressure_sea_level = 1013.25;
//273.15 is the difference between celsius and kelvin - this formula requires temperatures in kelvin

return ( (Math.pow(pressure_sea_level/pressure, 1/5.257) - 1) * (temperature + 273.15) ) / 0.0065
}


//process arguments
var parsed_arguments = cli_argparse();

console.log("parsed_arguments = " + JSON.stringify(parsed_arguments));

if(parsed_arguments.flags.childProcess)
{
  console.log("I am a child process");
  console.log("parsed_arguments.flags.childProcess = " + parsed_arguments.flags.childProcess);
}


//initialize variables
log_file_name = get_valid_log_file_name();
log_file_stream = fs.createWriteStream(log_file_name, {flags: 'a', AutoClose: true} );  //file handle flag "a" means append mode


//main loop
//sensor_read_interval_handle = setInterval(getValue.bind(IMU), 1000, sensor_read_callback);  //binding to IMU object is necessary to keep getValue() in proper scope to work

