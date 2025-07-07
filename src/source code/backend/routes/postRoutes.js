const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

module.exports = (io) => {
    // Set the io instance in the postController
    postController.setIo(io);

    // Debug: Check if getRecentPosts exists
    console.log('🔍 DEBUG: postController.getRecentPosts exists:', typeof postController.getRecentPosts);

    // Route để lấy bài viết gần đây (không cần auth)
    router.get('/recent', postController.getRecentPosts);

    // Base route để lấy tất cả bài viết hoặc lọc theo authorId
    router.get('/', protect, postController.getPosts);

    // Tạo bài viết mới
    router.post('/cr', protect, postController.createPost);
    router.post('/crr', protect, postController.createPostWithImages);

    // Lấy bài viết theo topic
    router.get('/topic/:topicId', postController.getPostsByTopic);

    // Optional auth middleware - allows both authenticated and guest users
    const optionalAuth = (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                req.user = decoded;
            } catch (error) {
                // Token invalid, but continue as guest
                req.user = null;
            }
        } else {
            req.user = null;
        }
        next();
    };

    router.get('/topic/:topicId/post/:postId', optionalAuth, postController.getPostByTopicAndPostIdWithDetails);

    // CRUD operations cho bài viết
    router.get('/:id', postController.getPostById);
    router.put('/:id', protect, postController.updatePost);
    router.delete('/:id', protect, postController.deletePost);
    router.put('/:id/view', postController.incrementViews);

    // Route đặc biệt cho topic details
    router.get('/topic-details/:topicId', postController.getPostsByTopicWithDetails);

    return router;
};