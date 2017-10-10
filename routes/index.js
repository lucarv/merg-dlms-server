'use strict';
var express = require('express');
var router = express.Router();

// azure sdk
var iothub = require('azure-iothub');
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;

var client;
var hubCS = 'HostName=hankys-iot-hub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=at9H8Piz2TEfHS9jU3YBuV8I7sXshniyXzz/h2ZOb3U='
var registry = iothub.Registry.fromConnectionString(hubCS);
var hubName = hubCS.substring(0, hubCS.indexOf(';'));

function printDeviceInfo(err, deviceInfo, res) {
  if (deviceInfo) {
    var deviceKey = deviceInfo.authentication.symmetricKey.primaryKey;
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'DLMS Provisioning Back End' });
});

router.post('/', function (req, res, next) {

  var meterId = req.body.meterId;
  var device = {
    deviceId: meterId
  }
  console.log('device to create: ' + JSON.stringify(device));

  registry.create(device, function (err, deviceInfo, result) {
    if (err)
      registry.get(device.deviceId, printDeviceInfo);
    var devKey;
    res.setHeader('Content-Type', 'application/json');

    if (deviceInfo) {
      devKey = deviceInfo.authentication.symmetricKey.primaryKey;
      var opRes = { 'result': 'meter ' + meterId + ' added to registry' }
      res.send(JSON.stringify(opRes));
    } else {
      console.log('no key')
      var opRes = { 'result': 'error', 'cause': 'something fishy happened' }
      res.send(JSON.stringify(opRes));
    }
  });

});

router.delete('/', function (req, res, next) {
   
  var meterId = req.body.meterId;
  console.log('device to delete: ' + meterId);
  
  registry.delete(meterId, function (err, done) {
    console.log(err)
    res.setHeader('Content-Type', 'application/json');

    if (!err) {
      var opRes = { 'result': 'meter ' + meterId + ' removed from registry' }
      res.send(JSON.stringify(opRes));
    } else {
      console.log(err)
      var opRes = { 'result': 'error', 'cause': 'something fishy happened' }
      res.send(JSON.stringify(opRes));
    }
  });
  
});

module.exports = router;
