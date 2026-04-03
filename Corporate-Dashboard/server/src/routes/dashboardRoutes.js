import express from 'express';
import { Claim } from '../models/Claim.js';
import { User } from '../models/User.js';
import { getDbHealth } from '../config/db.js';
import { authRequired } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { PERMISSIONS } from '../config/permissions.js';
import { writeAuditLog } from '../services/auditService.js';
import { notifyUser } from '../services/notificationService.js';

const router = express.Router();

function normalizeConfidence(claim) {
  if (typeof claim.aiConfidence === 'number') return claim.aiConfidence;
  if (typeof claim.aiScore === 'number') {
    return claim.aiScore <= 1 ? Math.round(claim.aiScore * 100) : Math.round(claim.aiScore);
  }
  return 0;
}

function getClaimAmounts(claim, worker) {
  const instantAmount = Number(claim.instantAmount || 0);
  const heldAmount = Number(claim.heldAmount || 0);
  const fromSettlement = instantAmount + heldAmount;
  const fromClaim = Number(claim.claimedAmount || 0);
  const fromLoss = Number(claim.calculatedLoss || 0);

  if (fromClaim > 0 || fromLoss > 0) {
    return {
      claimedAmount: fromClaim || fromLoss,
      calculatedLoss: fromLoss || fromClaim
    };
  }

  if (fromSettlement > 0) {
    return {
      claimedAmount: fromSettlement,
      calculatedLoss: fromSettlement
    };
  }

  // Fallback for older/shared claims that don't store amount fields.
  const dailyEarnings = Number(worker?.profile?.dailyEarnings || 0);
  const hours = Number(claim.hours || 0);
  const estimatedLoss = dailyEarnings > 0 && hours > 0 ? Math.round((dailyEarnings * hours) / 8) : 0;
  return {
    claimedAmount: estimatedLoss,
    calculatedLoss: estimatedLoss
  };
}

function getWeekLabel(date) {
  const d = new Date(date);
  return `W${Math.ceil(d.getDate() / 7)}-${d.toLocaleString('en-US', { month: 'short' })}`;
}

async function getSummaryPayload() {
  const [activePolicies, totalClaims, approvedClaims, fraudFlagged] = await Promise.all([
    User.countDocuments({ role: 'worker', 'policy.active': true }),
    Claim.countDocuments(),
    Claim.countDocuments({ status: 'approved' }),
    Claim.aggregate([
      { $match: { fraudFlag: true } },
      {
        $group: {
          _id: null,
          amount: {
            $sum: {
              $ifNull: [
                '$calculatedLoss',
                {
                  $add: [{ $ifNull: ['$instantAmount', 0] }, { $ifNull: ['$heldAmount', 0] }]
                }
              ]
            }
          }
        }
      }
    ])
  ]);

  const totalPayout = await Claim.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: null,
        amount: {
          $sum: {
            $ifNull: [
              '$calculatedLoss',
              {
                $add: [{ $ifNull: ['$instantAmount', 0] }, { $ifNull: ['$heldAmount', 0] }]
              }
            ]
          }
        }
      }
    }
  ]);

  return {
    activePolicies,
    claimsThisWeek: totalClaims,
    totalPayout: totalPayout[0]?.amount || 0,
    fraudBlocked: fraudFlagged[0]?.amount || 0,
    approvedClaims
  };
}

router.get('/summary', authRequired, requirePermission(PERMISSIONS.DASHBOARD_VIEW), async (_req, res) => {
  return res.json(await getSummaryPayload());
});

router.get('/kpis', authRequired, requirePermission(PERMISSIONS.DASHBOARD_VIEW), async (req, res) => {
  return res.json(await getSummaryPayload());
});

