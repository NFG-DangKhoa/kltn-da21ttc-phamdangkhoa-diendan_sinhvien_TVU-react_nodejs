const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Người nhận thông báo
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Người gửi/thực hiện hành động
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Loại thông báo
    type: {
        type: String,
        enum: [
            // User notifications
            'post_created',
            'comment_added',
            'comment_reply',
            'post_liked',
            'comment_liked',
            'post_rated',
            'account_warning',
            'account_suspended',
            'account_banned',
            'account_activated',

            // Chat notifications
            'new_message',
            'message_read',

            // Admin notifications
            'new_user_registered',
            'new_post_created',
            'new_comment_added',
            'user_reported',
            'system_alert',

            // Broadcast notifications
            'announcement',
            'system_maintenance',
            'feature_update',
            'admin_edit_post'
        ],
        required: true
    },

    // Tiêu đề thông báo
    title: {
        type: String,
        required: true
    },

    // Nội dung thông báo
    message: {
        type: String,
        required: true
    },

    // Dữ liệu liên quan
    relatedData: {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        },
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        },
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation'
        },
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    },

    // Trạng thái đọc
    isRead: {
        type: Boolean,
        default: false
    },

    // Trạng thái hiển thị
    isVisible: {
        type: Boolean,
        default: true
    },

    // Độ ưu tiên
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },

    // Icon và màu sắc
    icon: {
        type: String,
        default: 'notifications'
    },

    color: {
        type: String,
        default: '#1976d2'
    },

    // URL để redirect
    actionUrl: String,

    // Thời gian hết hạn
    expiresAt: Date,

    // Metadata bổ sung
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diff = now - this.createdAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
