Flight-Recorder

A rocket flight recorder written using Node.js that runs on the Raspberry Pi.

Setup:
* Place and secure sense hat on Raspberry Pi
* Install dietpi on Raspberry Pi
* Update dietpi using:
"sudo dietpi-update"
* (optional) Remove unnecessary packages using:
"dietpi-software"
* Enable I2C using:
"dietpi-config" -> "Advanced Options -> "I2C State" (just press <enter> to toggle from off to on)
* Install Node.js version 14.21.3 using the "n" nodejs version manager
"curl -L https://git.io/n-install | bash
n 14.21.3"
* Create and enter working directory for flight recorder
"mkdir flight-recorder
cd flight-recorder"
* Install the "forever" nodejs package globally
"npm install forever --global"
* Install "flight-recorder" nodejs package locally
"npm install flight-recorder"

