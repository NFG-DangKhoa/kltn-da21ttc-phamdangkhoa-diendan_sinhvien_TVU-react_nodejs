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
        const { fullName, email, phoneNumber, isPhoneNumberHidden, bio, avatarUrl, coverPhotoUrl } = req.body;

        const updateData = {
            fullName,
            email,
            phoneNumber,
            isPhoneNumberHidden: isPhoneNumberHidden,
            bio,
            updatedAt: Date.now()
        };

        if (req.files && req.files.avatar && req.files.avatar[0]) {
            // If a new avatar is uploaded, update the avatarUrl
            updateData.avatarUrl = `/upload/${req.files.avatar[0].filename}`;
        } else if (avatarUrl) {
            // If no new avatar file, but a URL is provided (e.g. from the form)
            updateData.avatarUrl = avatarUrl;
        }

        if (req.files && req.files.coverPhoto && req.files.coverPhoto[0]) {
            // If a new cover photo is uploaded, update the coverPhotoUrl
            updateData.coverPhotoUrl = `/upload/${req.files.coverPhoto[0].filename}`;
        } else if (coverPhotoUrl) {
            // If no new cover photo file, but a URL is provided (e.g. from the form)
            updateData.coverPhotoUrl = coverPhotoUrl;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        res.json({ message: 'Cập nhật hồ sơ thành công', user });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin.' });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        // Add validation for userId
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
        }

        const user = await User.findById(req.params.userId).select('-password').lean();
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // Aggregate total likes from user's posts
        const totalLikesAggregation = await Post.aggregate([
            { $match: { authorId: user._id } },
            { $group: { _id: null, totalLikes: { $sum: "$likeCount" } } }
        ]);

        const totalLikes = totalLikesAggregation.length > 0 ? totalLikesAggregation[0].totalLikes : 0;

        // Aggregate total comments
        const totalComments = await Comment.countDocuments({ authorId: user._id });

        // Aggregate total posts
        const totalPosts = await Post.countDocuments({ authorId: user._id });

        // Check if user is online (last seen within 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        user.isOnline = user.lastSeen > fiveMinutesAgo;

        // Add stats to user object
        user.stats = {
            totalPosts,
            totalComments,
            totalLikes
        };

        res.json(user);
    } catch (err) {
        console.error('Error getting user by ID:', err);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

// Get all members for members list page
exports.getAllMembers = async (req, res) => {
    try {
        const { page = 1, limit = 12, search = '', sortBy = 'latest', role } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build search query
        let searchQuery = {};
        if (search) {
            searchQuery.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            searchQuery.role = role;
        }

        // Build sort option
        let sortOption = {};
        switch (sortBy) {
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'posts_desc':
                sortOption = { postsCount: -1, createdAt: -1 };
                break;
            case 'posts_asc':
                sortOption = { postsCount: 1, createdAt: -1 };
                break;
            case 'name_asc':
                sortOption = { fullName: 1 };
                break;
            case 'name_desc':
                sortOption = { fullName: -1 };
                break;
            case 'latest':
            default:
                sortOption = { createdAt: -1 };
                break;
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
            { $sort: sortOption },
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
        const userId = req.params.userId || req.user._id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Aggregate total likes from user's posts
        const totalLikesAggregation = await Post.aggregate([
            { $match: { authorId: userObjectId } },
            { $group: { _id: null, totalLikes: { $sum: "$likeCount" } } }
        ]);

        const likeCount = totalLikesAggregation.length > 0 ? totalLikesAggregation[0].totalLikes : 0;

        const [postCount, commentCount] = await Promise.all([
            Post.countDocuments({ authorId: userObjectId }),
            Comment.countDocuments({ authorId: userObjectId })
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
        console.log(`[getUserPosts] Received authorId: ${authorId}`);
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            console.log(`[getUserPosts] Invalid authorId: ${authorId}`);
            return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
        }

        const posts = await Post.find({ authorId })
            .sort({ createdAt: -1 })
            .populate('authorId', 'fullName username avatarUrl')
            .populate('topicId', 'name')
            .lean();

        console.log(`[getUserPosts] Fetched posts (before counts):`, posts.map(p => ({ _id: p._id, authorId: p.authorId?._id, topicId: p.topicId?._id })));

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
        console.log(`[getUserComments] Received authorId: ${authorId}`);
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            console.log(`[getUserComments] Invalid authorId: ${authorId}`);
            return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
        }

        const comments = await Comment.find({ authorId })
            .sort({ createdAt: -1 })
            .populate('authorId', 'fullName username avatarUrl')
            .populate('postId', 'title topicId')
            .lean();

        console.log(`[getUserComments] Fetched comments (before likes):`, comments.map(c => ({ _id: c._id, authorId: c.authorId?._id, postId: c.postId?._id })));

        const commentsWithLikes = await Promise.all(comments.map(async comment => {
            const likeCount = await Like.countDocuments({ commentId: comment._id });
            const { postId, ...restOfComment } = comment;
            return {
                ...restOfComment,
                likeCount,
                postTitle: postId?.title || 'Bài viết đã bị xóa',
                postId: postId?._id,
                topicId: postId?.topicId
            };
        }));

        res.json(commentsWithLikes);
    } catch (err) {
        console.error('Error getting user comments:', err);
        res.status(500).json({ message: 'Lỗi khi lấy bình luận của người dùng.' });
    }
};

// Get user's likes (Likes received on their posts)
exports.getUserLikes = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
        }

        // Find all posts by the user
        const userPosts = await Post.find({ authorId: userId }).select('_id').lean();
        if (userPosts.length === 0) {
            return res.json([]);
        }
        const userPostIds = userPosts.map(p => p._id);

        // Find all likes on those posts
        const likesReceived = await Like.find({ postId: { $in: userPostIds }, targetType: 'post' })
            .sort({ createdAt: -1 })
            .populate('userId', 'fullName username avatarUrl') // The user who gave the like
            .populate('postId', 'title topicId') // The post that was liked
            .lean();

        const formattedLikes = likesReceived.map(like => ({
            _id: like._id,
            createdAt: like.createdAt,
            liker: like.userId, // The user who performed the like
            postTitle: like.postId?.title || 'Bài viết đã bị xóa',
            postId: like.postId?._id,
            topicId: like.postId?.topicId,
            type: 'like_received'
        }));

        res.json(formattedLikes);

    } catch (err) {
        console.error('Error getting user likes received:', err);
        res.status(500).json({ message: 'Lỗi khi lấy lượt thích đã nhận.' });
    }
};

