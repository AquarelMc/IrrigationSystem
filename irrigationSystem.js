var udp = require('dgram');
var server = udp.createSocket('udp4');
var gpio = require('onoff').Gpio;

var pin1 = new gpio(14, "out");
var pin2 = new gpio(15, "out");
var pin3 = new gpio(18, "out");

var watering = false;

function getZones(zone, message) {
  return message.split(",")[zone]
}

function getTime(message) {
  return message.split("=")[1];
}

function getZone(message) {
  return message.split("=")[0];
}

function setGpioOn(zone) {
  switch (zone) {
    case "Front Yard":
      console.log("Front Gpio 14 On");
      pin1.writeSync(1);
      break;
    case "Back Yard Pool":
      console.log("Back Pool Gpio 15 On");
      pin2.writeSync(1);
      break;
    case "Back Yard Shed":
      console.log("Back Shed Gpio 18 On");
      pin3.writeSync(1);
      break;
  }
}

function allGpioOff() {
  console.log("All Gpio Off");
  pin1.writeSync(0);
  pin2.writeSync(0);
  pin3.writeSync(0);
}

server.on('error', function(error) {
  console.log('Error: ' + error);
  server.close();
});

server.on('message', function(msg, info) {
  console.log('Data received from client : ' + msg.toString());
  console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port);

  var message = msg.toString();

  if (message.split(",").length == 4) {
    if (getTime(getZones(0, message)) == 0 && getTime(getZones(1, message)) == 0 && getTime(getZones(2, message)) == 0) {
      watering = false;
      console.log("Stopped");
      clearTimeout(zone1);
      clearTimeout(zone2);
      clearTimeout(zone3);

      allGpioOff();
    } else if (waterting == false) {
      watering = true;

      var time1 = getTime(getZones(0, message)) * 1000;
      var time2 = getTime(getZones(1, message)) * 1000;
      var time3 = getTime(getZones(2, message)) * 1000;

      allGpioOff();
      setGpioOn(getZone(getZones(0, message)));

      var zone1 = setTimeout(function() {
        allGpioOff();
        setGpioOn(getZone(getZones(1, message)));
      }, time1);

      var zone2 = setTimeout(function() {
        allGpioOff();
        setGpioOn(getZone(getZones(2, message)));
      }, time1 + time2);

      var zone3 = setTimeout(function() {
        allGpioOff();
      }, time1 + time2 + time3);
    }
  }
});

server.bind(6969);