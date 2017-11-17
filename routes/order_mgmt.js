var express = require('express');
var router = express.Router();

var jsonfile = require('jsonfile');
var somFile = 'som.json';
var agentFile = 'agent.json';

var orderArray = [], agentArray = [];
var agentId = null;

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
  var found = null;
  for (var i = 0; i < agentArray.length; i++) {
    if (agentArray[i].agentId === order.agentId)
      found = agentArray[i].msisdn
  }

  if (found) {
    client.messages.create({
      body: 'DLMS Provisioning new order ' + order.orderId + 'created ',
      to: found,  // Text this number
      from: '+46765193249' // From a valid Twilio number
    })
      .then((message) => console.log(message.sid));
    return 'found'
  }

  return 'no agent found'
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

/* POST service order from DLMS Proxy. */
router.post('/', function (req, res, next) {
  var order = {};
  var str = JSON.stringify(req.body)
  //regexp to 'clean' the request
  str = str.replace(/\\/g, "");
  str = str.replace(/{"{/g, "{");
  str = str.replace(/":""}/g, "");
  var cleanParams = JSON.parse(str);

  order['agentId'] = cleanParams.agentId;
  order['orderId'] = cleanParams.orderId;
  order['orderSummary'] = cleanParams.orderSummary;
  /* this is the code if the other side is not dotnet
 order['agentId'] = req.body.agentId;
 order['orderId'] = req.body.orderId;
 order['orderSummary'] = req.body.orderSummary;
 */
  orderArray.push(order);
  var alert = alertAgent(order);
  if (alert === 'found') {
    jsonfile.writeFile(somFile, orderArray, function (err) {
      if (err)
        res.send({ 'order': { 'result': 'error', 'error': err } });
      else
        res.send({ 'order': 'success' });
    });
  }
  else
    res.send({ order: { 'result': 'error', 'error': alert } });
});


/* POST service order. */
router.post('/web', function (req, res, next) {
  var order = {};

  var str = JSON.stringify(req.body)
  var ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  order['agentId'] = req.body.agentId;
  order['orderId'] = req.body.orderId;
  order['orderSummary'] = req.body.orderSummary;
  order['timeStamp'] = ts;
  orderArray.push(order);

  jsonfile.writeFile(somFile, orderArray, function (err) {
    if (err)
      res.send({ 'order': { 'result': 'error', 'error': err } });
    else
      res.render('order', { title: 'DLMS Provisioning Back End', orders: orderArray });
  });
});

router.post('/ack', function (req, res, next) {
  var checked = req.body;

  var render = 'order';
  if (agentId)
    render = 'ag_order';

  for (key in checked)
    for (var i = 0; i < orderArray.length; i++)
      if (orderArray[i].orderId == key)
        orderArray.splice(i, 1);

  jsonfile.writeFile(somFile, orderArray, function (err) {
    if (err)
      res.render({ 'error': { title: 'DLMS Provisioning Back End', 'error': err } });
    else
      res.render(render, { title: 'DLMS Provisioning Back End', orders: orderArray });
  });
});

router.post('/signin', function (req, res, next) {
  agentId = req.body.agentId;
  var tempOrder = []
  // select orders for this agent
  for (var i = 0; i < orderArray.length; i++)
    if (orderArray[i].agentId == agentId)
      tempOrder.push(orderArray[i]);

  res.render('ag_order', { title: 'DLMS Provisioning Back End', orders: tempOrder });
})

module.exports = router;
