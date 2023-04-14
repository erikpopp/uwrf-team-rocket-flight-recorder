//process-monitor.js
//uses forever-monitor to keep the server and the sense-hat script running
//based on the example monitor script at https://github.com/foreversd/forever-monitor

var forever = require('forever-monitor');

var server = new (forever.Monitor)('server.js', {
  silent: false,
  args:   []
});

server.on('exit', () => {
  console.log("forever-monitor: server.js handler: exiting");
});

var sense_hat = new (forever.Monitor)('sense-hat.js', {
//  max: 3,  //max # of restarts, default is infinite
  silent: false,
  args:   []
});

sense_hat.on('exit', () => {
  console.log('process-monitor.js: sense-hat.js hanlder: exiting');
});

server.start();
sense_hat.start();
