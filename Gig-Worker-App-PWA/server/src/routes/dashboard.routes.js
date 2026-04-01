const express = require('express');
const router = express.Router();
const { getDashboardSummary, getDashboardKpis, getDashboardStatus, getLiveClaims, updateClaimStatus } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/summary', protect, getDashboardSummary);
router.get('/kpis', protect, getDashboardKpis);
router.get('/live-claims', protect, getLiveClaims);
router.get('/status', getDashboardStatus);
router.patch('/claims/:claimId/status', protect, updateClaimStatus);

module.exports = router;
