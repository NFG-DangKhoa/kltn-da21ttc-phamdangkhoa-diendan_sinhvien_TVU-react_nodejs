// File: backend/models/UserActivity.js
const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Loại hoạt động
    activityType: {
        type: String,
        enum: [
            'login',           // Đăng nhập
            'logout',          // Đăng xuất
            'view_post',       // Xem bài viết
            'create_post',     // Tạo bài viết
            'edit_post',       // Sửa bài viết
            'delete_post',     // Xóa bài viết
            'comment',         // Bình luận
            'like',            // Thích
            'search',          // Tìm kiếm
            'view_topic',      // Xem chủ đề
            'register',        // Đăng ký
            'profile_update',  // Cập nhật profile
            'page_view'        // Xem trang
        ],
        required: true
    },

    // Thông tin chi tiết hoạt động
    details: {
        // ID của đối tượng liên quan (postId, topicId, etc.)
        targetId: {
            type: mongoose.Schema.Types.ObjectId
        },

        // Loại đối tượng
        targetType: {
            type: String,
            enum: ['post', 'topic', 'user', 'comment']
        },

        // Dữ liệu bổ sung (JSON)
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },

    // Thông tin session và device
    sessionInfo: {
        // IP address
        ipAddress: String,

        // User agent
        userAgent: String,

        // Device type
        deviceType: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'unknown'],
            default: 'unknown'
        },

        // Browser
        browser: String,

        // Operating system
        os: String,

        // Referrer URL
        referrer: String,

        // Current page URL
        currentUrl: String
    },

    // Thời gian
    timestamp: {
        type: Date,
        default: Date.now
    },

    // Thời gian session (cho login/logout)
    sessionDuration: {
        type: Number, // milliseconds
        default: 0
    }
}, {
    timestamps: true
});

// Indexes để tối ưu hóa query
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ activityType: 1, timestamp: -1 });
userActivitySchema.index({ timestamp: -1 });
userActivitySchema.index({ 'details.targetId': 1, 'details.targetType': 1 });
userActivitySchema.index({ 'sessionInfo.ipAddress': 1 });

// Static methods để thống kê
userActivitySchema.statics.getActivityStats = function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: '$activityType',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

userActivitySchema.statics.getUserActivityByHour = function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: { $hour: '$timestamp' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id': 1 }
        }
    ]);
};

userActivitySchema.statics.getActiveUsers = function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: '$userId',
                activityCount: { $sum: 1 },
                lastActivity: { $max: '$timestamp' }
            }
        },
        {
            $sort: { activityCount: -1 }
        }
    ]);
};

userActivitySchema.statics.getPopularContent = function (startDate, endDate, targetType) {
    return this.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                },
                'details.targetType': targetType,
                activityType: { $in: ['view_post', 'view_topic', 'like', 'comment'] }
            }
        },
        {
            $group: {
                _id: '$details.targetId',
                viewCount: {
                    $sum: {
                        $cond: [{ $eq: ['$activityType', 'view_post'] }, 1, 0]
                    }
                },
                likeCount: {
                    $sum: {
                        $cond: [{ $eq: ['$activityType', 'like'] }, 1, 0]
                    }
                },
                commentCount: {
                    $sum: {
                        $cond: [{ $eq: ['$activityType', 'comment'] }, 1, 0]
                    }
                },
                totalEngagement: { $sum: 1 }
            }
        },
        {
            $sort: { totalEngagement: -1 }
        },
        {
            $limit: 10
        }
    ]);
};

module.exports = mongoose.model('UserActivity', userActivitySchema);
