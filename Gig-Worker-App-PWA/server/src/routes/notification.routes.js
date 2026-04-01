const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const notification = require('../controllers/notification.controller');

router.get('/', protect, notification.listMyNotifications);
router.get('/unread-count', protect, notification.getUnreadCount);
router.post('/mark-all-read', protect, notification.markAllRead);
router.post('/:id/read', protect, notification.markAsRead);

module.exports = router;
