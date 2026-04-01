export const PLAN_MAP = {
  basic: { tier: 'Basic Shield', weeklyPremium: 25 },
  standard: { tier: 'Standard Shield', weeklyPremium: 45 },
  premium: { tier: 'Premium Shield', weeklyPremium: 70 }
};

export const platformFactor = {
  rapido: 1.1,
  uber: 1.15,
  zomato: 1.05,
  swiggy: 1.05,
  amazon: 1.2,
  default: 1.0
};

export const segmentFactor = {
  transportation: 1.2,
  commodity: 1.1,
  grocery: 1.0,
  delivery: 1.05,
  default: 1.0
};

export const shiftFactor = {
  day: 1.0,
  evening: 1.05,
  night: 1.2,
  default: 1.0
};
