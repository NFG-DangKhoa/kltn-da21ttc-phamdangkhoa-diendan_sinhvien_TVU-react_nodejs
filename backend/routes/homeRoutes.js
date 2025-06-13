const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

/**
 * @route GET /api/home/stats
 * @desc Lấy thống kê tổng quan cho trang chủ
 * @access Public
 */
router.get('/stats', homeController.getHomeStats);

/**
 * @route GET /api/home/featured-posts
 * @desc Lấy bài viết nổi bật
 * @access Public
 */
router.get('/featured-posts', homeController.getFeaturedPosts);

/**
 * @route GET /api/home/trending-topics
 * @desc Lấy chủ đề thịnh hành
 * @access Public
 */
router.get('/trending-topics', homeController.getTrendingTopics);

/**
 * @route GET /api/home/recent-posts
 * @desc Lấy bài viết gần đây
 * @access Public
 */
router.get('/recent-posts', homeController.getRecentPosts);

module.exports = router;
