const express = require('express');
const router = express.Router();
const adminFeaturedController = require('../controllers/adminFeaturedController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(admin);

/**
 * @route GET /api/admin/featured/posts
 * @desc Lấy danh sách bài viết để quản lý featured
 * @access Admin
 */
router.get('/posts', adminFeaturedController.getFeaturedPosts);

/**
 * @route PUT /api/admin/featured/posts/:id
 * @desc Cập nhật trạng thái featured của bài viết
 * @access Admin
 */
router.put('/posts/:id', adminFeaturedController.updatePostFeatured);

/**
 * @route GET /api/admin/featured/topics
 * @desc Lấy danh sách chủ đề để quản lý trending
 * @access Admin
 */
router.get('/topics', adminFeaturedController.getTrendingTopics);

/**
 * @route PUT /api/admin/featured/topics/:id
 * @desc Cập nhật trạng thái trending của chủ đề
 * @access Admin
 */
router.put('/topics/:id', adminFeaturedController.updateTopicTrending);

/**
 * @route POST /api/admin/featured/bulk-update-posts
 * @desc Cập nhật hàng loạt trạng thái featured của bài viết
 * @access Admin
 */
router.post('/bulk-update-posts', adminFeaturedController.bulkUpdatePostsFeatured);

/**
 * @route POST /api/admin/featured/bulk-update-topics
 * @desc Cập nhật hàng loạt trạng thái trending của chủ đề
 * @access Admin
 */
router.post('/bulk-update-topics', adminFeaturedController.bulkUpdateTopicsTrending);

module.exports = router;
