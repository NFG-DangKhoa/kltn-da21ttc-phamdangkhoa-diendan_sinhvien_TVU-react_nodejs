const User = require('../models/User');
const Post = require('../models/Post');
const Topic = require('../models/Topic');
const UserActivity = require('../models/UserActivity');
const SearchLog = require('../models/SearchLog');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Rating = require('../models/Rating');


const getPeriodDates = (period) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
        case 'today':
            break;
        case 'yesterday':
            startDate.setDate(startDate.getDate() - 1);
            endDate.setDate(endDate.getDate() - 1);
            break;
        case 'this_week':
            startDate.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1)); // Monday of current week
            break;
        case 'last_7_days':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'this_month':
            startDate.setDate(1);
            break;
        case 'last_30_days':
            startDate.setDate(startDate.getDate() - 30);
            break;
        case 'last_month':
            startDate.setMonth(startDate.getMonth() - 1, 1);
            endDate.setMonth(endDate.getMonth(), 0);
            break;
        case 'this_year':
            startDate.setMonth(0, 1);
            break;
        case 'last_year':
            startDate.setFullYear(startDate.getFullYear() - 1, 0, 1);
            endDate.setFullYear(endDate.getFullYear() - 1, 11, 31);
            break;
        default: // 'all_time' or invalid
            return { startDate: null, endDate: null };
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
};


/**
 * @route GET /api/admin/analytics/overview
 * @desc Lấy tổng quan thống kê với tùy chọn thời gian linh hoạt
 * @access Private (Admin Only)
 */
