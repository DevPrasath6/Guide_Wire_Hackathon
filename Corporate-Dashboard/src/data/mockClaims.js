export const mockClaims = [
  {
    id: "CLM-2023-8891",
    workerId: "W-5501",
    workerName: "Rohan Desai",
    platform: "Zomato",
    zone: "Mumbai",
    disruptionType: "Heavy Rain",
    claimedAmount: 850,
    hoursLost: 4.5,
    submittedAt: "2023-10-24T09:15:00Z",
    aiConfidence: 96,
    aiDecision: "approved",
    status: "approved",
    aiBreakdown: {
      weatherTrigger: 9.5,
      locationMatch: 1.0,
      behavioralConsistency: 0.9,
      swarmDetectionFlag: true,
      platformOrderDrop: 0.85
    }
  },
  {
    id: "CLM-2023-8892",
    workerId: "W-2194",
    workerName: "Vikram Singh",
    platform: "Swiggy",
    zone: "Delhi",
    disruptionType: "Severe Pollution",
    claimedAmount: 450,
    hoursLost: 3.0,
    submittedAt: "2023-10-24T10:30:00Z",
    aiConfidence: 92,
    aiDecision: "approved",
    status: "approved",
    aiBreakdown: {
      weatherTrigger: 8.8,
      locationMatch: 1.0,
      behavioralConsistency: 0.95,
      swarmDetectionFlag: true,
      platformOrderDrop: 0.8
    }
  },
  {
    id: "CLM-2023-8893",
    workerId: "W-7742",
    workerName: "Amit Kumar",
    platform: "Zepto",
    zone: "Bangalore",
    disruptionType: "Flash Flood",
    claimedAmount: 1100,
    hoursLost: 8.0,
    submittedAt: "2023-10-24T11:05:00Z",
    aiConfidence: 89,
    aiDecision: "approved",
    status: "approved",
    aiBreakdown: {
      weatherTrigger: 9.0,
      locationMatch: 1.0,
      behavioralConsistency: 0.8,
      swarmDetectionFlag: false,
      platformOrderDrop: 0.9
    }
  },
  {
    id: "CLM-2023-8894",
    workerId: "W-3211",
    workerName: "Sanjay Gupta",
    platform: "Blinkit",
    zone: "Chennai",
    disruptionType: "Strike",
    claimedAmount: 950,
    hoursLost: 6.5,
    submittedAt: "2023-10-24T12:10:00Z",
    aiConfidence: 91,
    aiDecision: "approved",
    status: "approved",
    aiBreakdown: {
      weatherTrigger: 0.0,
      locationMatch: 1.0,
      behavioralConsistency: 1.0,
      swarmDetectionFlag: true,
      platformOrderDrop: 0.95
    }
  },
  {
    id: "CLM-2023-8895",
    workerId: "W-9912",
    workerName: "Arun Verma",
    platform: "Amazon",
    zone: "Hyderabad",
    disruptionType: "Extreme Heat",
    claimedAmount: 300,
    hoursLost: 2.0,
    submittedAt: "2023-10-24T13:45:00Z",
    aiConfidence: 72,
    aiDecision: "flagged",
    status: "pending",
    aiBreakdown: {
      weatherTrigger: 7.0,
      locationMatch: 0.8,
      behavioralConsistency: 0.6,
      swarmDetectionFlag: false,
      platformOrderDrop: 0.4
    }
  },
  {
    id: "CLM-2023-8896",
    workerId: "W-4415",
    workerName: "Prakash Tiwari",
    platform: "Zomato",
    zone: "Pune",
    disruptionType: "Curfew",
    claimedAmount: 1200,
    hoursLost: 10.0,
    submittedAt: "2023-10-24T14:20:00Z",
    aiConfidence: 68,
    aiDecision: "flagged",
    status: "escalated",
    aiBreakdown: {
      weatherTrigger: 0.0,
      locationMatch: 0.9,
      behavioralConsistency: 0.7,
      swarmDetectionFlag: true,
      platformOrderDrop: 0.5
    }
  },
  {
    id: "CLM-2023-8897",
    workerId: "W-1100",
    workerName: "Mohammed Ali",
    platform: "Swiggy",
    zone: "Kolkata",
    disruptionType: "Heavy Rain",
    claimedAmount: 150,
    hoursLost: 1.5,
    submittedAt: "2023-10-24T15:10:00Z",
    aiConfidence: 81,
    aiDecision: "flagged",
    status: "pending",
    aiBreakdown: {
      weatherTrigger: 8.5,
      locationMatch: 0.9,
      behavioralConsistency: 0.5,
      swarmDetectionFlag: false,
      platformOrderDrop: 0.6
    }
  },
  {
    id: "CLM-2023-8898",
    workerId: "W-6543",
    workerName: "Deepak Sharma",
    platform: "Zepto",
    zone: "Ahmedabad",
    disruptionType: "Strike",
    claimedAmount: 800,
    hoursLost: 5.5,
    submittedAt: "2023-10-24T16:05:00Z",
    aiConfidence: 65,
    aiDecision: "flagged",
    status: "escalated",
    aiBreakdown: {
      weatherTrigger: 0.0,
      locationMatch: 0.7,
      behavioralConsistency: 0.6,
      swarmDetectionFlag: false,
      platformOrderDrop: 0.5
    }
  },
  {
    id: "CLM-2023-8899",
    workerId: "W-2233",
    workerName: "Rajesh Patel",
    platform: "Blinkit",
    zone: "Mumbai",
    disruptionType: "Heavy Rain",
    claimedAmount: 600,
    hoursLost: 4.0,
    submittedAt: "2023-10-24T16:45:00Z",
    aiConfidence: 35,
    aiDecision: "rejected",
    status: "rejected",
    aiBreakdown: {
      weatherTrigger: 2.0,
      locationMatch: 0.3,
      behavioralConsistency: 0.4,
      swarmDetectionFlag: false,
      platformOrderDrop: 0.2
    }
  },
  {
    id: "CLM-2023-8900",
    workerId: "W-8877",
    workerName: "Sunil Yadav",
    platform: "Amazon",
    zone: "Delhi",
    disruptionType: "Extreme Heat",
    claimedAmount: 750,
    hoursLost: 5.0,
    submittedAt: "2023-10-24T17:30:00Z",
    aiConfidence: 42,
    aiDecision: "rejected",
    status: "rejected",
    aiBreakdown: {
      weatherTrigger: 4.0,
      locationMatch: 0.5,
      behavioralConsistency: 0.3,
      swarmDetectionFlag: false,
      platformOrderDrop: 0.3
    }
  },
  {
    id: "CLM-2023-8901",
    workerId: "W-3344",
    workerName: "Nitin Joshi",
    platform: "Zomato",
    zone: "Bangalore",
    disruptionType: "Flash Flood",
    claimedAmount: 500,
    hoursLost: 3.5,
    submittedAt: "2023-10-24T18:15:00Z",
    aiConfidence: 86,
    aiDecision: "approved",
    status: "pending",
    aiBreakdown: {
      weatherTrigger: 8.0,
      locationMatch: 0.95,
      behavioralConsistency: 0.9,
      swarmDetectionFlag: true,
      platformOrderDrop: 0.8
    }
  },
  {
    id: "CLM-2023-8902",
    workerId: "W-5566",
    workerName: "Kishore Reddy",
    platform: "Swiggy",
    zone: "Hyderabad",
    disruptionType: "Heavy Rain",
    claimedAmount: 400,
    hoursLost: 2.5,
    submittedAt: "2023-10-24T19:00:00Z",
    aiConfidence: 84,
    aiDecision: "approved",
    status: "pending",
    aiBreakdown: {
      weatherTrigger: 7.5,
      locationMatch: 0.9,
      behavioralConsistency: 0.85,
      swarmDetectionFlag: true,
      platformOrderDrop: 0.75
    }
  }
];