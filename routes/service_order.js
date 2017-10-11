var express = require('express');
var router = express.Router();
var jsonfile = require('jsonfile');
var somFile = 'som.json';
var orderArray = [];

jsonfile.readFile(somFile, function (err, obj) {
  if (obj) {
    orderArray = obj;
    for (var i = 0; i < obj.length; i++) {
      switch (obj[i].type) {
        case 'system':
          sysArray.push(obj[i]);
          break;
        case 'tag':
          tagArray.push(obj[i]);
          break;
        case 'property':
          propArray.push(obj[i]);
          break;
      }
    }
  }
})

/* GET orders listing. */
router.get('/', function (req, res, next) {
  console.log(req.query.agentId);
  var tasks = [];
  var found = orderArray.filter(function (item) { return item.agentId === req.query.agentId; });
  found.forEach(function (element) {
    console.log(element.agentId)
    tasks.push(element.orderSummary)
  })

  if (tasks.length > 0)
    res.send({ tasks });
  else
    res.send({ 'order': 'no order in backlog' });

});

/* POST service order. */
router.post('/', function (req, res, next) {
  var order = {};

  order['agentId'] = req.body.agentId;
  order['orderNumber'] = req.body.orderNumber;
  order['orderSummary'] = req.body.orderSummary;

  orderArray.push(order);

  jsonfile.writeFile(somFile, orderArray, function (err) {
    if (err)
      console.error(err);
    else
      console.log('service order written to file');
  })
  res.send(req.body);

});

module.exports = router;
