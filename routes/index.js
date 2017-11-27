'use strict';
var config = require('../config/config');

const request = require('request');
const url = config.url;

const express = require('express');
const router = express.Router();

// ------ AZURE SDK ------ 
const iothub = require('azure-iothub');
const clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
const Client = require('azure-iot-device').Client;
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const hub_cs = config.hub_cs;
const registry = iothub.Registry.fromConnectionString(hub_cs);

// ------ REDIS SDK ------ 
/*
const redis = require('redis');
const redis_client = redis.createClient(6380, config.redis_url,
  {
    auth_pass: config.redis_key,
    tls: { servername: config.redis_url }
  });
*/
function printDeviceInfo(err, deviceInfo, res) {
  if (deviceInfo) {
    var deviceKey = deviceInfo.authentication.symmetricKey.primaryKey;
  }
}

function setDeviceCS(deviceId, key) {
  var hubName = hub_cs.substring(hub_cs.indexOf('=') + 1, hub_cs.indexOf(';'));
  var devCS = 'HostName=' + hubName + ';DeviceId=' + deviceId + ';SharedAccessKey=' + key;
  return devCS;
}

// ------ EXPRESS ROUTING ------ 
router.get('/', function (req, res, next) {
  res.render('index', { title: 'DLMS Provisioning Back End' });
});

router.get('/agt_start', function (req, res, next) {
  res.render('agt_index', { title: 'DLMS Provisioning Back End' });
});

router.get('/mgmt_start', function (req, res, next) {
  res.render('mgr_index', { title: 'DLMS Provisioning Back End' });
});

router.post('/', function (req, res, next) {
  var meterId = req.body.meterId;
  var device = {
    deviceId: meterId
  }
  /*
    registry.create(device, function (err, deviceInfo, result) {
      res.setHeader('Content-Type', 'application/json');   
      if (err)
        registry.get(device.deviceId, printDeviceInfo);
      var devKey;
      if (deviceInfo) {
        devKey = deviceInfo.authentication.symmetricKey.primaryKey;
      var cs = setDeviceCS(meterId, devKey);
        console.log('device created, devKey: ' + cs);
  */
  // save this device {id, key} to redis
/*
  redis_client.on('connect', function () {
    console.log('connected to redis');
  });
  redis_client.set(meterId, cs, function (err, reply) {
    if (err) {
      console.log('error when writing to redis: ' + err);
    } else {
      console.log('wrote to redis: ' + reply);
    }
  });
*/
  // update DLMS proxy
  var jsonData = {
    "UniqueID": meterId,
    "DeviceConnectionString": "nothinghere",
    "DeviceIpAddress": ""
  }
  console.log(jsonData)
  var options = {
    url: url,
    body: JSON.stringify(jsonData),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  request(options, function (err, res, body) {
    if (err) { //need to rollback IoT Hub Registry
      console.log('Failed to update DLMS Proxy');
    } else {
      console.log('dlms proxy updated');
    }
  });

  //send acknowledge to provisioning app
  var opRes = { 'result': 'meter ' + meterId + ' added to registry' }
  //console.log(opRes)
  res.send(JSON.stringify(opRes));

  /*
} else { //something wrong in the attempt to register to iot hub
    console.log('no key')
      var opRes = { 'result': 'error', 'cause': 'something fishy happened' }
      res.send(JSON.stringify(opRes));
  }
  });
  */
});

router.delete('/', function (req, res, next) {

  var meterId = req.body.meterId;
  console.log('device to delete: ' + meterId);

  registry.delete(meterId, function (err, done) {
    res.setHeader('Content-Type', 'application/json');
    
    if (!err) {
      var opRes = { 'result': 'meter ' + meterId + ' removed from registry' }
      // remove from redis
      /*
      redis_client.del('meterId', function (err, reply) {
        console.log('deleted from redis: ' + reply);
      });
*/
      res.send(JSON.stringify(opRes));
    } else {
      console.log('error deleting device from IoT Hub: ' + err);
      var opRes = { 'result': 'error', 'cause': 'something fishy happened' }
      res.send(JSON.stringify(opRes));
    }
  });

});

module.exports = router;
