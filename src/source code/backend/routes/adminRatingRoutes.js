const express = require('express');
const router = express.Router();
const { getAllRatings, deleteRating, getRatingsByPost } = require('../controllers/adminRatingController');
const { protect, admin } = require('../middlewares/authMiddleware');

// GET all ratings
router.get('/', protect, admin, getAllRatings);

// GET all ratings for a specific post
router.get('/post/:postId', protect, admin, getRatingsByPost);

// DELETE a rating
router.delete('/:id', protect, admin, deleteRating);

module.exports = router;
