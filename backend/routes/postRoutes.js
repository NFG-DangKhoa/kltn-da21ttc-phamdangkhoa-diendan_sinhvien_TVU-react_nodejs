const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware'); // Đảm bảo đúng đường dẫn cho middleware

// Import postController directly. We will set `io` separately.
const postController = require('../controllers/postController');

// Export a function that accepts `io` and then uses it to set up the controller
module.exports = (io) => {
    // Set the io instance in the postController
    postController.setIo(io);

    // Tạo bài viết mới (có thể có hoặc không có auth, tùy logic của bạn)
    router.post('/cr', auth, postController.createPost);
    // This line will now correctly reference the exported function
    router.post('/crr', auth, postController.createPostWithImages);

    // Lấy danh sách bài viết theo chủ đề
    router.get('/topic/:topicId', postController.getPostsByTopic);

    // Lấy danh sách bài viết theo topic id và post id = dành cho file chi tiết bài viết
    router.get('/topic/:topicId/post/:postId', postController.getPostByTopicAndPostIdWithDetails);

    // Lấy chi tiết bài viết theo ID
    router.get('/:id', postController.getPostById);

    // Cập nhật bài viết (cần auth)
    router.put('/:id', auth, postController.updatePost); // Changed to :id for consistency

    // Xóa bài viết (cần auth)
    router.delete('/:id', auth, postController.deletePost); // Changed to :id for consistency

    // Tăng lượt xem (có thể không cần auth)
    router.put('/:id/view', postController.incrementViews);

    // Lấy danh sách bài viết theo chủ đề với chi tiết (có thể không cần auth)
    router.get('/topic-details/:topicId', postController.getPostsByTopicWithDetails);

    return router; // It's crucial to return the router object
};