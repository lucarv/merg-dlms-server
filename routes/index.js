'use strict';
const request = require('request');
var url = 'http://newdeviceapi20171102033605.azurewebsites.net/api/values'


var express = require('express');
var router = express.Router();

// azure sdk
var iothub = require('azure-iothub');
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;

/*
var redis = require('redis');
var redis_client = redis.createClient(6380, 'mnrg.redis.cache.windows.net',
  {
    auth_pass: 'uknIuZnrJtF0lrcWyFNl5/y+NiCUOBT7hqE0PtguPXo=',
    tls: { servername: 'mnrg.redis.cache.windows.net' }
  });
redis_client.on('connect', function () {
  console.log('connected');
});
*/

var client;
var hubCS = 'HostName=dlms-luca.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=Ltpaai5Vzsv12qcJfB7FMV4+1XPs4Z14qcdIsFHx6/g='
var registry = iothub.Registry.fromConnectionString(hubCS);
var hubName = hubCS.substring(0, hubCS.indexOf(';'));

function printDeviceInfo(err, deviceInfo, res) {
  if (deviceInfo) {
    var deviceKey = deviceInfo.authentication.symmetricKey.primaryKey;
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  redis_client.del('meterId', function (err, reply) {
    console.log(reply);
  });
  res.render('index', { title: 'DLMS Provisioning Back End' });
});

router.post('/', function (req, res, next) {

  var meterId = req.body.meterId;
  var device = {
    deviceId: meterId
  }

  registry.create(device, function (err, deviceInfo, result) {
    if (err)
      registry.get(device.deviceId, printDeviceInfo);

    var devKey;

    if (deviceInfo) {
      devKey = deviceInfo.authentication.symmetricKey.primaryKey;
      console.log('device created, devKey: ' + devKey);

      var jsonData = {
        ID: meterId,
        Connstr: devKey
      }

      const options = {
        method: 'post',
        body: jsonData,
        json: 'true',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: url
      }

      
      request(options, function (err, res, body) {
        if (err) {
          console.error('error posting json: ', err)
          throw err
        }
        var headers = res.headers
        var statusCode = res.statusCode
        console.log('headers: ', headers)
        console.log('statusCode: ', statusCode)
        console.log('body: ', body)
      })

      
      /*
            redis_client.set(meterId, devKey, function(err, reply) {
              console.log(reply);
          });
      */

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