// Update user activity visibility settings
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Update user activity visibility settings
exports.updateActivityVisibility = async (req, res) => {
    try {
        const { posts, comments, likes } = req.body;

        // Basic validation
        if (typeof posts !== 'boolean' || typeof comments !== 'boolean' || typeof likes !== 'boolean') {
            return res.status(400).json({ message: 'Invalid visibility settings provided.' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'activityVisibility.posts': posts,
                    'activityVisibility.comments': comments,
                    'activityVisibility.likes': likes,
                }
            },
            { new: true, runValidators: true }
        ).select('activityVisibility');

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        res.json({ message: 'Cập nhật cài đặt hiển thị hoạt động thành công', activityVisibility: user.activityVisibility });
    } catch (err) {
        console.error("Error updating activity visibility:", err);
        res.status(500).json({ message: 'Lỗi khi cập nhật cài đặt.' });
    }
};

// Upload and crop profile image
const deleteOldImage = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith('/upload/')) {
        const oldImagePath = path.join(__dirname, '..', 'public', imageUrl);
        fs.unlink(oldImagePath, (err) => {
            if (err) {
                console.error(`Error deleting old image ${oldImagePath}:`, err);
            } else {
                console.log(`Old image deleted: ${oldImagePath}`);
            }
        });
    }
};

// Upload and crop profile image
exports.updateProfileImage = async (req, res) => {
    try {
        const { image, crop, zoom, rotation, imageType } = req.body;

        if (!image || !crop || !imageType) {
            return res.status(400).json({ message: 'Dữ liệu ảnh, cắt và loại ảnh là bắt buộc.' });
        }

        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // Delete old image before saving new one
        if (imageType === 'avatar') {
            deleteOldImage(currentUser.avatarUrl);
        } else if (imageType === 'cover') {
            deleteOldImage(currentUser.coverPhotoUrl);
        }

        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
        const outputPath = path.join(__dirname, '..', 'public', 'upload', filename);
        const relativePath = `/upload/${filename}`;

        const imageProcessor = sharp(buffer);

        // Get image metadata to calculate actual crop area
        const metadata = await imageProcessor.metadata();
        const originalWidth = metadata.width;
        const originalHeight = metadata.height;

        // Calculate actual crop dimensions based on frontend crop data (normalized to 0-1)
        const cropWidth = Math.round(crop.width * originalWidth);
        const cropHeight = Math.round(crop.height * originalHeight);
        const cropX = Math.round(crop.x * originalWidth);
        const cropY = Math.round(crop.y * originalHeight);

        await imageProcessor
            .extract({
                left: cropX,
                top: cropY,
                width: cropWidth,
                height: cropHeight
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

        const updateField = imageType === 'avatar' ? 'avatarUrl' : 'coverPhotoUrl';

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { [updateField]: relativePath, updatedAt: Date.now() } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        res.json({ message: 'Cập nhật ảnh thành công', user: user, imageUrl: relativePath });

    } catch (err) {
        console.error("Error updating profile image:", err);
        res.status(500).json({ message: 'Lỗi khi cập nhật ảnh hồ sơ.' });
    }
};
