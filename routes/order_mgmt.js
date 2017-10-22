var express = require('express');
var router = express.Router();

var jsonfile = require('jsonfile');
var somFile = 'som.json';
var agentFile = 'agent.json';

var orderArray = [], agentArray = [];

var twilio = require('twilio');
var accountSid = 'AC32f7569dbb30616afb3189b17099e548'; // Your Account SID from www.twilio.com/console
var authToken = 'd0e1ccc59d34ca53b38bf068636c92a2';   // Your Auth Token from www.twilio.com/console
var client = new twilio(accountSid, authToken);

jsonfile.readFile(somFile, function (err, obj) {
  if (err)
    console.log(err)
  else {
    orderArray = obj;
  }
})

jsonfile.readFile(agentFile, function (err, obj) {
  if (err)
    console.log(err)
  else {
    agentArray = obj;
  }
});

var alertAgent = function (order) {
  console.log(agentArray)

  var i = 0;
  while (agentArray[i].agentId !== order.agentId) {
    console.log(agentArray[i].agentId)
    i++;
  }

  client.messages.create({
    body: 'DLMS Provisioning new order ' + order.orderId +  'created ',
    to: agentArray[i].msisdn,  // Text this number
    from: '+46765193249' // From a valid Twilio number
  })
    .then((message) => console.log(message.sid));
}

/* GET orders listing. */
router.get('/', function (req, res, next) {
  if (!req.query.agentId) {
    res.render('order', { title: 'DLMS Provisioning Back End', orders: orderArray });
  }
  else {
    var tasks = [];
    var found = orderArray.filter(function (element) {
      return element.agentId === req.query.agentId;
    });

    found.forEach(function (element) {
      tasks.push(element.orderSummary)
    })

    if (tasks.length > 0)
      res.send({ tasks });
    else
      res.send({ 'order': 'no order in backlog' });
  }
});

/* POST service order. */
router.post('/', function (req, res, next) {
  var order = {};

  order['agentId'] = req.body.agentId;
  order['orderId'] = req.body.orderId;
  order['orderSummary'] = req.body.orderSummary;
  orderArray.push(order);

  jsonfile.writeFile(somFile, orderArray, function (err) {
    if (err)
      res.render('error', err);
    else {
      alertAgent(order);
      res.render('order', { title: 'DLMS Provisioning Back End', orders: orderArray });
    }
  })



});

module.exports = router;