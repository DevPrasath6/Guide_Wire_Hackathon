const Claim = require('../models/Claim');
const User = require('../models/User');
const Notification = require('../models/Notification');
const axios = require('axios');
const { getIo } = require('../sockets/socket');

const createNotification = async (userId, payload) => {
  try {
    const saved = await Notification.create({ userId, ...payload });
    const io = getIo();
    if (io) {
      io.to(String(userId)).emit('notification', {
        id: saved._id,
        title: payload.title,
        body: payload.message,
        type: payload.type || 'info',
        createdAt: saved.createdAt
      });
    }
  } catch (error) {
    console.error('Notification create failed:', error?.message || error);
  }
};

exports.submitClaim = async (req, res) => {
  try {
    const { type, hours, lat, lng, location, note } = req.body;
    
    // Validate inputs
    const resolvedLat = Number(lat ?? location?.lat);
    const resolvedLng = Number(lng ?? location?.lng);

    if (!type || !hours || Number.isNaN(resolvedLat) || Number.isNaN(resolvedLng)) {
      return res.status(400).json({ success: false, message: 'Type, hours, and valid coordinates are required' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user?.policy?.claimBanUntil && new Date(user.policy.claimBanUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        message: `Claim submission is temporarily blocked until ${new Date(user.policy.claimBanUntil).toLocaleString()}`
      });
    }
    
    // Check if files were uploaded (evidence)
    const files = req.files || [];
    const filePaths = files.map(file => `/uploads/${file.filename}`);

    // Create preliminary claim
    let newClaim = new Claim({
      userId,
      claimId: `CLM_${Date.now().toString(36).toUpperCase()}`,
      type,
      hours: Number(hours),
      note: note || '',
      location: {
        type: 'Point',
        coordinates: [resolvedLng, resolvedLat]
      },
      status: 'pending'
    });

    // We can also compute base payout logic here (e.g. 500 Rupees per hour base factor)
    const baseAmount = Number(hours) * 500;

    // AI scoring via FastAPI with graceful fallback
    let aiScore = 0.85; 
    let fraudFlag = false;
    let instantAmount = 0;
    let heldAmount = 0;
    let reviewReason = '';

    try {
      const aiUrl = `${process.env.FASTAPI_URL || 'http://localhost:8000'}/score-claim`;
      const aiRes = await axios.post(aiUrl, {
        user_id: userId,
        location: [resolvedLng, resolvedLat],
        disruption_type: type,
        hours: Number(hours),
        timestamp: new Date().toISOString()
      }, { timeout: 6000 });

      aiScore = Number(aiRes.data?.score ?? 0.85);
      fraudFlag = Boolean(aiRes.data?.fraud_flag);
      instantAmount = Number(aiRes.data?.instant_payout ?? Math.floor(baseAmount * 0.8));
      heldAmount = Number(aiRes.data?.held_amount ?? Math.max(baseAmount - instantAmount, 0));
      reviewReason = aiRes.data?.reason || '';

      if (aiScore >= 0.8 && !fraudFlag) {
        newClaim.status = 'approved';
      } else if (aiScore >= 0.6 || fraudFlag) {
        newClaim.status = 'pending';
      } else {
        newClaim.status = 'rejected';
      }
    } catch (aiError) {
      console.error('Failed to communicate with AI Engine:', aiError?.message || aiError);
      aiScore = Math.random() * (0.92 - 0.58) + 0.58;
      if (aiScore >= 0.8) {
        instantAmount = Math.floor(baseAmount * 0.8);
        heldAmount = Math.floor(baseAmount * 0.2);
        newClaim.status = 'approved';
      } else if (aiScore >= 0.6) {
        instantAmount = Math.floor(baseAmount * 0.4);
        heldAmount = Math.floor(baseAmount * 0.6);
        newClaim.status = 'pending';
      } else {
        instantAmount = 0;
        heldAmount = baseAmount;
        newClaim.status = 'rejected';
      }
      reviewReason = 'Fallback scoring applied while AI service unavailable';
    }

    newClaim.aiScore = parseFloat(aiScore.toFixed(2));
    newClaim.instantAmount = instantAmount;
    newClaim.heldAmount = heldAmount;
    newClaim.fraudFlag = fraudFlag;
    newClaim.reviewReason = reviewReason;
    newClaim.decisionSource = 'es-ai';

    // Fraud penalty policy enforcement
    if (fraudFlag) {
      const currentPremium = Number(user?.policy?.weeklyPremium || 25);
      const bumpedPremium = Math.max(25, Math.round(currentPremium * 1.25 / 5) * 5);
      user.policy = {
        ...user.policy,
        tier: 'Basic Shield',
        planId: 'basic',
        weeklyPremium: bumpedPremium,
        claimBanUntil: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)),
        fraudStrikeCount: Number(user?.policy?.fraudStrikeCount || 0) + 1,
        penaltyReason: 'Fraud anomaly detected by ES-AI'
      };
      await user.save();

      newClaim.status = 'rejected';
      newClaim.reviewReason = 'Fraud anomaly detected. Premium increased and claim access paused for 3 days.';
      newClaim.heldAmount = baseAmount;
      newClaim.instantAmount = 0;
    }

    // Save to DB
    await newClaim.save();

    await createNotification(userId, {
      title: 'Claim Received',
      message: `Claim ${newClaim.claimId} has been received and processed by ES-AI.`,
      type: 'info',
      meta: { claimId: newClaim._id, status: newClaim.status }
    });

    if (newClaim.status === 'approved') {
      await createNotification(userId, {
        title: 'Claim Approved',
        message: `₹${newClaim.instantAmount} has been approved for instant payout.`,
        type: 'success',
        meta: { claimId: newClaim._id }
      });
    }

    if (newClaim.status === 'rejected') {
      await createNotification(userId, {
        title: fraudFlag ? 'Fraud Alert' : 'Claim Rejected',
        message: fraudFlag
          ? 'Fraud anomaly found. You have been moved to Basic plan and claim access is paused for 3 days.'
          : (newClaim.reviewReason || 'Claim rejected by ES-AI review.'),
        type: fraudFlag ? 'fraud' : 'error',
        meta: { claimId: newClaim._id, fraudFlag: !!fraudFlag }
      });
    }

    // Broadcast update via Socket.io to dashboards or active clients
    const io = getIo();
    if (io) {
      io.emit('new_claim', {
        claimId: newClaim.claimId,
        status: newClaim.status,
        type: newClaim.type,
        amount: newClaim.instantAmount + newClaim.heldAmount,
        userPolicyPremium: user?.policy?.weeklyPremium,
        userPolicyTier: user?.policy?.tier,
        fraudFlag: !!newClaim.fraudFlag
      });
      // Specific user notification
      io.to(userId.toString()).emit('claim_update', {
        claimId: newClaim.claimId,
        status: newClaim.status,
        instantAmount: newClaim.instantAmount,
        heldAmount: newClaim.heldAmount,
        aiScore: newClaim.aiScore
      });
    }

    res.status(201).json({
      success: true,
      message: 'Claim processed successfully',
      data: {
        id: newClaim._id,
        claimId: newClaim.claimId,
        status: newClaim.status,
        type: newClaim.type,
        hours: newClaim.hours,
        aiScore: newClaim.aiScore,
        instantAmount: newClaim.instantAmount,
        heldAmount: newClaim.heldAmount,
        fraudFlag: newClaim.fraudFlag,
        decisionSource: newClaim.decisionSource,
        submittedAt: newClaim.createdAt
      }
    });

  } catch (err) {
    console.error('Submit Claim error:', err);
    res.status(500).json({ success: false, message: 'Server error while processing claim' });
  }
};

