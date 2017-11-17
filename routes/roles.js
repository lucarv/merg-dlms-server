'use strict';
const express = require('express');
const router = express.Router();

// ------ EXPRESS ROUTING ------ 
router.get('/agt_start', function (req, res, next) {
    res.render('agt_index', { title: 'DLMS Provisioning Back End' });
  });
router.get('/mgmt_start', function (req, res, next) {
  res.render('mgr_index', { title: 'DLMS Provisioning Back End' });
});



module.exports = router;
