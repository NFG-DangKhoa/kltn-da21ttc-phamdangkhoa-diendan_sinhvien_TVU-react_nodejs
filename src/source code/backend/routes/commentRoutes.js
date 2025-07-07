// File: backend/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const commentController = require('../controllers/commentController');

// Wrap your routes in a function that accepts `io`
module.exports = (io) => {
    commentController.setIo(io);

    // Tuyến đường để tạo bình luận mới hoặc phản hồi
    // POST /api/comments
    router.post('/', protect, commentController.createComment);

    // Tuyến đường để lấy tất cả bình luận cấp cao nhất cho một bài viết cụ thể
    // GET /api/comments/post/:postId
    router.get('/post/:postId', commentController.getCommentsByPostId);

    // Tuyến đường để lấy tất cả phản hồi cho một bình luận cụ thể
    // GET /api/comments/reply/:commentId
    router.get('/reply/:commentId', commentController.getRepliesByCommentId);

    // Tuyến đường để xóa một bình luận (và các phản hồi của nó)
    // DELETE /api/comments/:commentId
    router.delete('/:commentId', protect, commentController.deleteComment);

    router.put('/:commentId', protect, commentController.updateComment);

    // Tuyến đường để like/unlike bình luận
    // POST /api/comments/:commentId/like
    router.post('/:commentId/like', protect, commentController.toggleCommentLike);

    // Tuyến đường để lấy danh sách người đã thích bình luận
    // GET /api/comments/:commentId/likes
    router.get('/:commentId/likes', protect, commentController.getCommentLikers);

    // Route lấy tất cả comment hoặc lọc theo authorId
    router.get('/', protect, commentController.getComments);

    return router; // It's crucial to return the router object
};
