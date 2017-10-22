var express = require('express');
var router = express.Router();

var jsonfile = require('jsonfile');
var agentFile = 'agent.json';
var agentArray = [];


jsonfile.readFile(agentFile, function (err, obj) {
    agentArray = obj;
})


/* GET agent listing. */
router.get('/', function (req, res, next) {
    res.render('agent', { title: 'DLMS Provisioning Back End', agents: agentArray });
});

/* POST agent. */
router.post('/', function (req, res, next) {
    var agent = {};

    agent['agentId'] = req.body.agentId;
    agent['msdn'] = req.body.msisdn;
    agent['name'] = req.body.name;

    console.log(agentArray)
    console.log(agent)

    agentArray.push(agent);

    jsonfile.writeFile(agentFile, agentArray, function (err) {
        if (err)
            res.render('error', err);
        else
            res.render('agent', { title: 'DLMS Provisioning Back End', agents: agentArray });
    })
});

module.exports = router;
