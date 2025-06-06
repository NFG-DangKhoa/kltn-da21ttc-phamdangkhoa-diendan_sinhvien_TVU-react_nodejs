// File: backend/routes/adminPostRoutes.js
const express = require('express');
const router = express.Router();
const adminPostController = require('../controllers/adminPostController');

// Giả định bạn có các middleware này.
// authMiddleware để xác thực token và gắn req.user (ví dụ: req.user.id, req.user.role)
// isAdminMiddleware để kiểm tra req.user.role === 'admin'
const authMiddleware = require('../middlewares/authMiddleware'); // Đường dẫn thực tế của bạn
const isAdminMiddleware = require('../middlewares/isAdminMiddleware'); // Đường dẫn thực tế của bạn

// Áp dụng middleware xác thực và phân quyền admin cho tất cả các route admin
router.use(authMiddleware);
router.use(isAdminMiddleware);

// Routes cho Admin
router.get('/', adminPostController.getAllPostsForAdmin); // Lấy tất cả bài viết
router.get('/:id', adminPostController.getPostByIdForAdmin); // Lấy chi tiết bài viết
router.post('/', adminPostController.createPostByAdmin); // Admin tạo bài viết mới
router.put('/:id', adminPostController.updatePostByAdmin); // Admin cập nhật bài viết
router.delete('/:id', adminPostController.deletePostByAdmin); // Admin xóa bài viết
router.put('/:id/status', adminPostController.updatePostStatus); // Admin cập nhật trạng thái bài viết

module.exports = router;