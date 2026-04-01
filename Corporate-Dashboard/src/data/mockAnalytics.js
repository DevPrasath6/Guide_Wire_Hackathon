export const mockAnalytics = {
  weeklyClaimsByType: [
    { day: "Mon", Rain: 45, Flood: 12, Heat: 0, Curfew: 0, Strike: 5, Pollution: 10 },
    { day: "Tue", Rain: 50, Flood: 15, Heat: 0, Curfew: 2, Strike: 0, Pollution: 12 },
    { day: "Wed", Rain: 30, Flood: 5, Heat: 25, Curfew: 0, Strike: 0, Pollution: 18 },
    { day: "Thu", Rain: 10, Flood: 0, Heat: 40, Curfew: 5, Strike: 0, Pollution: 20 },
    { day: "Fri", Rain: 5, Flood: 0, Heat: 35, Curfew: 0, Strike: 15, Pollution: 15 },
    { day: "Sat", Rain: 60, Flood: 20, Heat: 0, Curfew: 0, Strike: 5, Pollution: 8 },
    { day: "Sun", Rain: 85, Flood: 35, Heat: 0, Curfew: 0, Strike: 0, Pollution: 5 },
  ],
  lossRatioTrend: [
    { week: "W-5", ratio: 0.61, target: 0.65 },
    { week: "W-4", ratio: 0.63, target: 0.65 },
    { week: "W-3", ratio: 0.68, target: 0.65 },
    { week: "W-2", ratio: 0.72, target: 0.65 },
    { week: "W-1", ratio: 0.64, target: 0.65 },
    { week: "Current", ratio: 0.59, target: 0.65 },
  ],
  payoutTierBreakdown: [
    { name: "Auto-approved", value: 58, color: '#00C896' },
    { name: "Admin-approved", value: 22, color: '#3B82F6' },
    { name: "Rejected", value: 12, color: '#EF4444' },
    { name: "Pending", value: 8, color: '#F59E0B' }
  ],
  zoneClaimsMap: [
    { name: "Mumbai", claimCount: 312, fraudRate: 8.5, risk: "high" },
    { name: "Bangalore", claimCount: 285, fraudRate: 6.2, risk: "high" },
    { name: "Delhi", claimCount: 195, fraudRate: 12.4, risk: "high" },
    { name: "Hyderabad", claimCount: 142, fraudRate: 4.1, risk: "medium" },
    { name: "Chennai", claimCount: 110, fraudRate: 3.8, risk: "medium" },
    { name: "Ahmedabad", claimCount: 85, fraudRate: 5.5, risk: "medium" },
    { name: "Pune", claimCount: 64, fraudRate: 2.1, risk: "low" },
    { name: "Kolkata", claimCount: 45, fraudRate: 1.8, risk: "low" },
  ],
  premiumVsPayoutTrend: [
    { week: "W-5", premiumCollected: 450000, payoutMade: 260000, fraudBlocked: 35000 },
    { week: "W-4", premiumCollected: 465000, payoutMade: 285000, fraudBlocked: 42000 },
    { week: "W-3", premiumCollected: 480000, payoutMade: 340000, fraudBlocked: 51000 },
    { week: "W-2", premiumCollected: 495000, payoutMade: 375000, fraudBlocked: 68000 },
    { week: "W-1", premiumCollected: 510000, payoutMade: 310000, fraudBlocked: 45000 },
    { week: "Current", premiumCollected: 535000, payoutMade: 295000, fraudBlocked: 38000 },
  ],
  nextWeekPrediction: {
    expectedClaims: 167,
    highRiskZones: ["Mumbai", "Chennai"],
    predictedPayout: 312000,
    confidenceLevel: 82
  }
};