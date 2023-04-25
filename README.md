#UWRF Falcon Rocket Team Flight Recorder

##Description:

A rocket flight recorder that runs on a Raspberry Pi with a Sense Hat. It can be used as a template for a Node.js app that does some kind of long processing in the background on a separate thread.

It comes with a web interface that allows a user to start or stop the flight recorder script, download any of the available logs, or delete all logs.

The web interface also notifies the user of the current state of the script on the Pi and attempts to notify the user of any errors it detects.

![Web Interface Screenshot for UWRF Falcon Rocket Team Flight Recorder](screenshot.png)

##Usage:
1. Boot the Raspberry Pi
2. Connect control computer/phone to Pi using networking technology of choice
3. On control computer/phone, open a web browser and go to IP address of Pi
4. Once web interface is up, click the "Start" button to start recording flight data

##Setup:
1. Physically install sense hat on Raspberry Pi
2. Install dietpi on Raspberry Pi  
If using another distro, setup instructions may vary from this point on.
3. Update dietpi using:  
```  
sudo dietpi-update  
sudo apt update
```
4. (optional) Remove unnecessary packages using "dietpi-software"
5. Enable I2C using:  
"dietpi-config" -> "Advanced Options -> "I2C State" (just press <enter> to toggle from off to on)
6. Install Node.js version 14.21.3 using the "n" nodejs version manager  
```  
curl -L https://git.io/n-install | bash  
n 14.21.3
```
7. Create and enter working directory for flight recorder  
```  
mkdir flight-recorder  
```
cd flight-recorder
8. Install "flight-recorder" nodejs package locally  
```  
npm install uwrf-rocket-club-flight-recorder  
```
9. Copy the included systemd .service file to /etc/systemd/system 
```  
cp uwrf-rocket-club-flight-recorder.service /etc/systemd/system  
```
10. Set the Raspberry Pi to serve DHCP addresses on its ethernet port or run as a Wi-Fi hotspot (tutorial)
11. Connect control computer/phone to Raspberry Pi

##Notes:
- I wrote this script under the assumption that I was running as root. If you are not running node as root (usually a good idea), you many have to add "sudo" to the command string for spawning the "sense-hat.js" process. I'm not sure about this, though.
- Although I did not make any design decisions that I knew were overtly insecure, security was not my primary priority on this project. Thus, there is no user authentication and no client input sanitization. I also made no attempt to sanitize IPC messaging or calls, so a compromised "server.js" process running as a normal user may be able to run arbitrary privileged code if it it se to run "sense-hat.js" as root.
- If you end up using this for anything, whether for its intended purpose or as a template, I'd love to know.
- The only image resource that is included in this project is the favicon, and I license that under the same license as the rest of this project.
