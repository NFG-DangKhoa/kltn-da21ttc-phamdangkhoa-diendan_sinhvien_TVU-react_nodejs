const express = require('express');
const router = express.Router();
const { getAllRatings, deleteRating } = require('../controllers/adminRatingController');
const { protect, admin } = require('../middlewares/authMiddleware');

// GET all ratings
router.get('/', protect, admin, getAllRatings);

// DELETE a rating
router.delete('/:id', protect, admin, deleteRating);

module.exports = router;
