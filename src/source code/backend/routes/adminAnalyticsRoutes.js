// File: backend/routes/adminAnalyticsRoutes.js
const express = require('express');
const router = express.Router();
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

// Import middleware
const { protect, admin } = require('../middlewares/authMiddleware');

// Routes công khai (không cần admin)
/**
 * @route POST /api/admin/analytics/log-activity
 * @desc Ghi log hoạt động người dùng
 * @access Private (User logged in)
 */
router.post('/log-activity', protect, adminAnalyticsController.logUserActivity);

/**
 * @route POST /api/admin/analytics/log-search
 * @desc Ghi log tìm kiếm
 * @access Public
 */
router.post('/log-search', adminAnalyticsController.logSearch);

// Áp dụng middleware xác thực và phân quyền admin cho các route còn lại
router.use(protect);
router.use(admin);

// Routes cho admin analytics

/**
 * @route GET /api/admin/analytics/overview
 * @desc Lấy tổng quan thống kê
 * @access Private (Admin Only)
 */
router.get('/overview', adminAnalyticsController.getOverviewStats);

/**
 * @route GET /api/admin/analytics/ratings
 * @desc Lấy thống kê chi tiết về đánh giá
 * @access Private (Admin Only)
 */
router.get('/ratings', adminAnalyticsController.getRatingStats);

/**
 * @route GET /api/admin/analytics/topics
 * @desc Lấy thống kê chi tiết về chủ đề
 * @access Private (Admin Only)
 */
router.get('/topics', adminAnalyticsController.getTopicStats);

/**
 * @route GET /api/admin/analytics/popular-content
 * @desc Lấy thống kê nội dung phổ biến
 * @access Private (Admin Only)
 */
router.get('/popular-content', adminAnalyticsController.getPopularContentStats);

/**
 * @route GET /api/admin/analytics/search-analytics
 * @desc Lấy thống kê tìm kiếm
 * @access Private (Admin Only)
 */
router.get('/search-analytics', adminAnalyticsController.getSearchAnalytics);

/**
 * @route GET /api/admin/analytics/community
 * @desc Lấy thống kê cộng đồng (bài viết, chủ đề, đánh giá)
 * @access Private (Admin Only)
 */
router.get('/community', adminAnalyticsController.getCommunityStats);

/**
 * @route GET /api/admin/analytics/users
 * @desc Lấy thống kê chi tiết về người dùng
 * @access Private (Admin Only)
 */
router.get('/users', adminAnalyticsController.getUserStats);

module.exports = router;
