const express = require('express');
const router = express.Router();
const AdminNotificationController = require('../controllers/adminNotificationController');
const authenticateToken = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/isAdminMiddleware');

// Middleware để khởi tạo controller với io instance
const initController = (req, res, next) => {
    if (!req.notificationController) {
        const controller = new AdminNotificationController();
        controller.io = req.io; // Inject io instance
        req.notificationController = controller;
    }
    next();
};

// Apply authentication middleware
router.use(authenticateToken);
router.use(requireAdmin);
router.use(initController);

// Routes for notification management

// GET /admin/notifications - Lấy danh sách thông báo với phân trang và filter
router.get('/', async (req, res) => {
    await req.notificationController.getNotifications(req, res);
});

// GET /admin/notifications/stats - Lấy thống kê thông báo
router.get('/stats', async (req, res) => {
    await req.notificationController.getNotificationStats(req, res);
});

// GET /admin/notifications/stats/detailed - Lấy thống kê chi tiết theo thời gian
router.get('/stats/detailed', async (req, res) => {
    await req.notificationController.getDetailedStats(req, res);
});

// GET /admin/notifications/templates - Lấy template thông báo
router.get('/templates', async (req, res) => {
    await req.notificationController.getNotificationTemplates(req, res);
});

// POST /admin/notifications/broadcast - Gửi thông báo broadcast
router.post('/broadcast', async (req, res) => {
    await req.notificationController.sendBroadcastNotification(req, res);
});

// POST /admin/notifications/individual - Gửi thông báo cá nhân
router.post('/individual', async (req, res) => {
    await req.notificationController.sendIndividualNotification(req, res);
});

// PUT /admin/notifications/:id/read - Đánh dấu thông báo đã đọc
router.put('/:id/read', async (req, res) => {
    await req.notificationController.markAsRead(req, res);
});

// DELETE /admin/notifications/:id - Xóa thông báo
router.delete('/:id', async (req, res) => {
    await req.notificationController.deleteNotification(req, res);
});

// DELETE /admin/notifications/bulk - Xóa nhiều thông báo
router.delete('/bulk', async (req, res) => {
    await req.notificationController.bulkDeleteNotifications(req, res);
});

module.exports = router;
