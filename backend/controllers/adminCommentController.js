const Comment = require('../models/Comment');
const CommentLike = require('../models/CommentLike');
const User = require('../models/User');
const Post = require('../models/Post');

// Get all comments (optionally filter by status, post, user, etc.) with pagination
exports.getAllComments = async (req, res) => {
    try {
        const { status, postId, userId, page = 1, limit = 10, search } = req.query;
        let filter = {};

        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Post filter
        if (postId) filter.postId = postId;

        // User filter
        if (userId) filter.authorId = userId;

        // Search filter
        if (search) {
            filter.content = { $regex: search, $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Comment.countDocuments(filter);

        const comments = await Comment.find(filter)
            .populate('authorId', 'username fullName avatar avatarUrl')
            .populate('postId', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            comments,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

// Get comment statistics
exports.getCommentStats = async (req, res) => {
    try {
        const total = await Comment.countDocuments();
        const approved = await Comment.countDocuments({ status: 'approved' });
        const pending = await Comment.countDocuments({ status: { $ne: 'approved' } });
        const reported = await Comment.countDocuments({ reported: true });

        // Get total likes across all comments
        const totalLikes = await Comment.aggregate([
            { $group: { _id: null, total: { $sum: '$likeCount' } } }
        ]);

        // Get total replies
        const totalReplies = await Comment.countDocuments({ level: { $gt: 0 } });

        res.status(200).json({
            total,
            approved,
            pending,
            reported,
            totalLikes: totalLikes[0]?.total || 0,
            totalReplies
        });
    } catch (error) {
        console.error('Error fetching comment stats:', error);
        res.status(500).json({ message: 'Error fetching comment stats', error: error.message });
    }
};

// Approve a comment
exports.approveComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error approving comment:', error);
        res.status(500).json({ message: 'Error approving comment', error: error.message });
    }
};

// Bulk approve comments
exports.bulkApproveComments = async (req, res) => {
    try {
        const { commentIds } = req.body;

        if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
            return res.status(400).json({ message: 'Comment IDs array is required' });
        }

        const result = await Comment.updateMany(
            { _id: { $in: commentIds } },
            { status: 'approved' }
        );

        res.status(200).json({
            message: `${result.modifiedCount} comments approved successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error bulk approving comments:', error);
        res.status(500).json({ message: 'Error bulk approving comments', error: error.message });
    }
};

// Edit a comment (admin can edit any comment)
exports.editComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const comment = await Comment.findByIdAndUpdate(
            id,
            { content: content.trim(), updatedAt: Date.now() },
            { new: true }
        ).populate('authorId', 'username fullName avatar avatarUrl')
            .populate('postId', 'title');

        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error editing comment:', error);
        res.status(500).json({ message: 'Error editing comment', error: error.message });
    }
};

// Delete a comment (and its replies)
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the comment first to get its details
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Delete the comment and all its replies
        const deleteResult = await Comment.deleteMany({
            $or: [
                { _id: id },
                { parentCommentId: id },
                { rootCommentId: id }
            ]
        });

        // Also delete associated likes
        await CommentLike.deleteMany({
            commentId: {
                $in: await Comment.find({
                    $or: [
                        { _id: id },
                        { parentCommentId: id },
                        { rootCommentId: id }
                    ]
                }).distinct('_id')
            }
        });

        res.status(200).json({
            message: 'Comment and its replies deleted successfully',
            deletedCount: deleteResult.deletedCount
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

// Bulk delete comments
exports.bulkDeleteComments = async (req, res) => {
    try {
        const { commentIds } = req.body;

        if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
            return res.status(400).json({ message: 'Comment IDs array is required' });
        }

        // Find all comments and their nested replies
        const allCommentIds = [];
        for (const commentId of commentIds) {
            // Add the main comment
            allCommentIds.push(commentId);

            // Find all nested replies
            const nestedReplies = await Comment.find({
                $or: [
                    { parentCommentId: commentId },
                    { rootCommentId: commentId }
                ]
            }).distinct('_id');

            allCommentIds.push(...nestedReplies);
        }

        // Delete all comments and replies
        const deleteResult = await Comment.deleteMany({
            _id: { $in: allCommentIds }
        });

        // Delete associated likes
        await CommentLike.deleteMany({
            commentId: { $in: allCommentIds }
        });

        res.status(200).json({
            message: `${deleteResult.deletedCount} comments and their replies deleted successfully`,
            deletedCount: deleteResult.deletedCount
        });
    } catch (error) {
        console.error('Error bulk deleting comments:', error);
        res.status(500).json({ message: 'Error bulk deleting comments', error: error.message });
    }
};
