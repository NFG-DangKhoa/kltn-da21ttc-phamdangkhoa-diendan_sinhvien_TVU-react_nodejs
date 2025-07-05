// File: backend/routes/adminPostRoutes.js
const express = require('express');
const router = express.Router();
const adminPostController = require('../controllers/adminPostController');
const authMiddleware = require('../middlewares/authMiddleware');

// Lấy danh sách bài viết (có phân trang, tìm kiếm, lọc)
router.get('/', authMiddleware, adminPostController.getAllPostsForAdmin);
router.get('/:id', authMiddleware, adminPostController.getPostByIdForAdmin);
router.post('/', authMiddleware, adminPostController.createPostByAdmin);
router.put('/:id', authMiddleware, adminPostController.updatePostByAdmin);
router.delete('/:id', authMiddleware, adminPostController.deletePostByAdmin);
router.put('/:id/status', authMiddleware, adminPostController.updatePostStatus);

module.exports = router;