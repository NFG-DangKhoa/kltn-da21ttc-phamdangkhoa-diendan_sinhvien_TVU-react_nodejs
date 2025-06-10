const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

module.exports = (io) => {
    // Set the io instance in the postController
    postController.setIo(io);

    // Base route để lấy tất cả bài viết hoặc lọc theo authorId
    router.get('/', auth, postController.getPosts);

    // Tạo bài viết mới
    router.post('/cr', auth, postController.createPost);
    router.post('/crr', auth, postController.createPostWithImages);

    // Lấy bài viết theo topic
    router.get('/topic/:topicId', postController.getPostsByTopic);
    router.get('/topic/:topicId/post/:postId', postController.getPostByTopicAndPostIdWithDetails);

    // CRUD operations cho bài viết
    router.get('/:id', postController.getPostById);
    router.put('/:id', auth, postController.updatePost);
    router.delete('/:id', auth, postController.deletePost);
    router.put('/:id/view', postController.incrementViews);

    // Route đặc biệt cho topic details
    router.get('/topic-details/:topicId', postController.getPostsByTopicWithDetails);

    return router;
};