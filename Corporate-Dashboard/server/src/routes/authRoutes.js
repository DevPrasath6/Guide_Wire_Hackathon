import express from 'express';
import bcrypt from 'bcryptjs';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';
import { TaxDocument } from '../models/TaxDocument.js';
import { authRequired } from '../middleware/auth.js';
import { ROLE_PERMISSIONS } from '../config/permissions.js';
import { signToken } from '../utils/token.js';
import { calculatePremium } from '../utils/premium.js';
import { writeAuditLog } from '../services/auditService.js';

const router = express.Router();

function userResponse(user, token) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    profile: user.profile,
    employeeProfile: user.employeeProfile,
    policy: user.policy,
    payout: user.payout,
    userType: user.role === 'worker' ? 'worker' : 'employee',
    token
  };
}

router.post('/firebase', async (req, res) => {
  try {
    const { email, displayName, photoURL, uid, providerId } = req.body;
    if (!email || !uid) {
      return res.status(400).json({ message: 'email and uid are required' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: displayName || email.split('@')[0],
        email,
        photoURL,
        firebase: { uid, providerId },
        role: 'worker',
        permissions: ROLE_PERMISSIONS.worker,
        profile: {
          avatar: photoURL,
          platform: 'Rapido',
          zone: 'Coimbatore',
          segment: 'transportation',
          dailyEarnings: 1200,
          orderCapacity: 50,
          workShift: 'day',
          workHours: 8
        },
        policy: {
          tier: 'Standard Shield',
          planId: 'standard',
          weeklyPremium: 45,
          active: true,
          claimBanUntil: null,
          fraudStrikeCount: 0
        },
        payout: { method: 'upi' }
      });
    } else {
      user.firebase = { uid, providerId };
      user.photoURL = photoURL;
      await user.save();
    }

    const token = signToken(user, 'worker');
    return res.json(userResponse(user, token));
  } catch (error) {
    return res.status(500).json({ message: 'firebase auth failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, phone, username, password } = req.body;
    const normalizedEmail = String(email || username || '').trim().toLowerCase();
    const normalizedPhone = String(phone || '').trim();
    if (!password || (!email && !phone)) {
      if (!password || (!normalizedEmail && !normalizedPhone)) {
        return res.status(400).json({ message: 'email/phone and password are required' });
      }
    }

    const query = normalizedEmail ? { email: normalizedEmail } : { phone: normalizedPhone };
    let userType = 'employee';
    let user = await Employee.findOne(query);
    if (!user) {
      user = await User.findOne(query);
      userType = 'worker';
    }
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user, userType);
    await writeAuditLog(req, {
      actor: user._id,
      actorEmail: user.email,
      action: 'login_success',
      resourceType: 'auth',
      resourceId: 'local-login',
      status: 'success'
    });

    return res.json(userResponse(user, token));
  } catch (error) {
    return res.status(500).json({ message: 'login failed', error: error.message });
  }
});

router.get('/profile', authRequired, async (req, res) => {
  const token = signToken(req.user, req.userType || (req.user.role === 'worker' ? 'worker' : 'employee'));
  return res.json(userResponse(req.user, token));
});

router.put('/profile', authRequired, async (req, res) => {
  try {
    const { profile, payout } = req.body;
    req.user.profile = { ...(req.user.profile || {}), ...(profile || {}) };
    req.user.payout = { ...(req.user.payout || {}), ...(payout || {}) };
    await req.user.save();

    await writeAuditLog(req, {
      action: 'profile_updated',
      resourceType: 'user',
      resourceId: req.user._id.toString(),
      targetUser: req.user._id,
      changes: { profile, payout }
    });

    const token = signToken(req.user, req.userType || (req.user.role === 'worker' ? 'worker' : 'employee'));
    return res.json(userResponse(req.user, token));
  } catch (error) {
    return res.status(500).json({ message: 'profile update failed', error: error.message });
  }
});

router.post('/upgrade-policy', authRequired, async (req, res) => {
  try {
    const premium = calculatePremium(req.body);
    const { segment, dailyEarnings, platform, workShift, workHours } = req.body;

    req.user.profile = {
      ...(req.user.profile || {}),
      segment,
      dailyEarnings,
      platform,
      workShift,
      workHours
    };
    req.user.policy = {
      ...(req.user.policy || {}),
      ...premium,
      active: true
    };
    await req.user.save();

    await writeAuditLog(req, {
      action: 'policy_upgraded',
      resourceType: 'policy',
      resourceId: req.user._id.toString(),
      targetUser: req.user._id,
      changes: premium
    });

    const token = signToken(req.user, req.userType || (req.user.role === 'worker' ? 'worker' : 'employee'));
    return res.json(userResponse(req.user, token));
  } catch (error) {
    return res.status(500).json({ message: 'policy upgrade failed', error: error.message });
  }
});

router.get('/tax-documents', authRequired, async (req, res) => {
  const docs = await TaxDocument.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json(docs);
});

export default router;
