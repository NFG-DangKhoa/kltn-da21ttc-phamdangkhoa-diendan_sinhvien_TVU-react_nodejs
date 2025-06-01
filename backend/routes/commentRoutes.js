// File: backend/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware'); // Giả sử bạn có middleware xác thực

// Wrap your routes in a function that accepts `io`
module.exports = (io) => {
    // Optionally, set the io instance in the commentController if it needs to emit events
    // Make sure your commentController.js has an `exports.setIo = (socketIoInstance) => { io = socketIoInstance; }` function.
    if (commentController.setIo) {
        commentController.setIo(io);
    } else {
        console.warn("commentController does not have a setIo function. Real-time updates for comments might not work.");
    }

    // Tuyến đường để tạo bình luận mới hoặc phản hồi
    // POST /api/comments
    router.post('/', authMiddleware, commentController.createComment);

    // Tuyến đường để lấy tất cả bình luận cấp cao nhất cho một bài viết cụ thể
    // GET /api/comments/post/:postId
    router.get('/post/:postId', commentController.getCommentsByPostId);

    // Tuyến đường để lấy tất cả phản hồi cho một bình luận cụ thể
    // GET /api/comments/reply/:commentId
    router.get('/reply/:commentId', commentController.getRepliesByCommentId);

    // Tuyến đường để xóa một bình luận (và các phản hồi của nó)
    // DELETE /api/comments/:commentId
    router.delete('/:commentId', authMiddleware, commentController.deleteComment);

    router.put('/:commentId', authMiddleware, commentController.updateComment);

    return router; // It's crucial to return the router object
};