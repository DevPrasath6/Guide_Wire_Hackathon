import axios from 'axios';
import { Claim } from '../models/Claim.js';
import { getDbHealth } from '../config/db.js';

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const FASTAPI_VERSION = process.env.FASTAPI_VERSION || 'v1';
const LOCATION_WINDOW_MS = 60 * 60 * 1000;

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
    const asDate = Date.parse(value);
    if (Number.isFinite(asDate)) return asDate;
  }
  if (value instanceof Date) return value.getTime();
  return null;
}

function pickCurrentLocation(user, claimInput) {
  const lat = claimInput?.lat ?? user?.currentLocation?.lat;
  const lng = claimInput?.lng ?? user?.currentLocation?.lng;
  const accuracy = claimInput?.accuracy ?? user?.currentLocation?.accuracy ?? null;
  const timestamp =
    toTimestamp(claimInput?.timestamp) ||
    toTimestamp(user?.currentLocation?.timestamp) ||
    Date.now();

  return {
    lat: toFiniteNumber(lat, null),
    lng: toFiniteNumber(lng, null),
    accuracy: accuracy == null ? null : toFiniteNumber(accuracy, null),
    timestamp,
    source: claimInput?.source || user?.currentLocation?.source || 'unknown'
  };
}

function getPastHourLocations(user) {
  const now = Date.now();
  const start = now - LOCATION_WINDOW_MS;
  const history = Array.isArray(user?.locationHistory) ? user.locationHistory : [];

  return history
    .map((point) => ({
      lat: toFiniteNumber(point?.lat, null),
      lng: toFiniteNumber(point?.lng, null),
      accuracy: point?.accuracy == null ? null : toFiniteNumber(point.accuracy, null),
      timestamp: toTimestamp(point?.timestamp),
      source: point?.source || 'unknown'
    }))
    .filter((point) => point.timestamp && point.timestamp >= start && point.timestamp <= now)
    .sort((a, b) => a.timestamp - b.timestamp);
}

function summarizePreviousClaims(previousClaims) {
  const total = previousClaims.length;
  const approved = previousClaims.filter((claim) => claim.status === 'approved').length;
  const rejected = previousClaims.filter((claim) => claim.status === 'rejected').length;
  const pending = previousClaims.filter((claim) => claim.status === 'pending' || claim.status === 'under_review').length;
  const fraudFlagged = previousClaims.filter((claim) => Boolean(claim.fraudFlag)).length;

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const claimsLast90Days = previousClaims.filter((claim) => {
    const createdAt = toTimestamp(claim.createdAt);
    return createdAt && createdAt >= ninetyDaysAgo;
  }).length;

  const avgClaimedAmount =
    total > 0
      ? Math.round(
          previousClaims.reduce((sum, claim) => sum + toFiniteNumber(claim.claimedAmount, 0), 0) / total
        )
      : 0;

  return {
    total,
    approved,
    rejected,
    pending,
    fraudFlagged,
    claimsLast90Days,
    rejectionRate: total > 0 ? Number((rejected / total).toFixed(3)) : 0,
    fraudRate: total > 0 ? Number((fraudFlagged / total).toFixed(3)) : 0,
    averageClaimedAmount: avgClaimedAmount
  };
}

