// File: backend/routes/adminTopicRoutes.js
const express = require('express');
const router = express.Router();
const adminTopicController = require('../controllers/adminTopicController');

// Import middleware
const authMiddleware = require('../middlewares/authMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');

// Áp dụng middleware xác thực và phân quyền admin cho tất cả các route
router.use(authMiddleware);
router.use(isAdminMiddleware);

// Routes cho quản lý chủ đề

/**
 * @route GET /api/admin/topics/stats
 * @desc Lấy thống kê chủ đề
 * @access Private (Admin Only)
 */
router.get('/stats', adminTopicController.getTopicStats);

/**
 * @route PUT /api/admin/topics/bulk-update-priority
 * @desc Cập nhật thứ tự ưu tiên hàng loạt
 * @access Private (Admin Only)
 */
router.put('/bulk-update-priority', adminTopicController.bulkUpdatePriority);

/**
 * @route PUT /api/admin/topics/update-post-counts
 * @desc Cập nhật số lượng bài viết cho tất cả chủ đề
 * @access Private (Admin Only)
 */
router.put('/update-post-counts', adminTopicController.updateAllPostCounts);

/**
 * @route PUT /api/admin/topics/fix-data
 * @desc Sửa dữ liệu thiếu cho tất cả chủ đề
 * @access Private (Admin Only)
 */
router.put('/fix-data', adminTopicController.fixTopicData);

/**
 * @route GET /api/admin/topics
 * @desc Lấy danh sách tất cả chủ đề với phân trang, tìm kiếm và lọc
 * @access Private (Admin Only)
 */
router.get('/', adminTopicController.getAllTopics);

/**
 * @route POST /api/admin/topics
 * @desc Tạo chủ đề mới
 * @access Private (Admin Only)
 */
router.post('/', adminTopicController.createTopic);

/**
 * @route GET /api/admin/topics/:id
 * @desc Lấy thông tin chi tiết một chủ đề
 * @access Private (Admin Only)
 */
router.get('/:id', adminTopicController.getTopicById);

/**
 * @route PUT /api/admin/topics/:id
 * @desc Cập nhật thông tin chủ đề
 * @access Private (Admin Only)
 */
router.put('/:id', adminTopicController.updateTopic);

/**
 * @route DELETE /api/admin/topics/:id
 * @desc Xóa chủ đề
 * @access Private (Admin Only)
 */
router.delete('/:id', adminTopicController.deleteTopic);

/**
 * @route PUT /api/admin/topics/:id/status
 * @desc Thay đổi trạng thái chủ đề
 * @access Private (Admin Only)
 */
router.put('/:id/status', adminTopicController.updateTopicStatus);

module.exports = router;
