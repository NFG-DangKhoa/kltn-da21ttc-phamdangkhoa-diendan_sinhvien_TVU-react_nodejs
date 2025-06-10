// File: backend/routes/adminAnalyticsRoutes.js
const express = require('express');
const router = express.Router();
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

// Import middleware
const authMiddleware = require('../middlewares/authMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');

// Routes công khai (không cần admin)
/**
 * @route POST /api/admin/analytics/log-activity
 * @desc Ghi log hoạt động người dùng
 * @access Private (User logged in)
 */
router.post('/log-activity', authMiddleware, adminAnalyticsController.logUserActivity);

/**
 * @route POST /api/admin/analytics/log-search
 * @desc Ghi log tìm kiếm
 * @access Public
 */
router.post('/log-search', adminAnalyticsController.logSearch);

// Áp dụng middleware xác thực và phân quyền admin cho các route còn lại
router.use(authMiddleware);
router.use(isAdminMiddleware);

// Routes cho admin analytics

/**
 * @route GET /api/admin/analytics/overview
 * @desc Lấy tổng quan thống kê
 * @access Private (Admin Only)
 */
router.get('/overview', adminAnalyticsController.getOverviewStats);

/**
 * @route GET /api/admin/analytics/user-activity
 * @desc Lấy thống kê hoạt động người dùng
 * @access Private (Admin Only)
 */
router.get('/user-activity', adminAnalyticsController.getUserActivityStats);

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
 * @route GET /api/admin/analytics/growth-trends
 * @desc Lấy xu hướng tăng trưởng
 * @access Private (Admin Only)
 */
router.get('/growth-trends', adminAnalyticsController.getGrowthTrends);

module.exports = router;
