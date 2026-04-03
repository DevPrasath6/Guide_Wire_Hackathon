const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controllers/location.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/update', protect, updateLocation);

module.exports = router;
