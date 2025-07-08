const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect: authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// User search for mentions
router.get('/search', authMiddleware, userController.searchUsers);

// Get all members for members list page
router.get('/members', userController.getAllMembers);

// Profile management
router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), userController.updateMe);
router.put('/me/activity-visibility', authMiddleware, userController.updateActivityVisibility);
router.post('/upload-image', authMiddleware, userController.updateProfileImage);

// User activities
// These routes are intentionally public to allow viewing user activities without authentication.
router.get('/posts', userController.getUserPosts);
router.get('/comments', userController.getUserComments);
router.get('/likes', userController.getUserLikes);

// User statistics
// This route is intentionally public to allow viewing profile stats without authentication.
router.get('/stats/:userId', userController.getUserStats);

// Add this route to get a user by their ID
// IMPORTANT: This must be AFTER specific string routes like /posts, /likes, etc.
// This route is intentionally public to allow viewing profiles without authentication.
router.get('/:userId', userController.getUserById);

module.exports = router;
