import { PLAN_MAP, platformFactor, segmentFactor, shiftFactor } from '../config/plans.js';

export function calculatePremium(input) {
  const planId = (input.planId || 'standard').toLowerCase();
  const plan = PLAN_MAP[planId] || PLAN_MAP.standard;
  const dailyEarnings = Number(input.dailyEarnings || 1200);
  const workHours = Number(input.workHours || 8);
  const platform = (input.platform || 'default').toLowerCase();
  const segment = (input.segment || 'default').toLowerCase();
  const shift = (input.workShift || 'default').toLowerCase();

  const earningsFactor = Math.max(1, dailyEarnings / 1200);
  const hoursFactor = workHours > 8 ? 1 + (workHours - 8) * 0.04 : 1;
  const calculated =
    plan.weeklyPremium *
    earningsFactor *
    hoursFactor *
    (platformFactor[platform] || platformFactor.default) *
    (segmentFactor[segment] || segmentFactor.default) *
    (shiftFactor[shift] || shiftFactor.default);

  return {
    tier: input.tier || plan.tier,
    planId,
    weeklyPremium: Math.max(15, Math.round(calculated))
  };
}