export async function buildClaimFeaturePayload({ user, claimInput = {} }) {
  const previousClaims = await Claim.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const currentLocation = pickCurrentLocation(user, claimInput);
  const pastHourLocations = getPastHourLocations(user);

  const locationCompleteness =
    Number(currentLocation.lat != null) +
    Number(currentLocation.lng != null) +
    Number(currentLocation.timestamp != null);

  const previousSummary = summarizePreviousClaims(previousClaims);

  return {
    fastApiVersion: FASTAPI_VERSION,
    requestTimestamp: new Date().toISOString(),
    claim: {
      type: claimInput.type,
      hours: toFiniteNumber(claimInput.hours, 0),
      note: claimInput.note || null,
      claimedAmountEstimate: Math.round((user.profile?.dailyEarnings || 1200) * (toFiniteNumber(claimInput.hours, 0) / 8))
    },
    rider: {
      userId: String(user._id),
      name: user.name,
      zone: user.profile?.zone || 'unknown',
      platform: user.profile?.platform || 'unknown',
      segment: user.profile?.segment || 'unknown',
      dailyEarnings: toFiniteNumber(user.profile?.dailyEarnings, 0),
      policy: {
        tier: user.policy?.tier || 'unknown',
        planId: user.policy?.planId || 'unknown',
        weeklyPremium: toFiniteNumber(user.policy?.weeklyPremium, 0),
        active: Boolean(user.policy?.active),
        fraudStrikeCount: toFiniteNumber(user.policy?.fraudStrikeCount, 0),
        claimBanUntil: user.policy?.claimBanUntil || null
      }
    },
    location: {
      current: currentLocation,
      past1Hour: {
        sampleCount: pastHourLocations.length,
        points: pastHourLocations
      },
      telemetry: {
        sourceCoverage: locationCompleteness,
        hasLiveLocation: currentLocation.lat != null && currentLocation.lng != null
      }
    },
    previousClaims: {
      summary: previousSummary,
      recent: previousClaims.slice(0, 10).map((claim) => ({
        claimId: String(claim._id),
        createdAt: claim.createdAt,
        status: claim.status,
        type: claim.type,
        hours: toFiniteNumber(claim.hours, 0),
        claimedAmount: toFiniteNumber(claim.claimedAmount, 0),
        aiConfidence: toFiniteNumber(claim.aiConfidence, 0),
        fraudFlag: Boolean(claim.fraudFlag),
        fraudScore: toFiniteNumber(claim.fraudScore, 0)
      }))
    }
  };
}

export function evaluatePayloadDataQuality(payload) {
  const checks = [
    { key: 'claim.type', pass: Boolean(payload?.claim?.type) },
    { key: 'claim.hours', pass: toFiniteNumber(payload?.claim?.hours, 0) > 0 },
    { key: 'rider.userId', pass: Boolean(payload?.rider?.userId) },
    { key: 'location.current.lat', pass: payload?.location?.current?.lat != null },
    { key: 'location.current.lng', pass: payload?.location?.current?.lng != null },
    { key: 'location.current.timestamp', pass: Boolean(payload?.location?.current?.timestamp) },
    { key: 'previousClaims.summary.total', pass: payload?.previousClaims?.summary?.total != null }
  ];

  const passed = checks.filter((check) => check.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    score,
    grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D',
    missing: checks.filter((check) => !check.pass).map((check) => check.key),
    checks
  };
}

function heuristicDecision(payload, mode = 'predict') {
  const summary = payload.previousClaims.summary;
  const hasCurrentLocation = payload.location.telemetry.hasLiveLocation;
  const locationDensity = payload.location.past1Hour.sampleCount;

  let fraudScore = 0;
  if (!hasCurrentLocation) fraudScore += 25;
  if (locationDensity < 2) fraudScore += 20;
  if (summary.fraudRate >= 0.2) fraudScore += 25;
  if (summary.rejectionRate >= 0.4) fraudScore += 20;
  if ((payload.claim.hours || 0) > 12) fraudScore += 15;
  fraudScore = Math.max(0, Math.min(100, fraudScore));

  let decision = 'review';
  if (fraudScore >= 75) decision = 'fraud';
  else if (fraudScore >= 55) decision = 'reject';
  else if (fraudScore <= 30) decision = 'accept';

  if (mode === 'accept') decision = fraudScore < 60 ? 'accept' : 'review';
  if (mode === 'reject') decision = fraudScore >= 35 ? 'reject' : 'review';
  if (mode === 'fraud') decision = fraudScore >= 60 ? 'fraud' : 'review';

  const confidence = Math.max(35, Math.min(98, Math.round(95 - fraudScore * 0.55)));

  return {
    decision,
    confidence,
    fraudScore,
    fraudFlag: decision === 'fraud',
    reason: `fallback_${decision}_from_heuristics`,
    breakdown: {
      weatherSignal: 70,
      locationTrust: hasCurrentLocation ? Math.max(40, 80 - Math.max(0, 5 - locationDensity) * 8) : 35,
      fraudRisk: fraudScore,
      policyFit: payload.rider.policy.active ? 85 : 45
    }
  };
}

