const express = require('express');
const router = express.Router();
const { analyzeClaim, getAiStatus } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/analyze-claim', protect, analyzeClaim);
router.get('/status', getAiStatus);

module.exports = router;
