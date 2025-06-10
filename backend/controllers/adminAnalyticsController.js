// File: backend/controllers/adminAnalyticsController.js
const User = require('../models/User');
const Post = require('../models/Post');
const Topic = require('../models/Topic');
const UserActivity = require('../models/UserActivity');
const SearchLog = require('../models/SearchLog');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const mongoose = require('mongoose');

/**
 * @route GET /api/admin/analytics/overview
 * @desc Lấy tổng quan thống kê
 * @access Private (Admin Only)
 */
exports.getOverviewStats = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const endDate = new Date();

        // Thống kê tổng quan
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalTopics = await Topic.countDocuments();
        const totalComments = await Comment.countDocuments();
        const totalLikes = await Like.countDocuments();

        // Thống kê trong khoảng thời gian
        const newUsers = await User.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const newPosts = await Post.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const newComments = await Comment.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Người dùng hoạt động
        const activeUsers = await UserActivity.distinct('userId', {
            timestamp: { $gte: startDate, $lte: endDate }
        });

        // Tỷ lệ tăng trưởng
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - parseInt(days));

        const prevNewUsers = await User.countDocuments({
            createdAt: { $gte: prevStartDate, $lt: startDate }
        });

        const prevNewPosts = await Post.countDocuments({
            createdAt: { $gte: prevStartDate, $lt: startDate }
        });

        const userGrowthRate = prevNewUsers > 0 ?
            ((newUsers - prevNewUsers) / prevNewUsers * 100).toFixed(2) : 0;

        const postGrowthRate = prevNewPosts > 0 ?
            ((newPosts - prevNewPosts) / prevNewPosts * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                totals: {
                    users: totalUsers,
                    posts: totalPosts,
                    topics: totalTopics,
                    comments: totalComments,
                    likes: totalLikes
                },
                period: {
                    days: parseInt(days),
                    newUsers,
                    newPosts,
                    newComments,
                    activeUsers: activeUsers.length
                },
                growth: {
                    userGrowthRate: parseFloat(userGrowthRate),
                    postGrowthRate: parseFloat(postGrowthRate)
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
 * @route GET /api/admin/analytics/user-activity
 * @desc Lấy thống kê hoạt động người dùng
 * @access Private (Admin Only)
 */
exports.getUserActivityStats = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const endDate = new Date();

        // Hoạt động theo loại
        const activityStats = await UserActivity.getActivityStats(startDate, endDate);

        // Hoạt động theo giờ
        const hourlyActivity = await UserActivity.getUserActivityByHour(startDate, endDate);

        // Hoạt động theo ngày
        const dailyActivity = await UserActivity.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$timestamp' },
                        month: { $month: '$timestamp' },
                        day: { $dayOfMonth: '$timestamp' }
                    },
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' }
                }
            },
            {
                $addFields: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    uniqueUserCount: { $size: '$uniqueUsers' }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Người dùng hoạt động nhất
        const topActiveUsers = await UserActivity.getActiveUsers(startDate, endDate);

        // Populate thông tin user
        const populatedTopUsers = await User.populate(topActiveUsers.slice(0, 10), {
            path: '_id',
            select: 'fullName email avatarUrl'
        });

        res.status(200).json({
            success: true,
            data: {
                activityStats,
                hourlyActivity,
                dailyActivity,
                topActiveUsers: populatedTopUsers
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê hoạt động người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê hoạt động người dùng',
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
 * @route GET /api/admin/analytics/growth-trends
 * @desc Lấy xu hướng tăng trưởng
 * @access Private (Admin Only)
 */
exports.getGrowthTrends = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Tăng trưởng người dùng theo ngày
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Tăng trưởng bài viết theo ngày
        const postGrowth = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Tăng trưởng comments theo ngày
        const commentGrowth = await Comment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                userGrowth,
                postGrowth,
                commentGrowth
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy xu hướng tăng trưởng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy xu hướng tăng trưởng',
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
