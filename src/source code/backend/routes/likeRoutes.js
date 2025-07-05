const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // <-- Thêm dòng này
const likeController = require('../controllers/likeController');

// Route lấy tất cả like hoặc lọc theo userId
router.get('/', authMiddleware, likeController.getLikes);

// @route   POST /api/likes/toggle
// @desc    Bật/tắt một lượt thích (thêm hoặc xóa)
// @access  Private (yêu cầu xác thực)
router.post('/toggle', authMiddleware, likeController.toggleLike);

// @route   GET /api/likes/:targetType/:targetId
// @desc    Lấy tất cả lượt thích cho một mục tiêu cụ thể
// @access  Public (hoặc Private, tùy thuộc vào yêu cầu của bạn)
router.get('/:targetType/:targetId', likeController.getLikesForTarget);

// @route   GET /api/likes/count/:targetType/:targetId
// @desc    Lấy số lượt thích cho một mục tiêu cụ thể
// @access  Public
router.get('/count/:targetType/:targetId', likeController.getLikeCountForTarget);

// @route   GET /api/likes/check/:targetType/:targetId
// @desc    Kiểm tra xem một người dùng đã thích một mục tiêu cụ thể hay chưa
// @access  Private (yêu cầu xác thực)
router.get('/check/:targetType/:targetId', authMiddleware, likeController.checkIfUserLiked);

module.exports = router;