async function tryFastApi(path, payload) {
  const target = `${FASTAPI_BASE_URL}${path}`;
  try {
    const response = await axios.post(
      target,
      {
        version: FASTAPI_VERSION,
        payload
      },
      { timeout: 4000 }
    );
    return { connected: true, data: response.data };
  } catch (_err) {
    return { connected: false, data: null };
  }
}

function normalizePredictionResult(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback;
  const decision = raw.decision || raw.result || fallback.decision;
  return {
    decision,
    confidence: toFiniteNumber(raw.confidence, fallback.confidence),
    fraudScore: toFiniteNumber(raw.fraudScore, fallback.fraudScore),
    fraudFlag: typeof raw.fraudFlag === 'boolean' ? raw.fraudFlag : decision === 'fraud' || fallback.fraudFlag,
    reason: raw.reason || fallback.reason,
    breakdown: {
      weatherSignal: toFiniteNumber(raw.breakdown?.weatherSignal, fallback.breakdown.weatherSignal),
      locationTrust: toFiniteNumber(raw.breakdown?.locationTrust, fallback.breakdown.locationTrust),
      fraudRisk: toFiniteNumber(raw.breakdown?.fraudRisk, fallback.breakdown.fraudRisk),
      policyFit: toFiniteNumber(raw.breakdown?.policyFit, fallback.breakdown.policyFit)
    }
  };
}

export async function runAiPrediction(payload, mode = 'predict') {
  const fallback = heuristicDecision(payload, mode);
  const pathsByMode = {
    predict: '/es-ai/predict',
    accept: '/es-ai/decision/accept',
    reject: '/es-ai/decision/reject',
    fraud: '/es-ai/decision/fraud'
  };

  const fastApiPath = pathsByMode[mode] || pathsByMode.predict;
  const fastApiResult = await tryFastApi(fastApiPath, payload);
  const result = normalizePredictionResult(fastApiResult.data, fallback);

  return {
    mode,
    fastApiConnected: fastApiResult.connected,
    fastApiVersion: FASTAPI_VERSION,
    ...result
  };
}

export async function getAiSystemStatus() {
  const db = getDbHealth();
  let fastApiConnected = false;
  let fastApiHealth = null;

  try {
    const response = await axios.get(`${FASTAPI_BASE_URL}/health`, { timeout: 3000 });
    fastApiConnected = true;
    fastApiHealth = response.data;
  } catch (_err) {
    fastApiConnected = false;
  }

  const connected = Boolean(db.privateDbConnected && db.publicDbConnected && fastApiConnected);

  return {
    status: connected ? 'system_connected' : 'system_disconnected',
    connected,
    components: {
      privateDbConnected: db.privateDbConnected,
      publicDbConnected: db.publicDbConnected,
      fastApiConnected
    },
    fastApiVersion: FASTAPI_VERSION,
    fastApiHealth,
    timestamp: new Date().toISOString()
  };
}

export function detectHallucinationRisk({ payload, prediction }) {
  const reasons = Array.isArray(prediction?.reasoning) ? prediction.reasoning : [prediction?.reason].filter(Boolean);
  const joinedReasons = reasons.join(' ').toLowerCase();

  let score = 0;
  const flags = [];

  if (joinedReasons.includes('weather') && prediction?.breakdown?.weatherSignal == null) {
    score += 30;
    flags.push('weather_reason_without_weather_evidence');
  }

  if (joinedReasons.includes('location') && !payload?.location?.telemetry?.hasLiveLocation) {
    score += 35;
    flags.push('location_reason_without_live_location');
  }

  if (joinedReasons.includes('history') && payload?.previousClaims?.summary?.total === 0) {
    score += 25;
    flags.push('history_reason_without_claim_history');
  }

  if (!prediction?.decision) {
    score += 40;
    flags.push('missing_decision');
  }

  const risk = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

  return {
    risk,
    score,
    flags,
    recommendedAction:
      risk === 'high' ? 'manual_review_required' : risk === 'medium' ? 'request_model_recheck' : 'safe_to_proceed'
  };
}
