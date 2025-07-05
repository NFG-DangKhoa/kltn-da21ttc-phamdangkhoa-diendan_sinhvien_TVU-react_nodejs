const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdminMiddleware');
const adminCommentController = require('../controllers/adminCommentController');

// GET all comments (with optional filters)
router.get('/', auth, isAdmin, adminCommentController.getAllComments);

// GET comment statistics
router.get('/stats', auth, isAdmin, adminCommentController.getCommentStats);

// PUT approve a comment
router.put('/:id/approve', auth, isAdmin, adminCommentController.approveComment);

// PUT bulk approve comments
router.put('/bulk-approve', auth, isAdmin, adminCommentController.bulkApproveComments);

// PUT edit a comment
router.put('/:id', auth, isAdmin, adminCommentController.editComment);

// DELETE a comment
router.delete('/:id', auth, isAdmin, adminCommentController.deleteComment);

// DELETE bulk delete comments
router.delete('/bulk-delete', auth, isAdmin, adminCommentController.bulkDeleteComments);

module.exports = router;
