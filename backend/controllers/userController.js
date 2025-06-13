const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const mongoose = require('mongoose');

// Search users for mentions
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ message: 'Query must be at least 2 characters long' });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { fullName: { $regex: q, $options: 'i' } }
            ]
        })
            .select('username fullName avatarUrl avatar')
            .limit(10)
            .lean();

        res.json({ users });
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm người dùng.' });
    }
};

// Get user's own profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

// Update user profile
exports.updateMe = async (req, res) => {
    try {
        const { fullName, bio, avatarUrl } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fullName, bio, avatarUrl },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin.' });
    }
};

// Get all members for members list page
exports.getAllMembers = async (req, res) => {
    try {
        const { page = 1, limit = 12, search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build search query
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Get members with post count
        const members = await User.aggregate([
            { $match: searchQuery },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'authorId',
                    as: 'posts'
                }
            },
            {
                $addFields: {
                    postsCount: { $size: '$posts' }
                }
            },
            {
                $project: {
                    password: 0,
                    posts: 0,
                    __v: 0
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum }
        ]);

        // Get total count for pagination
        const totalMembers = await User.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalMembers / limitNum);

        res.json({
            success: true,
            data: {
                members,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalMembers,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });
    } catch (err) {
        console.error('Error getting all members:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thành viên.'
        });
    }
};

// Get user stats
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const [postCount, commentCount, likeCount] = await Promise.all([
            Post.countDocuments({ authorId: userId }),
            Comment.countDocuments({ authorId: userId }),
            Like.countDocuments({ userId: userId })
        ]);

        res.json({
            postCount,
            commentCount,
            likeCount
        });
    } catch (err) {
        console.error('Error getting user stats:', err);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê người dùng.' });
    }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
    try {
        const { authorId } = req.query;
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
        }

        const posts = await Post.find({ authorId })
            .sort({ createdAt: -1 })
            .populate('authorId', 'fullName username avatarUrl')
            .populate('topicId', 'name')
            .lean();

        const postsWithCounts = await Promise.all(posts.map(async post => {
            const [likeCount, commentCount] = await Promise.all([
                Like.countDocuments({ postId: post._id }),
                Comment.countDocuments({ postId: post._id })
            ]);
            return { ...post, likeCount, commentCount };
        }));

        res.json(postsWithCounts);
    } catch (err) {
        console.error('Error getting user posts:', err);
        res.status(500).json({ message: 'Lỗi khi lấy bài viết của người dùng.' });
    }
};

// Get user's comments
exports.getUserComments = async (req, res) => {
    try {
        const { authorId } = req.query;
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
        }

        const comments = await Comment.find({ authorId })
            .sort({ createdAt: -1 })
            .populate('authorId', 'fullName username avatarUrl')
            .populate('postId', 'title')
            .lean();

        const commentsWithLikes = await Promise.all(comments.map(async comment => {
            const likeCount = await Like.countDocuments({ commentId: comment._id });
            return {
                ...comment,
                likeCount,
                postTitle: comment.postId?.title || 'Bài viết đã bị xóa'
            };
        }));

        res.json(commentsWithLikes);
    } catch (err) {
        console.error('Error getting user comments:', err);
        res.status(500).json({ message: 'Lỗi khi lấy bình luận của người dùng.' });
    }
};

// Get user's likes
exports.getUserLikes = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
        }

        const likes = await Like.find({ userId })
            .sort({ createdAt: -1 })
            .populate('postId', 'title')
            .populate({
                path: 'commentId',
                populate: {
                    path: 'authorId postId',
                    select: 'fullName username title'
                }
            })
            .lean();

        const formattedLikes = likes.map(like => ({
            ...like,
            postTitle: like.targetType === 'post' ? like.postId?.title : like.commentId?.postId?.title,
            commentAuthor: like.targetType === 'comment' ? like.commentId?.authorId?.fullName : null,
            commentContent: like.targetType === 'comment' ? like.commentId?.content : null,
            commentPostId: like.targetType === 'comment' ? like.commentId?.postId?._id : null
        }));

        res.json(formattedLikes);
    } catch (err) {
        console.error('Error getting user likes:', err);
        res.status(500).json({ message: 'Lỗi khi lấy lượt thích của người dùng.' });
    }
};