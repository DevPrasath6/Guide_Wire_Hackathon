import express from 'express';
import { Notification } from '../models/Notification.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  return res.json(notifications);
});

router.get('/unread-count', authRequired, async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, read: false });
  return res.json({ count });
});

router.post('/:id/read', authRequired, async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { $set: { read: true } });
  return res.json({ success: true });
});

router.post('/mark-all-read', authRequired, async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  return res.json({ success: true });
});

export default router;
