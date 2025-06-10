// File: backend/models/ChatbotIntent.js
const mongoose = require('mongoose');

const chatbotIntentSchema = new mongoose.Schema({
    // Tên intent
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Display name cho Dialogflow
    displayName: {
        type: String,
        required: true,
        trim: true
    },

    // Mô tả intent
    description: {
        type: String,
        trim: true
    },

    // Danh mục intent
    category: {
        type: String,
        enum: [
            'greeting',      // Chào hỏi
            'faq',          // Câu hỏi thường gặp
            'support',      // Hỗ trợ
            'information',  // Thông tin
            'navigation',   // Điều hướng
            'feedback',     // Phản hồi
            'other'         // Khác
        ],
        default: 'other'
    },

    // Training phrases - câu huấn luyện
    trainingPhrases: [{
        text: {
            type: String,
            required: true,
            trim: true
        },
        // Các entities được đánh dấu trong câu
        entities: [{
            entityType: String,
            startIndex: Number,
            endIndex: Number,
            value: String
        }]
    }],

    // Responses - phản hồi của bot
    responses: [{
        // Loại response
        type: {
            type: String,
            enum: ['text', 'card', 'quick_replies', 'custom'],
            default: 'text'
        },

        // Nội dung text
        text: {
            type: String,
            trim: true
        },

        // Card response
        card: {
            title: String,
            subtitle: String,
            imageUri: String,
            buttons: [{
                text: String,
                postback: String
            }]
        },

        // Quick replies
        quickReplies: [{
            title: String,
            payload: String
        }],

        // Custom payload
        customPayload: mongoose.Schema.Types.Mixed,

        // Điều kiện hiển thị response
        condition: String,

        // Thứ tự ưu tiên
        priority: {
            type: Number,
            default: 0
        }
    }],

    // Parameters - tham số của intent
    parameters: [{
        name: {
            type: String,
            required: true
        },
        entityType: {
            type: String,
            required: true
        },
        required: {
            type: Boolean,
            default: false
        },
        prompts: [String], // Câu hỏi khi thiếu parameter
        defaultValue: String
    }],

    // Contexts
    inputContexts: [String],  // Context cần có để trigger intent
    outputContexts: [{        // Context được set sau khi intent được trigger
        name: String,
        lifespanCount: {
            type: Number,
            default: 5
        },
        parameters: mongoose.Schema.Types.Mixed
    }],

    // Events có thể trigger intent
    events: [String],

    // Webhook settings
    webhook: {
        enabled: {
            type: Boolean,
            default: false
        },
        url: String,
        headers: mongoose.Schema.Types.Mixed
    },

    // Trạng thái
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    },

    // Thống kê
    stats: {
        // Số lần được trigger
        triggerCount: {
            type: Number,
            default: 0
        },

        // Số lần được trigger thành công
        successCount: {
            type: Number,
            default: 0
        },

        // Lần cuối được trigger
        lastTriggered: Date,

        // Confidence score trung bình
        avgConfidence: {
            type: Number,
            default: 0
        }
    },

    // Dialogflow specific
    dialogflow: {
        // Intent ID trong Dialogflow
        intentId: String,

        // Project ID
        projectId: String,

        // Lần cuối sync với Dialogflow
        lastSynced: Date,

        // Trạng thái sync
        syncStatus: {
            type: String,
            enum: ['synced', 'pending', 'error'],
            default: 'pending'
        },

        // Lỗi sync (nếu có)
        syncError: String
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Tags để phân loại
    tags: [String]
}, {
    timestamps: true
});

// Indexes
chatbotIntentSchema.index({ name: 1 });
chatbotIntentSchema.index({ category: 1 });
chatbotIntentSchema.index({ status: 1 });
chatbotIntentSchema.index({ 'dialogflow.projectId': 1 });
chatbotIntentSchema.index({ 'stats.triggerCount': -1 });
chatbotIntentSchema.index({ createdAt: -1 });

// Text search index
chatbotIntentSchema.index({
    name: 'text',
    displayName: 'text',
    description: 'text',
    'trainingPhrases.text': 'text'
});

// Virtual fields
chatbotIntentSchema.virtual('successRate').get(function () {
    if (this.stats.triggerCount === 0) return 0;
    return (this.stats.successCount / this.stats.triggerCount * 100).toFixed(2);
});

// Instance methods
chatbotIntentSchema.methods.incrementTriggerCount = function (success = true, confidence = 0) {
    this.stats.triggerCount += 1;
    if (success) {
        this.stats.successCount += 1;
    }
    this.stats.lastTriggered = new Date();

    // Cập nhật confidence trung bình
    if (confidence > 0) {
        const totalConfidence = this.stats.avgConfidence * (this.stats.triggerCount - 1) + confidence;
        this.stats.avgConfidence = totalConfidence / this.stats.triggerCount;
    }

    return this.save();
};

chatbotIntentSchema.methods.addTrainingPhrase = function (text, entities = []) {
    this.trainingPhrases.push({ text, entities });
    this.dialogflow.syncStatus = 'pending';
    return this.save();
};

chatbotIntentSchema.methods.addResponse = function (response) {
    this.responses.push(response);
    this.dialogflow.syncStatus = 'pending';
    return this.save();
};

// Static methods
chatbotIntentSchema.statics.getPopularIntents = function (limit = 10) {
    return this.find({ status: 'active' })
        .sort({ 'stats.triggerCount': -1 })
        .limit(limit)
        .populate('createdBy', 'fullName email');
};

chatbotIntentSchema.statics.getIntentsByCategory = function () {
    return this.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                avgTriggerCount: { $avg: '$stats.triggerCount' },
                avgSuccessRate: {
                    $avg: {
                        $cond: [
                            { $gt: ['$stats.triggerCount', 0] },
                            { $divide: ['$stats.successCount', '$stats.triggerCount'] },
                            0
                        ]
                    }
                }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

chatbotIntentSchema.statics.getNeedsSyncIntents = function () {
    return this.find({
        'dialogflow.syncStatus': { $in: ['pending', 'error'] }
    });
};

// Middleware
chatbotIntentSchema.pre('save', function (next) {
    if (this.isModified('trainingPhrases') || this.isModified('responses')) {
        this.dialogflow.syncStatus = 'pending';
    }
    next();
});

module.exports = mongoose.model('ChatbotIntent', chatbotIntentSchema);
