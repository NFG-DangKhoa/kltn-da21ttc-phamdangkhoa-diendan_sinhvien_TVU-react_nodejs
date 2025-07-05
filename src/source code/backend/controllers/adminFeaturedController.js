const Post = require('../models/Post');
const Topic = require('../models/Topic');
const { getPostThumbnail } = require('../utils/imageExtractor');

/**
 * @route GET /api/admin/featured/posts
 * @desc Lấy danh sách bài viết để quản lý featured
 * @access Admin
 */
exports.getFeaturedPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; // Increase default limit to show more posts
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('authorId', 'fullName username avatarUrl')
            .populate('topicId', 'name color')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title content featured views commentCount likeCount createdAt status');

        const total = await Post.countDocuments();

        // Add thumbnail image to each post
        const postsWithThumbnails = posts.map(post => ({
            ...post.toObject(),
            thumbnailImage: getPostThumbnail(post),
            excerpt: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : ''
        }));

        res.status(200).json({
            success: true,
            data: {
                posts: postsWithThumbnails,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách bài viết',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/featured/posts/:id
 * @desc Cập nhật trạng thái featured của bài viết
 * @access Admin
 */
exports.updatePostFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const { featured } = req.body;

        const post = await Post.findByIdAndUpdate(
            id,
            { featured: featured },
            { new: true }
        ).populate('authorId', 'fullName username')
            .populate('topicId', 'name');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        res.status(200).json({
            success: true,
            message: `Bài viết đã được ${featured ? 'đánh dấu nổi bật' : 'bỏ đánh dấu nổi bật'}`,
            data: post
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật featured post:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật bài viết',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/featured/topics
 * @desc Lấy danh sách chủ đề để quản lý trending
 * @access Admin
 */
exports.getTrendingTopics = async (req, res) => {
    try {
        const topics = await Topic.aggregate([
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'topicId',
                    as: 'posts'
                }
            },
            {
                $addFields: {
                    postCount: { $size: '$posts' },
                    recentPostCount: {
                        $size: {
                            $filter: {
                                input: '$posts',
                                cond: {
                                    $gte: ['$$this.createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]
                                }
                            }
                        }
                    }
                }
            },
            {
                $sort: { trending: -1, postCount: -1 }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    color: 1,
                    category: 1,
                    trending: 1,
                    postCount: 1,
                    recentPostCount: 1,
                    status: 1,
                    isVisible: 1,
                    createdAt: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: topics
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách chủ đề:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách chủ đề',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/featured/topics/:id
 * @desc Cập nhật trạng thái trending của chủ đề
 * @access Admin
 */
exports.updateTopicTrending = async (req, res) => {
    try {
        const { id } = req.params;
        const { trending } = req.body;

        const topic = await Topic.findByIdAndUpdate(
            id,
            { trending: trending },
            { new: true, validateBeforeSave: false }
        );

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chủ đề'
            });
        }

        res.status(200).json({
            success: true,
            message: `Chủ đề đã được ${trending ? 'đánh dấu thịnh hành' : 'bỏ đánh dấu thịnh hành'}`,
            data: topic
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trending topic:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật chủ đề',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/featured/bulk-update-posts
 * @desc Cập nhật hàng loạt trạng thái featured của bài viết
 * @access Admin
 */
exports.bulkUpdatePostsFeatured = async (req, res) => {
    try {
        const { postIds, featured } = req.body;

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách ID bài viết không hợp lệ'
            });
        }

        const result = await Post.updateMany(
            { _id: { $in: postIds } },
            { featured: featured }
        );

        res.status(200).json({
            success: true,
            message: `Đã cập nhật ${result.modifiedCount} bài viết`,
            data: {
                matched: result.matchedCount,
                modified: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật hàng loạt bài viết:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật hàng loạt bài viết',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/featured/bulk-update-topics
 * @desc Cập nhật hàng loạt trạng thái trending của chủ đề
 * @access Admin
 */
exports.bulkUpdateTopicsTrending = async (req, res) => {
    try {
        const { topicIds, trending } = req.body;

        if (!Array.isArray(topicIds) || topicIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách ID chủ đề không hợp lệ'
            });
        }

        const result = await Topic.updateMany(
            { _id: { $in: topicIds } },
            { trending: trending }
        );

        res.status(200).json({
            success: true,
            message: `Đã cập nhật ${result.modifiedCount} chủ đề`,
            data: {
                matched: result.matchedCount,
                modified: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật hàng loạt chủ đề:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật hàng loạt chủ đề',
            error: error.message
        });
    }
};