exports.getOverviewStats = async (req, res) => {
    try {
        const { period = 'all_time', customStartDate, customEndDate } = req.query;

        let startDate, endDate;

        if (period === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            ({ startDate, endDate } = getPeriodDates(period));
        }

        const dateFilter = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};

        // Thống kê tổng quan
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalTopics = await Topic.countDocuments();
        const totalComments = await Comment.countDocuments();
        const totalLikes = await Like.countDocuments();
        const totalRatings = await Rating.countDocuments();

        // Thống kê bài viết nổi bật
        const featuredPosts = await Post.countDocuments({ featured: true });

        // Thống kê chủ đề nổi bật
        const featuredTopics = await Topic.countDocuments({ trending: true });

        // Thống kê trong khoảng thời gian được chọn
        const periodUsers = await User.countDocuments(dateFilter);
        const periodPosts = await Post.countDocuments(dateFilter);
        const periodComments = await Comment.countDocuments(dateFilter);
        const periodRatings = await Rating.countDocuments(dateFilter);

        // Thống kê đánh giá chi tiết
        const ratingStats = await Rating.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalRatings: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        // Phân bố đánh giá theo sao
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (ratingStats[0]?.ratingDistribution) {
            ratingStats[0].ratingDistribution.forEach(rating => {
                ratingDistribution[rating]++;
            });
        }

        // Người dùng đã tham gia đánh giá
        const usersWhoRated = await Rating.distinct('userId', dateFilter);

        res.status(200).json({
            success: true,
            data: {
                period,
                startDate,
                endDate,
                totals: {
                    users: totalUsers,
                    posts: totalPosts,
                    topics: totalTopics,
                    comments: totalComments,
                    likes: totalLikes,
                    ratings: totalRatings,
                    featuredPosts,
                    featuredTopics
                },
                periodStats: {
                    users: periodUsers,
                    posts: periodPosts,
                    comments: periodComments,
                    ratings: periodRatings
                },
                ratingAnalytics: {
                    totalRatings: ratingStats[0]?.totalRatings || 0,
                    averageRating: ratingStats[0]?.averageRating || 0,
                    ratingDistribution,
                    usersWhoRated: usersWhoRated.length
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê tổng quan:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê tổng quan',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/users
 * @desc Lấy thống kê chi tiết về người dùng
 * @access Private (Admin Only)
 */
exports.getUserStats = async (req, res) => {
    try {
        const { period = 'all_time', customStartDate, customEndDate } = req.query;

        let startDate, endDate;

        if (period === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            ({ startDate, endDate } = getPeriodDates(period));
        }

        const dateFilter = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};

        // Thống kê tổng quan người dùng
        const totalUsers = await User.countDocuments();
        const periodUsers = await User.countDocuments(dateFilter);

        // Phân bố vai trò
        const roleDistribution = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Người dùng hoạt động nhiều nhất (dựa trên số bài viết)
        const topActiveUsers = await User.find()
            .sort({ postCount: -1 })
            .limit(10)
            .select('fullName email postCount');

        res.status(200).json({
            success: true,
            data: {
                period,
                startDate,
                endDate,
                totals: {
                    users: totalUsers,
                },
                periodStats: {
                    newUsers: periodUsers,
                },
                roleDistribution,
                topActiveUsers,
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê người dùng',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/community
 * @desc Lấy thống kê cộng đồng (bài viết, chủ đề, đánh giá)
 * @access Private (Admin Only)
 */
exports.getCommunityStats = async (req, res) => {
    try {
        const { period = 'all_time', customStartDate, customEndDate } = req.query;

        let startDate, endDate;

        if (period === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            ({ startDate, endDate } = getPeriodDates(period));
        }

        const dateFilter = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};

        // Post stats với thống kê chi tiết hơn
        const postStats = await Post.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalPosts: { $sum: 1 },
                    featuredPosts: { $sum: { $cond: ['$featured', 1, 0] } },
                    totalViews: { $sum: '$views' },
                    totalComments: { $sum: '$commentCount' },
                    averageViews: { $avg: '$views' },
                    averageComments: { $avg: '$commentCount' }
                }
            }
        ]);

        // Top bài viết nổi bật gần đây
        const recentFeaturedPosts = await Post.find({
            ...dateFilter,
            featured: true
        })
            .populate('authorId', 'fullName')
            .populate('topicId', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title views commentCount createdAt');

        // Topic stats
        const topicStats = await Topic.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalTopics: { $sum: 1 },
                    featuredTopics: { $sum: { $cond: ['$trending', 1, 0] } }
                }
            }
        ]);

        // Rating stats
        const ratingStats = await Rating.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalRatings: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        const ratingsWithUserDetails = await Rating.find(dateFilter)
            .populate('userId', 'fullName email')
            .populate('postId', 'title')
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: {
                period,
                startDate,
                endDate,
                posts: {
                    stats: postStats[0] || { totalPosts: 0, featuredPosts: 0, totalViews: 0, totalComments: 0, averageViews: 0, averageComments: 0 },
                    recentFeatured: recentFeaturedPosts
                },
                topics: topicStats[0] || { totalTopics: 0, featuredTopics: 0 },
                ratings: {
                    stats: ratingStats[0] || { totalRatings: 0, averageRating: 0 },
                    latestRatings: ratingsWithUserDetails
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê cộng đồng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê cộng đồng',
            error: error.message
        });
    }
};


/**
 * @route GET /api/admin/analytics/ratings
 * @desc Lấy thống kê chi tiết về đánh giá
 * @access Private (Admin Only)
 */
exports.getRatingStats = async (req, res) => {
    try {
        const { period = 'all_time', customStartDate, customEndDate } = req.query;

        let startDate, endDate;

        if (period === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            ({ startDate, endDate } = getPeriodDates(period));
        }

        const dateFilter = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};

        // Thống kê tổng quan đánh giá
        const ratingOverview = await Rating.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalRatings: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        // Phân bố đánh giá theo sao
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (ratingOverview[0]?.ratingDistribution) {
            ratingOverview[0].ratingDistribution.forEach(rating => {
                ratingDistribution[rating]++;
            });
        }

        // Top người dùng đánh giá nhiều nhất
        const topRaters = await Rating.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$userId',
                    ratingCount: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            },
            { $sort: { ratingCount: -1 } },
            { $limit: 10 }
        ]);

        // Populate thông tin user cho top raters
        const populatedTopRaters = await User.populate(topRaters, {
            path: '_id',
            select: 'fullName email avatarUrl'
        });

        // Bài viết được đánh giá cao nhất
        const topRatedPosts = await Rating.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$postId',
                    ratingCount: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            },
            { $match: { ratingCount: { $gte: 3 } } }, // Ít nhất 3 đánh giá
            { $sort: { averageRating: -1, ratingCount: -1 } },
            { $limit: 10 }
        ]);

        // Populate thông tin post cho top rated posts
        const populatedTopRatedPosts = await Post.populate(topRatedPosts, {
            path: '_id',
            select: 'title authorId topicId views createdAt',
            populate: [
                { path: 'authorId', select: 'fullName' },
                { path: 'topicId', select: 'name' }
            ]
        });

        res.status(200).json({
            success: true,
            data: {
                period,
                startDate,
                endDate,
                overview: ratingOverview[0] || { totalRatings: 0, averageRating: 0 },
                ratingDistribution,
                topRaters: populatedTopRaters,
                topRatedPosts: populatedTopRatedPosts
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê đánh giá:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê đánh giá',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/topics
 * @desc Lấy thống kê chi tiết về chủ đề
 * @access Private (Admin Only)
 */
exports.getTopicStats = async (req, res) => {
    try {
        const { period = 'all_time', customStartDate, customEndDate } = req.query;

        let startDate, endDate;

        if (period === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            ({ startDate, endDate } = getPeriodDates(period));
        }

        const dateFilter = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};

        // --- Thống kê tổng quan ---
        const totalTopics = await Topic.countDocuments();
        const totalActiveTopics = await Topic.countDocuments({ status: 'active' });
        const totalCategories = (await Topic.distinct('category')).length;

        // --- Thống kê theo khoảng thời gian ---
        const periodTopics = await Topic.countDocuments(dateFilter);

        // Chủ đề có bài viết mới trong khoảng thời gian
        const topicsWithNewPosts = await Post.distinct('topicId', dateFilter);

        // Top chủ đề theo số lượng bài viết (tổng thể)
        const topicsByPosts = await Topic.find({ status: 'active' })
            .sort({ postCount: -1 })
            .limit(10)
            .select('name postCount color');

        // Thống kê theo danh mục
        const categoryStats = await Topic.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$category',
                    topicCount: { $sum: 1 },
                }
            },
            { $sort: { topicCount: -1 } }
        ]);


        res.status(200).json({
            success: true,
            data: {
                period,
                startDate,
                endDate,
                totals: {
                    topics: totalTopics,
                    activeTopics: totalActiveTopics,
                    categories: totalCategories,
                },
                periodStats: {
                    topics: periodTopics,
                    topicsWithNewPosts: topicsWithNewPosts.length,
                },
                topicsByPosts, // Top 10 chủ đề nhiều bài viết nhất
                categoryStats, // Thống kê theo danh mục
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê chủ đề:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê chủ đề',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/popular-content
 * @desc Lấy thống kê nội dung phổ biến
 * @access Private (Admin Only)
 */
exports.getPopularContentStats = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const endDate = new Date();

        // Bài viết phổ biến
        const popularPosts = await UserActivity.getPopularContent(startDate, endDate, 'post');
        const populatedPosts = await Post.populate(popularPosts, {
            path: '_id',
            select: 'title authorId topicId createdAt views',
            populate: [
                { path: 'authorId', select: 'fullName' },
                { path: 'topicId', select: 'name' }
            ]
        });

        // Chủ đề phổ biến
        const popularTopics = await Topic.aggregate([
            {
                $match: {
                    status: 'active'
                }
            },
            {
                $sort: { postCount: -1, viewCount: -1 }
            },
            {
                $limit: 10
            },
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
                    recentPostCount: {
                        $size: {
                            $filter: {
                                input: '$posts',
                                cond: {
                                    $gte: ['$$this.createdAt', startDate]
                                }
                            }
                        }
                    }
                }
            }
        ]);

        // Thống kê theo category
        const categoryStats = await Topic.aggregate([
            {
                $group: {
                    _id: '$category',
                    topicCount: { $sum: 1 },
                    totalPosts: { $sum: '$postCount' },
                    totalViews: { $sum: '$viewCount' }
                }
            },
            {
                $sort: { totalPosts: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                popularPosts: populatedPosts,
                popularTopics,
                categoryStats
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê nội dung phổ biến:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê nội dung phổ biến',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/search-analytics
 * @desc Lấy thống kê tìm kiếm
 * @access Private (Admin Only)
 */
exports.getSearchAnalytics = async (req, res) => {
    try {
        const { days = 30 } = req.query;

        // Từ khóa tìm kiếm phổ biến
        const popularSearches = await SearchLog.getPopularSearches(20, parseInt(days));

        // Xu hướng tìm kiếm
        const searchTrends = await SearchLog.getSearchTrends(parseInt(days));

        // Tìm kiếm thất bại
        const failedSearches = await SearchLog.getFailedSearches(10, parseInt(days));

        // Thống kê theo device
        const deviceStats = await SearchLog.getSearchByDevice(parseInt(days));

        // Thống kê tổng quan tìm kiếm
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const totalSearches = await SearchLog.countDocuments({
            searchedAt: { $gte: startDate }
        });

        const uniqueQueries = await SearchLog.distinct('normalizedQuery', {
            searchedAt: { $gte: startDate }
        });

        const avgProcessingTime = await SearchLog.aggregate([
            {
                $match: {
                    searchedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: '$results.processingTime' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalSearches,
                    uniqueQueries: uniqueQueries.length,
                    avgProcessingTime: avgProcessingTime[0]?.avgTime || 0
                },
                popularSearches,
                searchTrends,
                failedSearches,
                deviceStats
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê tìm kiếm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê tìm kiếm',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/analytics/log-activity
 * @desc Ghi log hoạt động người dùng
 * @access Private
 */
exports.logUserActivity = async (req, res) => {
    try {
        const {
            activityType,
            details,
            sessionInfo
        } = req.body;

        const userId = req.user ? req.user._id : null;

        const activity = new UserActivity({
            userId,
            activityType,
            details: details || {},
            sessionInfo: sessionInfo || {},
            timestamp: new Date()
        });

        await activity.save();

        res.status(201).json({
            success: true,
            message: 'Đã ghi log hoạt động thành công'
        });
    } catch (error) {
        console.error('Lỗi khi ghi log hoạt động:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi ghi log hoạt động',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/analytics/log-search
 * @desc Ghi log tìm kiếm
 * @access Public
 */
exports.logSearch = async (req, res) => {
    try {
        const {
            query,
            searchType,
            results,
            filters,
            sessionInfo
        } = req.body;

        const userId = req.user ? req.user._id : null;

        const searchLog = new SearchLog({
            userId,
            query,
            searchType: searchType || 'global',
            results: results || { count: 0, hasResults: false },
            filters: filters || {},
            sessionInfo: sessionInfo || {},
            searchedAt: new Date()
        });

        await searchLog.save();

        res.status(201).json({
            success: true,
            message: 'Đã ghi log tìm kiếm thành công',
            searchId: searchLog._id
        });
    } catch (error) {
        console.error('Lỗi khi ghi log tìm kiếm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi ghi log tìm kiếm',
            error: error.message
        });
    }
};
