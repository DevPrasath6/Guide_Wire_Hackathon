const Claim = require('../models/Claim');
const User = require('../models/User');
const Notification = require('../models/Notification');
const axios = require('axios');

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard totals and summary metrics
 *     tags: [Corporate Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      totalClaims,
      approvedClaims,
      pendingClaims,
      rejectedClaims,
      payoutAgg,
      recentClaims,
      activeUsers
    ] = await Promise.all([
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'approved' }),
      Claim.countDocuments({ status: 'pending' }),
      Claim.countDocuments({ status: 'rejected' }),
      Claim.aggregate([
        { $match: { status: { $in: ['approved', 'pending'] } } },
        { $group: { _id: null, instant: { $sum: '$instantAmount' }, held: { $sum: '$heldAmount' } } }
      ]),
      Claim.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name profile.zone profile.platform').lean(),
      User.countDocuments({ isOnline: true })
    ]);

    const payoutInstant = payoutAgg?.[0]?.instant || 0;
    const payoutHeld = payoutAgg?.[0]?.held || 0;

    res.json({
      totalClaims,
      approvedClaims,
      pendingClaims,
      rejectedClaims,
      payoutInstant,
      payoutHeld,
      payoutTotal: payoutInstant + payoutHeld,
      activeUsers,
      recentClaims: recentClaims.map((c) => ({
        id: c._id,
        claimId: c.claimId,
        type: c.type,
        status: c.status,
        amount: (c.instantAmount || 0) + (c.heldAmount || 0),
        zone: c.userId?.profile?.zone || 'unknown',
        platform: c.userId?.profile?.platform || 'unknown',
        userName: c.userId?.name || 'worker',
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardKpis = async (req, res) => {
  return exports.getDashboardSummary(req, res);
};

exports.getLiveClaims = async (req, res) => {
  try {
    const { status, fraudFlag, zone, limit = 50 } = req.query;
    const match = {};
    if (status) match.status = status;
    if (fraudFlag === 'true') match.fraudFlag = true;
    if (fraudFlag === 'false') match.fraudFlag = false;

    const claims = await Claim.find(match)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('userId', 'name profile.zone profile.platform profile.segment policy.weeklyPremium policy.planId policy.tier')
      .lean();

    const filtered = zone
      ? claims.filter((c) => String(c.userId?.profile?.zone || '').toLowerCase() === String(zone).toLowerCase())
      : claims;

    res.status(200).json({
      claims: filtered.map((c) => ({
        id: c._id,
        claimId: c.claimId,
        userId: c.userId?._id,
        userName: c.userId?.name,
        type: c.type,
        hours: c.hours,
        status: c.status,
        aiScore: c.aiScore,
        instantAmount: c.instantAmount,
        heldAmount: c.heldAmount,
        fraudFlag: c.fraudFlag,
        decisionSource: c.decisionSource,
        location: c.location,
        zone: c.userId?.profile?.zone,
        platform: c.userId?.profile?.platform,
        segment: c.userId?.profile?.segment,
        userPolicyTier: c.userId?.policy?.tier,
        userPolicyPremium: c.userId?.policy?.weeklyPremium,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/dashboard/status:
 *   get:
 *     summary: Verify dashboard microservice connectivity
 *     tags: [Corporate Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard connection status
 */
exports.getDashboardStatus = async (req, res) => {
  const dbConnected = !!(require('mongoose').connection.readyState === 1);
  let aiConnected = false;
  try {
    const fastapiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    await axios.get(`${fastapiUrl}/health`, { timeout: 2000 });
    aiConnected = true;
  } catch (_) {
    aiConnected = false;
  }

  res.json({
    status: 'connected',
    db_connected: dbConnected,
    ai_connected: aiConnected,
    dashboard_connected: true,
    lastSync: new Date()
  });
};

exports.updateClaimStatus = async (req, res) => {
  try {
    if (!['admin', 'superuser'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden: admin access required' });
    }

    const { claimId } = req.params;
    const { status, reason, instantAmount, heldAmount } = req.body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    claim.status = status;
    claim.decisionSource = 'admin';
    if (typeof instantAmount === 'number') claim.instantAmount = Math.max(0, instantAmount);
    if (typeof heldAmount === 'number') claim.heldAmount = Math.max(0, heldAmount);
    claim.reviewReason = reason || claim.reviewReason || '';
    await claim.save();

    const title = status === 'approved' ? 'Claim Approved' : status === 'rejected' ? 'Claim Rejected' : 'Claim Under Review';
    const message = status === 'approved'
      ? `₹${claim.instantAmount} approved for payout.`
      : status === 'rejected'
        ? (claim.reviewReason || 'Your claim was rejected after review.')
        : 'Your claim is under admin review.';

    await Notification.create({
      userId: claim.userId,
      title,
      message,
      type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning',
      meta: { claimId: claim._id, source: 'dashboard-admin' }
    });

    res.status(200).json({ claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
