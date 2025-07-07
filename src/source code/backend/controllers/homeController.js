const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Topic = require('../models/Topic');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const { getPostThumbnail } = require('../utils/imageExtractor');
const Like = require('../models/Like');

/**
 * @route GET /api/home/stats
 * @desc Lấy thống kê tổng quan cho trang chủ
 * @access Public
 */
exports.getHomeStats = async (req, res) => {
    try {
        // Đếm số thành viên (role = 'user')
        const userCount = await User.countDocuments({ role: 'user' });

        // Đếm tổng số bài viết
        const postCount = await Post.countDocuments();

        // Đếm số chủ đề
        const topicCount = await Topic.countDocuments();

        // Đếm hoạt động hôm nay (bài viết + bình luận)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayPosts = await Post.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        const todayComments = await Comment.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        const todayActivity = todayPosts + todayComments;

        res.status(200).json({
            success: true,
            data: {
                userCount,
                postCount,
                topicCount,
                todayActivity
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê trang chủ:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê',
            error: error.message
        });
    }
};

/**
 * @route GET /api/home/featured-posts
 * @desc Lấy bài viết nổi bật
 * @access Public
 */
exports.getFeaturedPosts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;

        // Find featured posts
        let posts = await Post.find({ featured: true })
            .populate('authorId', 'fullName username avatarUrl') // Populate author info
            .populate('topicId', 'name color category')      // Populate topic info
            .sort({ updatedAt: -1, createdAt: -1 }) // Sort by recent first
            .lean(); // Use .lean() for better performance

        console.log('Fetched featured posts (initial):', posts.length, 'posts');
        if (posts.length > 0) {
            console.log('Example post after initial fetch:', posts[0]);
        }

        // Calculate interaction score and sort in JavaScript
        posts = posts.map(post => {
            const interactionScore =
                (post.likeCount || 0) * 3 +
                (post.commentCount || 0) * 2 +
                (post.views || 0) / 10;
            return { ...post, interactionScore };
        });

        // Sort posts: newly updated (featured) first, then by interaction score
        posts.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);

            // Primary sort: by updatedAt descending
            if (dateB > dateA) return 1;
            if (dateB < dateA) return -1;

            // Secondary sort: if dates are equal, sort by interactionScore descending
            return b.interactionScore - a.interactionScore;
        });

        // Limit the results
        const limitedPosts = posts.slice(0, limit);

        // Get ratings for these posts
        const postIds = limitedPosts.map(p => p._id);
        const ratings = await Rating.aggregate([
            { $match: { postId: { $in: postIds } } },
            { $group: { _id: '$postId', averageRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
        ]);

        console.log('Fetched ratings:', ratings.length, 'ratings');
        if (ratings.length > 0) {
            console.log('Example rating:', ratings[0]);
        }

        const ratingsMap = new Map(ratings.map(r => [r._id.toString(), r]));

        // Add thumbnail and excerpt, and ensure consistent data structure
        const postsWithDetails = limitedPosts.map(post => {
            const postRatings = ratingsMap.get(post._id.toString());

            const authorInfo = post.authorId ? {
                _id: post.authorId._id,
                fullName: post.authorId.fullName || 'Anonymous',
                username: post.authorId.username || 'anonymous',
                avatarUrl: post.authorId.avatarUrl || null
            } : {
                fullName: 'Anonymous',
                username: 'anonymous',
                avatarUrl: null
            };

            const topicInfo = post.topicId ? {
                _id: post.topicId._id,
                name: post.topicId.name,
                color: post.topicId.color,
                category: post.topicId.category
            } : null;

            return {
                ...post,
                authorInfo,
                topicInfo,
                thumbnailImage: getPostThumbnail(post),
                excerpt: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
                averageRating: postRatings ? postRatings.averageRating : 0,
                totalRatings: postRatings ? postRatings.totalRatings : 0
            };
        });

        res.status(200).json({
            success: true,
            data: postsWithDetails
        });
    } catch (error) {
        console.error('Lỗi khi lấy bài viết nổi bật:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy bài viết nổi bật',
            error: error.message
        });
    }
};

/**
 * @route GET /api/home/trending-topics
 * @desc Lấy chủ đề thịnh hành
 * @access Public
 */
exports.getTrendingTopics = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        // Lấy chủ đề thịnh hành dựa trên:
        // 1. Chủ đề được đánh dấu trending = true
        // 2. Chủ đề có nhiều bài viết và hoạt động
        const trendingTopics = await Topic.aggregate([
            {
                $match: { status: 'active' }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'topicId',
                    as: 'posts',
                    pipeline: [
                        {
                            $match: {
                                status: { $ne: 'deleted' } // Chỉ đếm bài viết không bị xóa
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    // Sử dụng postCount từ database nếu có, nếu không thì tính từ lookup
                    actualPostCount: {
                        $cond: {
                            if: { $gt: ['$postCount', 0] },
                            then: '$postCount',
                            else: { $size: '$posts' }
                        }
                    },
                    recentPostCount: {
                        $size: {
                            $filter: {
                                input: '$posts',
                                cond: {
                                    $gte: ['$$this.createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] // 7 ngày qua
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    trendingScore: {
                        $add: [
                            { $multiply: ['$actualPostCount', 2] }, // Tổng số bài viết
                            { $multiply: ['$recentPostCount', 5] }, // Bài viết gần đây có trọng số cao
                            { $cond: ['$trending', 100, 0] } // Bonus cho chủ đề được đánh dấu trending
                        ]
                    }
                }
            },
            {
                $sort: {
                    trending: -1, // Ưu tiên chủ đề được đánh dấu trending
                    trendingScore: -1, // Sau đó theo điểm trending
                    actualPostCount: -1 // Cuối cùng theo số bài viết
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    color: 1,
                    category: 1,
                    icon: 1,
                    trending: 1,
                    postCount: '$actualPostCount', // Sử dụng actualPostCount
                    recentPostCount: 1,
                    trendingScore: 1,
                    createdAt: 1
                }
            },
            { $limit: limit }
        ]);

        // Cập nhật postCount trong database nếu cần thiết
        for (const topic of trendingTopics) {
            const Post = require('../models/Post');
            const actualCount = await Post.countDocuments({
                topicId: topic._id,
                status: { $ne: 'deleted' }
            });

            if (topic.postCount !== actualCount) {
                await Topic.findByIdAndUpdate(topic._id, { postCount: actualCount });
                topic.postCount = actualCount;
                console.log(`✅ Đã cập nhật postCount cho topic ${topic.name}: ${actualCount}`);
            }
        }

        res.status(200).json({
            success: true,
            data: trendingTopics
        });
    } catch (error) {
        console.error('Lỗi khi lấy chủ đề thịnh hành:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy chủ đề thịnh hành',
            error: error.message
        });
    }
};

/**
 * @route GET /api/home/recent-posts
 * @desc Lấy bài viết gần đây
 * @access Public
 */
exports.getRecentPosts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const recentPosts = await Post.find()
            .populate('authorId', 'fullName username avatarUrl')
            .populate('topicId', 'name color category')
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('title content images views createdAt');

        // Add thumbnail image to each post
        const postsWithThumbnails = recentPosts.map(post => ({
            ...post.toObject(),
            thumbnailImage: getPostThumbnail(post),
            excerpt: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''
        }));

        res.status(200).json({
            success: true,
            data: postsWithThumbnails
        });
    } catch (error) {
        console.error('Lỗi khi lấy bài viết gần đây:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy bài viết gần đây',
            error: error.message
        });
    }
};
