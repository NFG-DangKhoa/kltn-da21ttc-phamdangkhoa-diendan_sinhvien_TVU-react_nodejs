const express = require('express');
const router = express.Router();
const { getAllLikes, deleteLike, getLikesByPost } = require('../controllers/adminLikeController');
const { protect, admin } = require('../middlewares/authMiddleware');

// GET all likes
router.get('/', protect, admin, getAllLikes);

// DELETE a like
router.delete('/:id', protect, admin, deleteLike);

// GET likes for a specific post
router.get('/post/:postId', protect, admin, getLikesByPost);

module.exports = router;
