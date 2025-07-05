const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

// User notification routes
router.get('/', auth, notificationController.getNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/:notificationId/read', auth, notificationController.markAsRead);
router.put('/mark-all-read', auth, notificationController.markAllAsRead);
router.delete('/:notificationId', auth, notificationController.deleteNotification);

// Admin notification routes
router.post('/broadcast', auth, notificationController.createBroadcastNotification);
router.post('/user', auth, notificationController.createUserNotification);
router.get('/stats', auth, notificationController.getNotificationStats);

module.exports = router;