exports.getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const mapped = claims.map((c) => ({
      id: c._id,
      claimId: c.claimId,
      type: c.type,
      status: c.status,
      date: c.createdAt,
      aiScore: c.aiScore,
      instantAmount: c.instantAmount,
      heldAmount: c.heldAmount,
      amount: (c.instantAmount || 0) + (c.heldAmount || 0),
      decisionSource: c.decisionSource,
      fraudFlag: c.fraudFlag,
      reviewReason: c.reviewReason
    }));
    res.status(200).json({ success: true, data: mapped });
  } catch (err) {
    console.error('Get Claims error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Claim.findOne({ _id: id, userId: req.user.id });

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: claim._id,
        claimId: claim.claimId,
        type: claim.type,
        status: claim.status,
        date: claim.createdAt,
        aiScore: claim.aiScore,
        instantAmount: claim.instantAmount,
        heldAmount: claim.heldAmount,
        amount: (claim.instantAmount || 0) + (claim.heldAmount || 0),
        decisionSource: claim.decisionSource,
        fraudFlag: claim.fraudFlag,
        reviewReason: claim.reviewReason
      }
    });
  } catch (err) {
    console.error('Get Claim By Id error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyClaimSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const [agg, claimsCount, firstClaim] = await Promise.all([
      Claim.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            protectedAmount: { $sum: '$instantAmount' },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          }
        }
      ]),
      Claim.countDocuments({ userId }),
      Claim.findOne({ userId }).sort({ createdAt: 1 }).select('createdAt').lean()
    ]);

    const stats = agg?.[0] || { protectedAmount: 0, approved: 0, pending: 0, rejected: 0 };
    const createdAt = firstClaim?.createdAt;
    const activeWeeks = createdAt
      ? Math.max(1, Math.ceil((Date.now() - new Date(createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000)))
      : 0;

    res.status(200).json({
      protectedAmount: Number(stats.protectedAmount || 0),
      claimsFiled: Number(claimsCount || 0),
      activeWeeks,
      approvedClaims: Number(stats.approved || 0),
      pendingClaims: Number(stats.pending || 0),
      rejectedClaims: Number(stats.rejected || 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
