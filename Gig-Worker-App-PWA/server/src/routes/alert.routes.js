const express = require('express');
const router = express.Router();
const { getAlerts, createAlert } = require('../controllers/alert.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getAlerts);
router.post('/', createAlert);

module.exports = router;