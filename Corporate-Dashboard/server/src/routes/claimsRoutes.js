import express from 'express';
import { Claim } from '../models/Claim.js';
import { authRequired } from '../middleware/auth.js';
import { writeAuditLog } from '../services/auditService.js';
import { notifyUser } from '../services/notificationService.js';
import { buildClaimFeaturePayload, runAiPrediction } from '../services/aiDecisionService.js';

const router = express.Router();

router.post('/create', authRequired, async (req, res) => {
  try {
    const { type, hours, lat, lng, note } = req.body;
    if (!type || !hours) {
      return res.status(400).json({ message: 'type and hours are required' });
    }

    if (req.user.policy?.claimBanUntil && new Date(req.user.policy.claimBanUntil) > new Date()) {
      return res.status(403).json({ message: 'Claim submission temporarily banned due to prior fraud signal' });
    }

    let score = {
      fraudFlag: false,
      fraudScore: 15,
      confidence: 82,
      decision: 'pending',
      breakdown: {
        weatherSignal: 80,
        locationTrust: 88,
        fraudRisk: 15,
        policyFit: 79
      }
    };

    try {
      const payload = await buildClaimFeaturePayload({
        user: req.user,
        claimInput: { type, hours, lat, lng, note }
      });
      const prediction = await runAiPrediction(payload, 'predict');
      score = {
        ...score,
        confidence: prediction.confidence,
        decision: prediction.decision,
        fraudFlag: prediction.fraudFlag,
        fraudScore: prediction.fraudScore,
        breakdown: prediction.breakdown
      };
    } catch (err) {
      console.warn('ai scoring unavailable, using fallback scoring');
    }

    const claimedAmount = Math.round((req.user.profile?.dailyEarnings || 1200) * (hours / 8));

    const claim = await Claim.create({
      user: req.user._id,
      type,
      hours,
      lat,
      lng,
      note,
      claimedAmount,
      calculatedLoss: claimedAmount,
      aiConfidence: score.confidence,
      aiDecision: score.decision,
      aiBreakdown: score.breakdown,
      fraudFlag: Boolean(score.fraudFlag),
      fraudScore: Number(score.fraudScore || 0),
      status: 'pending'
    });

    if (claim.fraudFlag) {
      req.user.policy.planId = 'basic';
      req.user.policy.tier = 'Basic Shield';
      req.user.policy.weeklyPremium = Math.round((req.user.policy.weeklyPremium || 25) * 1.2);
      req.user.policy.fraudStrikeCount = (req.user.policy.fraudStrikeCount || 0) + 1;
      req.user.policy.claimBanUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await req.user.save();

      await notifyUser(
        req.user._id,
        'Fraud Signal Detected',
        'Your claim triggered fraud checks. Plan downgraded and claim submission is paused for 3 days.',
        'warning',
        { claimId: claim._id }
      );
    } else {
      await notifyUser(req.user._id, 'Claim Received', 'Your claim was received and is under review.', 'info', {
        claimId: claim._id
      });
    }

    await writeAuditLog(req, {
      action: 'claim_created',
      resourceType: 'claim',
      resourceId: claim._id.toString(),
      targetUser: req.user._id,
      changes: { type, hours, lat, lng, note }
    });

    const io = req.app.locals.io;
    io?.emit('admin:claim:new', claim);
    io?.to(req.user._id.toString()).emit('claim_update', claim);

    return res.status(201).json(claim);
  } catch (error) {
    return res.status(500).json({ message: 'claim creation failed', error: error.message });
  }
});

router.get('/my-claims', authRequired, async (req, res) => {
  const claims = await Claim.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json(claims);
});

router.get('/my-summary', authRequired, async (req, res) => {
  const claims = await Claim.find({ user: req.user._id });
  const approvedClaims = claims.filter((c) => c.status === 'approved').length;
  const pendingClaims = claims.filter((c) => c.status === 'pending').length;
  const rejectedClaims = claims.filter((c) => c.status === 'rejected').length;
  const protectedAmount = (req.user.policy?.weeklyPremium || 0) * 12;
  return res.json({
    protectedAmount,
    claimsFiled: claims.length,
    activeWeeks: Math.max(1, Math.ceil((Date.now() - new Date(req.user.createdAt).getTime()) / (7 * 86400000))),
    approvedClaims,
    pendingClaims,
    rejectedClaims
  });
});

export default router;
