import express from 'express';
import { Claim } from '../models/Claim.js';
import { User } from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PERMISSIONS } from '../config/permissions.js';
import { writeAuditLog } from '../services/auditService.js';
import { notifyUser } from '../services/notificationService.js';
import {
  buildClaimFeaturePayload,
  detectHallucinationRisk,
  evaluatePayloadDataQuality,
  getAiSystemStatus,
  runAiPrediction
} from '../services/aiDecisionService.js';

const router = express.Router();

async function resolveTargetUser(req, userId) {
  if (!userId || String(userId) === String(req.user._id)) {
    return req.user;
  }

  const effectivePermissions = new Set(req.user.permissions || []);
  if (!effectivePermissions.has(PERMISSIONS.CLAIMS_READ_ALL)) {
    return null;
  }

  return User.findById(userId);
}

router.get('/health', authRequired, async (_req, res) => {
  const status = await getAiSystemStatus();
  return res.json({
    module: 'es-ai',
    endpoint: 'health',
    ...status
  });
});

router.get('/system-status', authRequired, async (_req, res) => {
  const status = await getAiSystemStatus();
  return res.json(status);
});

router.post('/predict', authRequired, async (req, res) => {
  const { userId, type, hours, lat, lng, note, accuracy, timestamp, source } = req.body;

  if (!type || !hours) {
    return res.status(400).json({ message: 'type and hours are required' });
  }

  const targetUser = await resolveTargetUser(req, userId);
  if (!targetUser) {
    return res.status(403).json({ message: 'Not allowed to predict for another user' });
  }

  const payload = await buildClaimFeaturePayload({
    user: targetUser,
    claimInput: { type, hours, lat, lng, note, accuracy, timestamp, source }
  });

  const dataQuality = evaluatePayloadDataQuality(payload);
  const prediction = await runAiPrediction(payload, 'predict');

  await writeAuditLog(req, {
    action: 'ai_prediction_requested',
    resourceType: 'ai',
    resourceId: targetUser._id.toString(),
    targetUser: targetUser._id,
    changes: {
      type,
      hours,
      decision: prediction.decision,
      confidence: prediction.confidence,
      fastApiConnected: prediction.fastApiConnected
    }
  });

  return res.json({
    fastApiVersion: prediction.fastApiVersion,
    dataQuality,
    prediction,
    payload
  });
});

router.post('/data-quality', authRequired, async (req, res) => {
  const { userId, payload, claimInput } = req.body;

  let targetPayload = payload;
  if (!targetPayload) {
    const targetUser = await resolveTargetUser(req, userId);
    if (!targetUser) {
      return res.status(403).json({ message: 'Not allowed to evaluate another user' });
    }
    targetPayload = await buildClaimFeaturePayload({ user: targetUser, claimInput: claimInput || {} });
  }

  const dataQuality = evaluatePayloadDataQuality(targetPayload);
  return res.json({ dataQuality, payload: targetPayload });
});

router.post('/hallucination-check', authRequired, async (req, res) => {
  const { prediction, payload } = req.body;
  if (!prediction || !payload) {
    return res.status(400).json({ message: 'prediction and payload are required' });
  }

  const hallucination = detectHallucinationRisk({ prediction, payload });
  return res.json({ hallucination });
});

router.get('/confidence/:claimId', authRequired, async (req, res) => {
  const claim = await Claim.findById(req.params.claimId).populate('user');
  if (!claim) return res.status(404).json({ message: 'Claim not found' });

  const sameUser = String(claim.user?._id || claim.user) === String(req.user._id);
  const effectivePermissions = new Set(req.user.permissions || []);
  const canViewAll = effectivePermissions.has(PERMISSIONS.CLAIMS_READ_ALL);
  if (!sameUser && !canViewAll) {
    return res.status(403).json({ message: 'Not allowed to view this claim confidence' });
  }

  return res.json({
    claimId: String(claim._id),
    aiDecision: claim.aiDecision,
    aiConfidence: claim.aiConfidence,
    fraudFlag: claim.fraudFlag,
    fraudScore: claim.fraudScore,
    aiBreakdown: claim.aiBreakdown,
    status: claim.status,
    timestamp: new Date().toISOString()
  });
});

async function runClaimDecision(req, res, mode) {
  const claim = await Claim.findById(req.params.claimId).populate('user');
  if (!claim) return res.status(404).json({ message: 'Claim not found' });

  const targetUser = claim.user;
  const payload = await buildClaimFeaturePayload({
    user: targetUser,
    claimInput: {
      type: claim.type,
      hours: claim.hours,
      lat: claim.lat,
      lng: claim.lng,
      note: claim.note
    }
  });

  const prediction = await runAiPrediction(payload, mode);

  const update = {
    aiDecision: prediction.decision,
    aiConfidence: prediction.confidence,
    fraudFlag: Boolean(prediction.fraudFlag),
    fraudScore: Number(prediction.fraudScore || 0),
    aiBreakdown: prediction.breakdown
  };

  if (mode === 'accept' && prediction.decision === 'accept') {
    update.status = 'approved';
    update.reason = 'Auto-approved by ES-AI';
  }

  if (mode === 'reject' && (prediction.decision === 'reject' || prediction.decision === 'fraud')) {
    update.status = 'rejected';
    update.reason = prediction.decision === 'fraud' ? 'Auto-rejected by ES-AI fraud signal' : 'Auto-rejected by ES-AI';
  }

  if (mode === 'fraud') {
    update.fraudFlag = prediction.decision === 'fraud';
    if (prediction.decision === 'fraud') {
      update.status = 'rejected';
      update.reason = 'Auto-flagged as fraud by ES-AI';
    }
  }

  const updatedClaim = await Claim.findByIdAndUpdate(claim._id, update, { new: true });

  if (updatedClaim && targetUser?._id) {
    await notifyUser(
      targetUser._id,
      `Claim ${updatedClaim.status}`,
      update.reason || `Claim updated to ${updatedClaim.status}`,
      updatedClaim.status === 'approved' ? 'success' : 'warning',
      { claimId: updatedClaim._id }
    );
  }

  await writeAuditLog(req, {
    action: `ai_claim_${mode}`,
    resourceType: 'claim',
    resourceId: claim._id.toString(),
    targetUser: targetUser?._id,
    changes: {
      mode,
      decision: prediction.decision,
      confidence: prediction.confidence,
      fraudScore: prediction.fraudScore,
      fastApiConnected: prediction.fastApiConnected,
      update
    }
  });

  req.app.locals.io?.emit('claim_update', updatedClaim);

  return res.json({
    mode,
    prediction,
    claim: updatedClaim
  });
}

router.post('/claims/:claimId/auto-accept', authRequired, requirePermission(PERMISSIONS.CLAIMS_UPDATE), async (req, res) =>
  runClaimDecision(req, res, 'accept'));

router.post('/claims/:claimId/auto-reject', authRequired, requirePermission(PERMISSIONS.CLAIMS_UPDATE), async (req, res) =>
  runClaimDecision(req, res, 'reject'));

router.post('/claims/:claimId/auto-fraud', authRequired, requirePermission(PERMISSIONS.CLAIMS_UPDATE), async (req, res) =>
  runClaimDecision(req, res, 'fraud'));

export default router;
