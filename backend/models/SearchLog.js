// File: backend/models/SearchLog.js
const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Cho phép tìm kiếm ẩn danh
    },

    // Từ khóa tìm kiếm
    query: {
        type: String,
        required: true,
        trim: true
    },

    // Từ khóa đã được chuẩn hóa (lowercase, loại bỏ dấu)
    normalizedQuery: {
        type: String,
        required: true
    },

    // Loại tìm kiếm
    searchType: {
        type: String,
        enum: ['posts', 'topics', 'users', 'global'],
        default: 'global'
    },

    // Kết quả tìm kiếm
    results: {
        // Số lượng kết quả
        count: {
            type: Number,
            default: 0
        },

        // Có kết quả hay không
        hasResults: {
            type: Boolean,
            default: false
        },

        // Thời gian xử lý (ms)
        processingTime: {
            type: Number,
            default: 0
        }
    },

    // Filters được áp dụng
    filters: {
        category: String,
        dateRange: String,
        sortBy: String,
        tags: [String]
    },

    // Thông tin session
    sessionInfo: {
        ipAddress: String,
        userAgent: String,
        deviceType: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'unknown'],
            default: 'unknown'
        },
        referrer: String
    },

    // Hành động sau tìm kiếm
    clickedResults: [{
        resultId: mongoose.Schema.Types.ObjectId,
        resultType: String, // 'post', 'topic', 'user'
        position: Number,   // Vị trí trong kết quả tìm kiếm
        clickedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Thời gian
    searchedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
searchLogSchema.index({ normalizedQuery: 1, searchedAt: -1 });
searchLogSchema.index({ userId: 1, searchedAt: -1 });
searchLogSchema.index({ searchType: 1, searchedAt: -1 });
searchLogSchema.index({ searchedAt: -1 });
searchLogSchema.index({ 'results.hasResults': 1 });

// Text index cho tìm kiếm
searchLogSchema.index({ query: 'text', normalizedQuery: 'text' });

// Static methods
searchLogSchema.statics.getPopularSearches = function (limit = 10, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        {
            $match: {
                searchedAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$normalizedQuery',
                count: { $sum: 1 },
                originalQuery: { $first: '$query' },
                avgResults: { $avg: '$results.count' },
                successRate: {
                    $avg: {
                        $cond: ['$results.hasResults', 1, 0]
                    }
                }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: limit
        }
    ]);
};

searchLogSchema.statics.getSearchTrends = function (days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        {
            $match: {
                searchedAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$searchedAt' },
                    month: { $month: '$searchedAt' },
                    day: { $dayOfMonth: '$searchedAt' }
                },
                searchCount: { $sum: 1 },
                uniqueQueries: { $addToSet: '$normalizedQuery' },
                avgProcessingTime: { $avg: '$results.processingTime' }
            }
        },
        {
            $addFields: {
                uniqueQueryCount: { $size: '$uniqueQueries' }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
    ]);
};

searchLogSchema.statics.getFailedSearches = function (limit = 10, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        {
            $match: {
                searchedAt: { $gte: startDate },
                'results.hasResults': false
            }
        },
        {
            $group: {
                _id: '$normalizedQuery',
                count: { $sum: 1 },
                originalQuery: { $first: '$query' }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: limit
        }
    ]);
};

searchLogSchema.statics.getSearchByDevice = function (days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        {
            $match: {
                searchedAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$sessionInfo.deviceType',
                count: { $sum: 1 },
                avgResults: { $avg: '$results.count' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

// Instance methods
searchLogSchema.methods.addClickedResult = function (resultId, resultType, position) {
    this.clickedResults.push({
        resultId,
        resultType,
        position,
        clickedAt: new Date()
    });
    return this.save();
};

// Middleware để tạo normalizedQuery
searchLogSchema.pre('save', function (next) {
    if (this.isModified('query')) {
        // Chuẩn hóa query: lowercase, loại bỏ dấu, trim
        this.normalizedQuery = this.query
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
            .trim();
    }
    next();
});

module.exports = mongoose.model('SearchLog', searchLogSchema);