router.get('/live-claims', authRequired, requirePermission(PERMISSIONS.CLAIMS_READ_ALL), async (req, res) => {
  const { status, fraudFlag, zone, limit = 100 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (fraudFlag !== undefined) query.fraudFlag = fraudFlag === 'true';

  const claims = await Claim.find(query).sort({ createdAt: -1 }).limit(Number(limit)).lean();

  const workerIds = [...new Set(claims.map((claim) => String(claim.user || claim.userId || '')).filter(Boolean))];
  const workers = workerIds.length
    ? await User.find({ _id: { $in: workerIds } }).select('name profile policy').lean()
    : [];
  const workerById = new Map(workers.map((worker) => [String(worker._id), worker]));

  const formatted = claims
    .map((claim) => {
      const workerId = String(claim.user || claim.userId || '');
      const worker = workerById.get(workerId);
      const amounts = getClaimAmounts(claim, worker);
      return {
        id: claim._id,
        claimId: claim.claimId,
        workerName: worker?.name || 'Unknown',
        workerId,
        platform: worker?.profile?.platform || 'Unknown',
        zone: worker?.profile?.zone || 'Unknown',
        disruptionType: claim.type || 'Unknown Event',
        claimedAmount: amounts.claimedAmount,
        calculatedLoss: amounts.calculatedLoss,
        instantAmount: Number(claim.instantAmount || 0),
        heldAmount: Number(claim.heldAmount || 0),
        aiConfidence: normalizeConfidence(claim),
        aiDecision: claim.aiDecision || claim.decisionSource || 'pending',
        status: claim.status,
        date: claim.createdAt,
        fraudFlag: Boolean(claim.fraudFlag),
        policyPremium: worker?.policy?.weeklyPremium || 0,
        aiBreakdown: claim.aiBreakdown
      };
    })
    .filter((claim) => (zone ? claim.zone === zone : true));

  return res.json(formatted);
});

router.patch('/claims/:claimId/status', authRequired, requirePermission(PERMISSIONS.CLAIMS_UPDATE), async (req, res) => {
  const { status, reason, fraudFlag, fraudReason } = req.body;

  const update = {};
  if (status !== undefined) update.status = status;
  if (reason !== undefined) update.reason = reason;
  if (Object.prototype.hasOwnProperty.call(req.body, 'instantAmount')) {
    update.instantAmount = Number(req.body.instantAmount || 0);
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'heldAmount')) {
    update.heldAmount = Number(req.body.heldAmount || 0);
  }

  if (typeof fraudFlag === 'boolean') {
    update.fraudFlag = fraudFlag;
    if (fraudFlag) {
      update.reason = fraudReason || reason || 'Fraud flagged by operator';
      update.status = status || 'rejected';
      update.fraudScore = 100;
    }
  }

  const claim = await Claim.findByIdAndUpdate(
    req.params.claimId,
    update,
    { new: true }
  ).populate('user');

  if (!claim) return res.status(404).json({ message: 'Claim not found' });

  const targetUserId = claim.user?._id || claim.user || claim.userId;

  if (targetUserId) {
    await notifyUser(
      targetUserId,
      `Claim ${update.status || 'updated'}`,
      update.reason || `Your claim was marked as ${update.status || claim.status}`,
      update.status === 'approved' ? 'success' : 'warning',
      { claimId: claim._id }
    );
  }

  await writeAuditLog(req, {
    action: 'claim_status_updated',
    resourceType: 'claim',
    resourceId: claim._id.toString(),
    targetUser: targetUserId,
    changes: { ...update, fraudReason }
  });

  req.app.locals.io?.emit('claim_update', claim);
  return res.json(claim);
});

router.get('/policies', authRequired, requirePermission(PERMISSIONS.POLICIES_READ_ALL), async (req, res) => {
  const workers = await User.find({ role: 'worker' }).select('name profile policy payout');
  const data = workers.map((worker) => ({
    id: worker._id,
    workerId: worker._id,
    workerName: worker.name,
    platform: worker.profile?.platform,
    zone: worker.profile?.zone,
    coverageType: worker.policy?.tier,
    coverageAmount: Math.round((worker.profile?.dailyEarnings || 1200) * 7),
    weeklyPremium: worker.policy?.weeklyPremium || 0,
    riskScore: Math.min(99, Math.round((worker.policy?.fraudStrikeCount || 0) * 15 + (worker.profile?.workHours || 8) * 4)),
    status: worker.policy?.active ? 'active' : 'suspended',
    claimsThisMonth: 0,
    totalPayouts: 0,
    premiumBreakdown: {
      base: 25,
      zoneFactor: 10,
      riskMultiplier: 1.1,
      finalPremium: worker.policy?.weeklyPremium || 0
    },
    triggersEnabled: worker.policy?.triggersEnabled || ['Heavy Rain', 'Flood', 'Heatwave']
  }));
  return res.json(data);
});

router.patch('/policies/:policyId', authRequired, requirePermission(PERMISSIONS.POLICIES_UPDATE), async (req, res) => {
  const worker = await User.findById(req.params.policyId);
  if (!worker || worker.role !== 'worker') return res.status(404).json({ message: 'Policy holder not found' });

  worker.policy = worker.policy || {};

  if (req.body.status) {
    worker.policy.active = req.body.status !== 'suspended';
  }
  if (req.body.weeklyPremium !== undefined) {
    worker.policy.weeklyPremium = Number(req.body.weeklyPremium);
  }
  if (req.body.coverageType) {
    worker.policy.tier = req.body.coverageType;
  }
  if (req.body.planId) {
    worker.policy.planId = req.body.planId;
  }
  if (req.body.fraudStrikeCount !== undefined) {
    worker.policy.fraudStrikeCount = Number(req.body.fraudStrikeCount);
  }
  if (req.body.claimBanUntil) {
    worker.policy.claimBanUntil = new Date(req.body.claimBanUntil);
  }
  if (Array.isArray(req.body.triggersEnabled)) {
    worker.policy.triggersEnabled = req.body.triggersEnabled;
  }

  worker.profile = worker.profile || {};
  if (req.body.zone) {
    worker.profile.zone = req.body.zone;
  }
  if (req.body.platform) {
    worker.profile.platform = req.body.platform;
  }

  await worker.save();

  await writeAuditLog(req, {
    action: 'policy_updated_by_admin',
    resourceType: 'policy',
    resourceId: worker._id.toString(),
    targetUser: worker._id,
    changes: req.body
  });

  await notifyUser(worker._id, 'Policy Updated', 'Your coverage settings were updated by support.', 'info', {
    policyId: worker._id
  });

  return res.json({ success: true });
});

