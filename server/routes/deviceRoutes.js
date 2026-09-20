const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/check-status', deviceController.checkActivationStatus);
router.post('/activate', deviceController.activateDevice);

module.exports = router;
