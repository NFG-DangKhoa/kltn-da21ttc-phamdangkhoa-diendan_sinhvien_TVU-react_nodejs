const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// User search for mentions
router.get('/search', authMiddleware, userController.searchUsers);

// Profile management
router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, userController.updateMe);

// User statistics
router.get('/stats/:userId', authMiddleware, userController.getUserStats);

// User activities
router.get('/posts', authMiddleware, userController.getUserPosts);
router.get('/comments', authMiddleware, userController.getUserComments);
router.get('/likes', authMiddleware, userController.getUserLikes);

module.exports = router;