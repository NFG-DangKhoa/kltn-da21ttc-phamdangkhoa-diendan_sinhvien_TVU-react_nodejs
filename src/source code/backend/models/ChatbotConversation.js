// File: backend/models/ChatbotConversation.js
const mongoose = require('mongoose');

const chatbotConversationSchema = new mongoose.Schema({
    // Session ID từ Dialogflow
    sessionId: {
        type: String,
        required: true,
        index: true
    },

    // User ID (nếu đã đăng nhập)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Thông tin session
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

        // Platform (web, mobile app, etc.)
        platform: {
            type: String,
            default: 'web'
        },

        // Language
        language: {
            type: String,
            default: 'vi'
        }
    },

    // Các tin nhắn trong cuộc hội thoại
    messages: [{
        // Loại tin nhắn
        type: {
            type: String,
            enum: ['user', 'bot'],
            required: true
        },

        // Nội dung tin nhắn
        text: {
            type: String,
            required: true
        },

        // Intent được detect (cho tin nhắn user)
        detectedIntent: {
            name: String,
            displayName: String,
            confidence: Number,
            parameters: mongoose.Schema.Types.Mixed
        },

        // Response từ bot
        botResponse: {
            // Loại response
            responseType: {
                type: String,
                enum: ['text', 'card', 'quick_replies', 'custom']
            },

            // Fulfillment text
            fulfillmentText: String,

            // Rich responses
            richResponses: mongoose.Schema.Types.Mixed,

            // Webhook response
            webhookResponse: mongoose.Schema.Types.Mixed
        },

        // Context tại thời điểm này
        contexts: [mongoose.Schema.Types.Mixed],

        // Thời gian
        timestamp: {
            type: Date,
            default: Date.now
        },

        // Response time (ms)
        responseTime: Number,

        // Có lỗi không
        hasError: {
            type: Boolean,
            default: false
        },

        // Chi tiết lỗi
        error: {
            code: String,
            message: String,
            details: mongoose.Schema.Types.Mixed
        }
    }],

    // Trạng thái cuộc hội thoại
    status: {
        type: String,
        enum: ['active', 'ended', 'abandoned'],
        default: 'active'
    },

    // Thời gian bắt đầu
    startedAt: {
        type: Date,
        default: Date.now
    },

    // Thời gian kết thúc
    endedAt: Date,

    // Thời lượng cuộc hội thoại (seconds)
    duration: Number,

    // Đánh giá của người dùng
    feedback: {
        // Rating (1-5)
        rating: {
            type: Number,
            min: 1,
            max: 5
        },

        // Comment
        comment: String,

        // Thời gian đánh giá
        feedbackAt: Date,

        // Các vấn đề được báo cáo
        issues: [{
            type: String,
            enum: [
                'wrong_intent',
                'poor_response',
                'missing_info',
                'technical_error',
                'other'
            ]
        }]
    },

    // Thống kê cuộc hội thoại
    stats: {
        // Tổng số tin nhắn
        totalMessages: {
            type: Number,
            default: 0
        },

        // Số tin nhắn của user
        userMessages: {
            type: Number,
            default: 0
        },

        // Số tin nhắn của bot
        botMessages: {
            type: Number,
            default: 0
        },

        // Số intent được detect thành công
        successfulIntents: {
            type: Number,
            default: 0
        },

        // Số intent thất bại
        failedIntents: {
            type: Number,
            default: 0
        },

        // Confidence score trung bình
        avgConfidence: {
            type: Number,
            default: 0
        },

        // Response time trung bình
        avgResponseTime: {
            type: Number,
            default: 0
        }
    },

    // Tags để phân loại
    tags: [String],

    // Ghi chú của admin
    adminNotes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Có cần review không
    needsReview: {
        type: Boolean,
        default: false
    },

    // Đã được review chưa
    reviewed: {
        type: Boolean,
        default: false
    },

    // Người review
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Thời gian review
    reviewedAt: Date
}, {
    timestamps: true
});

