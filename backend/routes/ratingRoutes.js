const express = require('express');
const ratingController = require('../controllers/ratingController'); // Import toàn bộ module controller

// Module này xuất ra một hàm nhận đối tượng 'io' (Socket.IO server instance)
// và trả về một Express Router đã được cấu hình.
module.exports = (io) => {
    const router = express.Router();

    // Route POST /api/ratings/
    // Tạo một đánh giá mới hoặc cập nhật nếu đã tồn tại
    // controller.createRating cần đối tượng `io` để phát sự kiện
    router.post('/', (req, res) => ratingController.createRating(req, res, io));

    // Route GET /api/ratings/post/:postId
    // Lấy tất cả các đánh giá cho một bài đăng cụ thể và điểm trung bình của nó
    // controller.getRatingsByPostId không cần đối tượng `io`
    router.get('/post/:postId', ratingController.getRatingsByPostId);

    // Route PUT /api/ratings/post/:postId/user/:userId
    // Cập nhật một đánh giá cụ thể dựa trên postId và userId
    // controller.updateRating cần đối tượng `io` để phát sự kiện
    router.put('/post/:postId/user/:userId', (req, res) => ratingController.updateRating(req, res, io));

    // Route DELETE /api/ratings/post/:postId/user/:userId
    // Xóa một đánh giá cụ thể dựa trên postId và userId
    // controller.deleteRating cần đối tượng `io` để phát sự kiện
    router.delete('/post/:postId/user/:userId', (req, res) => ratingController.deleteRating(req, res, io));

    return router;
};

