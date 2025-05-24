const express = require('express');
const router = express.Router();
const { getAllTopics } = require('../controllers/topicController');

router.get('/all', getAllTopics);

module.exports = router;
