const express = require('express');
const router = express.Router();
// Import chính xác hàm getTopicById
const { getTopicById, getAllTopics, getTopicsWithLatestPosts } = require('../controllers/topicController');

// Route để lấy tất cả các chủ đề với thông tin bài viết gần nhất (cho Home page)
router.get('/with-latest-posts', getTopicsWithLatestPosts);

// Route để lấy tất cả các chủ đề (basic)
router.get('/all', getAllTopics);

// Route để lấy thông tin chủ đề theo ID
router.get('/topics/:topicId', getTopicById);

module.exports = router;