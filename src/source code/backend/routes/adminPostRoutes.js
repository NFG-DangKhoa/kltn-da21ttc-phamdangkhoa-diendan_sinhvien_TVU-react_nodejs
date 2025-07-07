// File: backend/routes/adminPostRoutes.js
const express = require('express');
const router = express.Router();
const adminPostController = require('../controllers/adminPostController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Lấy danh sách bài viết (có phân trang, tìm kiếm, lọc)
router.get('/', protect, admin, adminPostController.getAllPostsForAdmin);
router.get('/:id', protect, admin, adminPostController.getPostByIdForAdmin);
router.post('/', protect, admin, adminPostController.createPostByAdmin);
router.put('/:id', protect, admin, adminPostController.updatePostByAdmin);
router.delete('/:id', protect, admin, adminPostController.deletePostByAdmin);
router.put('/:id/status', protect, admin, adminPostController.updatePostStatus);

module.exports = router;
