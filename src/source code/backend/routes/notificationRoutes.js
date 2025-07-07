const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

// User notification routes
router.get('/', protect, notificationController.getNotifications);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.put('/:notificationId/read', protect, notificationController.markAsRead);
router.put('/mark-all-read', protect, notificationController.markAllAsRead);
router.delete('/:notificationId', protect, notificationController.deleteNotification);

// Admin notification routes
router.post('/broadcast', protect, admin, notificationController.createBroadcastNotification);
router.post('/user', protect, admin, notificationController.createUserNotification);
router.get('/stats', protect, admin, notificationController.getNotificationStats);

module.exports = router;