// Indexes
chatbotConversationSchema.index({ sessionId: 1 });
chatbotConversationSchema.index({ userId: 1 });
chatbotConversationSchema.index({ status: 1 });
chatbotConversationSchema.index({ startedAt: -1 });
chatbotConversationSchema.index({ 'feedback.rating': 1 });
chatbotConversationSchema.index({ needsReview: 1 });
chatbotConversationSchema.index({ reviewed: 1 });

// Compound indexes
chatbotConversationSchema.index({ status: 1, startedAt: -1 });
chatbotConversationSchema.index({ userId: 1, startedAt: -1 });

// Virtual fields
chatbotConversationSchema.virtual('successRate').get(function () {
    if (this.stats.totalMessages === 0) return 0;
    return (this.stats.successfulIntents / this.stats.userMessages * 100).toFixed(2);
});

// Instance methods
chatbotConversationSchema.methods.addMessage = function (messageData) {
    this.messages.push(messageData);
    this.updateStats();
    return this.save();
};

chatbotConversationSchema.methods.updateStats = function () {
    this.stats.totalMessages = this.messages.length;
    this.stats.userMessages = this.messages.filter(m => m.type === 'user').length;
    this.stats.botMessages = this.messages.filter(m => m.type === 'bot').length;

    const userMessages = this.messages.filter(m => m.type === 'user');
    this.stats.successfulIntents = userMessages.filter(m =>
        m.detectedIntent && m.detectedIntent.confidence > 0.5
    ).length;
    this.stats.failedIntents = userMessages.length - this.stats.successfulIntents;

    // Tính confidence trung bình
    const confidences = userMessages
        .filter(m => m.detectedIntent && m.detectedIntent.confidence)
        .map(m => m.detectedIntent.confidence);

    if (confidences.length > 0) {
        this.stats.avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    }

    // Tính response time trung bình
    const responseTimes = this.messages
        .filter(m => m.responseTime)
        .map(m => m.responseTime);

    if (responseTimes.length > 0) {
        this.stats.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }
};

chatbotConversationSchema.methods.endConversation = function () {
    this.status = 'ended';
    this.endedAt = new Date();
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
    return this.save();
};

chatbotConversationSchema.methods.addFeedback = function (rating, comment, issues = []) {
    this.feedback = {
        rating,
        comment,
        issues,
        feedbackAt: new Date()
    };

    // Đánh dấu cần review nếu rating thấp
    if (rating <= 2) {
        this.needsReview = true;
    }

    return this.save();
};

// Static methods
chatbotConversationSchema.statics.getConversationStats = function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                startedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                totalConversations: { $sum: 1 },
                avgDuration: { $avg: '$duration' },
                avgMessages: { $avg: '$stats.totalMessages' },
                avgConfidence: { $avg: '$stats.avgConfidence' },
                avgResponseTime: { $avg: '$stats.avgResponseTime' },
                totalFeedback: {
                    $sum: {
                        $cond: [{ $ne: ['$feedback.rating', null] }, 1, 0]
                    }
                },
                avgRating: { $avg: '$feedback.rating' }
            }
        }
    ]);
};

chatbotConversationSchema.statics.getPopularIntents = function (startDate, endDate, limit = 10) {
    return this.aggregate([
        {
            $match: {
                startedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        { $unwind: '$messages' },
        {
            $match: {
                'messages.type': 'user',
                'messages.detectedIntent.name': { $exists: true }
            }
        },
        {
            $group: {
                _id: '$messages.detectedIntent.name',
                displayName: { $first: '$messages.detectedIntent.displayName' },
                count: { $sum: 1 },
                avgConfidence: { $avg: '$messages.detectedIntent.confidence' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]);
};

chatbotConversationSchema.statics.getFailedIntents = function (startDate, endDate, limit = 10) {
    return this.aggregate([
        {
            $match: {
                startedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        { $unwind: '$messages' },
        {
            $match: {
                'messages.type': 'user',
                $or: [
                    { 'messages.detectedIntent.confidence': { $lt: 0.5 } },
                    { 'messages.detectedIntent': { $exists: false } }
                ]
            }
        },
        {
            $group: {
                _id: '$messages.text',
                count: { $sum: 1 },
                avgConfidence: { $avg: '$messages.detectedIntent.confidence' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]);
};

module.exports = mongoose.model('ChatbotConversation', chatbotConversationSchema);
