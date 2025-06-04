const express = require('express');
const router = express.Router();
// Import chính xác hàm getTopicById
const { getTopicById, getAllTopics } = require('../controllers/topicController');

// Nếu bạn có hàm getAllTopics trong controller, hãy import nó như thế này:
// const { getAllTopics } = require('../controllers/topicController');

// Route để lấy tất cả các chủ đề (nếu bạn có hàm này)
router.get('/all', getAllTopics); // Bỏ comment nếu bạn có hàm getAllTopics

// Route để lấy thông tin chủ đề theo ID
router.get('/topics/:topicId', getTopicById); // Sử dụng trực tiếp getTopicById đã import

module.exports = router;