router.get('/analytics', authRequired, requirePermission(PERMISSIONS.ANALYTICS_VIEW), async (_req, res) => {
  const claims = await Claim.find().sort({ createdAt: -1 }).limit(400);
  const weeklyClaimsByTypeMap = new Map();
  const payoutTierMap = { Basic: 0, Standard: 0, Premium: 0 };
  const premiumVsPayoutMap = new Map();

  claims.forEach((claim) => {
    const day = new Date(claim.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    if (!weeklyClaimsByTypeMap.has(day)) {
      weeklyClaimsByTypeMap.set(day, { day, Rain: 0, Flood: 0, Heat: 0, Curfew: 0, Strike: 0, Pollution: 0 });
    }
    const row = weeklyClaimsByTypeMap.get(day);
    if (claim.type.toLowerCase().includes('rain')) row.Rain += 1;
    else if (claim.type.toLowerCase().includes('flood')) row.Flood += 1;
    else if (claim.type.toLowerCase().includes('heat')) row.Heat += 1;
    else if (claim.type.toLowerCase().includes('curfew')) row.Curfew += 1;
    else if (claim.type.toLowerCase().includes('strike')) row.Strike += 1;
    else row.Pollution += 1;

    const tier = claim.claimedAmount > 3000 ? 'Premium' : claim.claimedAmount > 1500 ? 'Standard' : 'Basic';
    payoutTierMap[tier] += 1;

    const week = getWeekLabel(claim.createdAt);
    if (!premiumVsPayoutMap.has(week)) {
      premiumVsPayoutMap.set(week, { week, premiumCollected: 0, payoutMade: 0, fraudBlocked: 0 });
    }
    const weekRow = premiumVsPayoutMap.get(week);
    const effectiveLoss = Number(claim.calculatedLoss || claim.claimedAmount || claim.instantAmount + claim.heldAmount || 0);
    weekRow.premiumCollected += 45;
    if (claim.status === 'approved') weekRow.payoutMade += effectiveLoss;
    if (claim.fraudFlag) weekRow.fraudBlocked += effectiveLoss;
  });

  const zoneAgg = await User.aggregate([
    { $match: { role: 'worker' } },
    {
      $group: {
        _id: '$profile.zone',
        count: { $sum: 1 },
        avgFraud: { $avg: '$policy.fraudStrikeCount' }
      }
    }
  ]);

  const zoneClaimsMap = zoneAgg.map((row) => ({
    name: row._id || 'Unknown',
    claimCount: row.count * 2,
    fraudRate: Number((row.avgFraud * 2.5).toFixed(1)),
    risk: row.avgFraud > 2 ? 'high' : row.avgFraud > 0.8 ? 'medium' : 'low'
  }));

  const payoutTierBreakdown = Object.entries(payoutTierMap).map(([name, value], idx) => ({
    name,
    value,
    color: ['#00C896', '#3B82F6', '#F59E0B'][idx]
  }));

  const lossRatioTrend = Array.from(premiumVsPayoutMap.values()).map((item) => ({
    week: item.week,
    ratio: item.premiumCollected ? Number((item.payoutMade / item.premiumCollected).toFixed(2)) : 0
  }));

  return res.json({
    nextWeekPrediction: {
      expectedClaims: Math.max(8, Math.round(claims.length * 0.15)),
      highRiskZones: zoneClaimsMap.filter((z) => z.risk === 'high').map((z) => z.name).slice(0, 3),
      predictedPayout: Math.max(
        50000,
        claims.reduce((acc, c) => acc + Number(c.calculatedLoss || c.claimedAmount || c.instantAmount + c.heldAmount || 0), 0) * 0.18
      ),
      confidenceLevel: 88
    },
    weeklyClaimsByType: Array.from(weeklyClaimsByTypeMap.values()),
    payoutTierBreakdown,
    premiumVsPayoutTrend: Array.from(premiumVsPayoutMap.values()),
    zoneClaimsMap,
    lossRatioTrend
  });
});

router.get('/status', authRequired, requirePermission(PERMISSIONS.DASHBOARD_VIEW), async (_req, res) => {
  const dbHealth = getDbHealth();
  return res.json({
    status: dbHealth.privateDbConnected && dbHealth.publicDbConnected ? 'connected' : 'degraded',
    db_connected: dbHealth.privateDbConnected && dbHealth.publicDbConnected,
    private_db_connected: dbHealth.privateDbConnected,
    public_db_connected: dbHealth.publicDbConnected,
    ai_connected: true,
    dashboard_connected: true,
    lastSync: new Date().toISOString()
  });
});

export default router;
