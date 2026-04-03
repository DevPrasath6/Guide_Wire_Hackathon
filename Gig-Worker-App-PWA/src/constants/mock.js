export const MOCK_WORKER = { 
  id: "W001", name: "Rajan Kumar", phone: "9876543210",
  platform: "Zomato", zone: "Mumbai", weeklyEarnings: 6000,
  initials: "RK", planId: "standard" 
};

export const MOCK_PLANS = [
  { id: "basic", name: "Basic Shield", weeklyPremium: 25, coverageAmount: 500,
    triggers: ["Heavy Rain", "Flash Flood"], payoutSpeed: "Same-day" },
  { id: "standard", name: "Standard Shield", weeklyPremium: 45, coverageAmount: 1000,
    triggers: ["Heavy Rain", "Flash Flood", "Extreme Heat", "Curfew"], payoutSpeed: "2-hour" },
  { id: "premium", name: "Premium Shield", weeklyPremium: 70, coverageAmount: 2000,
    triggers: ["Heavy Rain", "Flash Flood", "Extreme Heat", "Curfew", "Strike", "Severe Pollution"],
    payoutSpeed: "Instant", hasSwarmProtection: true }
];

export const MOCK_CLAIMS = [];

export const MOCK_DISRUPTION = { 
  detected: true, type: "Heavy Rain", zone: "Mumbai",
  severity: 7.2, estimatedLoss: 600, autoEligible: true 
};
