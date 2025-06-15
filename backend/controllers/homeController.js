const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Topic = require('../models/Topic');
const Comment = require('../models/Comment');
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

        // Lấy bài viết nổi bật dựa trên:
        // 1. Bài viết được đánh dấu featured = true
        // 2. Bài viết có nhiều tương tác (likes + comments + views)
        const featuredPosts = await Post.aggregate([
            // First filter only featured posts
            {
                $match: {
                    featured: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            {
                $lookup: {
                    from: 'topics', // MongoDB collection name (lowercase + plural)
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topicInfo'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'targetId',
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    authorInfo: { $arrayElemAt: ['$authorInfo', 0] },
                    topicInfo: { $arrayElemAt: ['$topicInfo', 0] },
                    // Use existing commentCount and likeCount fields from Post model
                    interactionScore: {
                        $add: [
                            { $multiply: [{ $ifNull: ['$likeCount', 0] }, 3] }, // Likes có trọng số 3
                            { $multiply: [{ $ifNull: ['$commentCount', 0] }, 2] }, // Comments có trọng số 2
                            { $divide: [{ $ifNull: ['$views', 0] }, 10] } // Views có trọng số thấp
                        ]
                    }
                }
            },
            {
                $sort: {
                    featured: -1, // Ưu tiên bài viết được đánh dấu featured
                    updatedAt: -1, // Bài viết mới được đánh dấu featured sẽ lên đầu
                    interactionScore: -1, // Sau đó sắp xếp theo điểm tương tác
                    createdAt: -1 // Cuối cùng theo thời gian tạo
                }
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    images: 1,
                    views: 1,
                    featured: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    commentCount: 1,
                    likeCount: 1,
                    interactionScore: 1,
                    topicId: 1, // Include original topicId for navigation
                    'authorInfo.fullName': 1,
                    'authorInfo.username': 1,
                    'authorInfo.avatarUrl': 1,
                    'topicInfo._id': 1, // Include topicInfo._id for navigation
                    'topicInfo.name': 1,
                    'topicInfo.color': 1,
                    'topicInfo.category': 1
                }
            },
            { $limit: limit }
        ]);

        // Add thumbnail image to each post
        const postsWithThumbnails = featuredPosts.map(post => ({
            ...post,
            thumbnailImage: getPostThumbnail(post),
            // Create excerpt from content (remove HTML tags)
            excerpt: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''
        }));

        res.status(200).json({
            success: true,
            data: postsWithThumbnails
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
