import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { writeAuditLog } from '../services/auditService.js';

const router = express.Router();

router.post('/update', authRequired, async (req, res) => {
  const { lat, lng, accuracy, timestamp, source } = req.body;
  req.user.currentLocation = { lat, lng, accuracy, timestamp, source };
  req.user.locationHistory = req.user.locationHistory || [];
  req.user.locationHistory.push({ lat, lng, accuracy, timestamp, source });
  req.user.locationHistory = req.user.locationHistory.slice(-200);
  await req.user.save();

  await writeAuditLog(req, {
    action: 'location_updated',
    resourceType: 'location',
    resourceId: req.user._id.toString(),
    targetUser: req.user._id,
    changes: { lat, lng, accuracy, timestamp, source }
  });

  req.app.locals.io?.emit('dashboard:location:update', {
    userId: req.user._id,
    name: req.user.name,
    location: req.user.currentLocation,
    zone: req.user.profile?.zone
  });

  return res.json({ success: true });
});

export default router;
