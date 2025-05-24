// File: routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Tạo bài viết mới
// Route tạo bài viết mới
router.post('/cr', postController.createPost);

router.post('/crr', postController.createPostWithImages);

// Lấy danh sách bài viết theo chủ đề
router.get('/topic/:topicId', postController.getPostsByTopic);

// Lấy danh sách bài viết theo topic id và post id
router.get('/topic/:topicId/post/:postId', postController.getPostByTopicAndPostIdWithDetails);


// Lấy chi tiết bài viết theo ID
router.get('/:id', postController.getPostById);

// Cập nhật bài viết
router.put('/:id', postController.updatePost);

// Xóa bài viết
router.delete('/:id', postController.deletePost);

// Tăng lượt xem
router.put('/:id/view', postController.incrementViews);

router.get('/topic-details/:topicId', postController.getPostsByTopicWithDetails);

module.exports = router;

