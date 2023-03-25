//sense-hat.js
//read from sense hat
//store data into files for later use

/*
TO DO:
X Initialize all data sources
  + This includes calibrating the IMU/compass/etc.
X Settle on a database format
  + I want to balance write efficiency with data retention
  + I'll probably accumulate data ever second or so and then write it
  + I'll probably create a new folder for each data collection run
X Find a way to efficiently pipe a data stream to the web UI
*/


const libsensehat = require("node-sense-hat");
const libjsondb = require("node-json-db"  );

import {jsondb, config } from 'libjsondb';

console.log("Reading from sensors...");

const IMU = new libsensehat.Imu.IMU;

IMU.getValue((err, data) => {
  if(err !== null)
  {
    console.error("Could not read sensor data: ", err);
    return;
  }

  console.log("Accelleration is: ", JSON.stringify(data.accel, null, "  "));
  console.log("Gyroscope is: ", JSON.stringify(data.gyro, null, "  "));
  console.log("Compass is: ", JSON.stringify(data.compass, null, "  "));
  console.log("Fusion data is: ", JSON.stringify(data.fusionPose, null, "  "));

  console.log("Temp is: ", data.temperature);
  console.log("Pressure is: ", data.pressure);
  console.log("Humidity is: ", data.humidity);
});



