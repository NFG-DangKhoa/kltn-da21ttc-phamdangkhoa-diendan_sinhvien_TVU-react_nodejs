const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // ID cuộc trò chuyện
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },

    // Người gửi
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Người nhận
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Nội dung tin nhắn
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },

    // Loại tin nhắn
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },

    // File đính kèm (nếu có)
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String
    }],

    // Trạng thái tin nhắn
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },

    // Thời gian đọc tin nhắn
    readAt: {
        type: Date,
        default: null
    },

    // Tin nhắn đã bị xóa
    isDeleted: {
        type: Boolean,
        default: false
    },

    // Thời gian xóa
    deletedAt: {
        type: Date,
        default: null
    },

    // Tin nhắn được chỉnh sửa
    isEdited: {
        type: Boolean,
        default: false
    },

    // Thời gian chỉnh sửa cuối
    editedAt: {
        type: Date,
        default: null
    },

    // Nội dung gốc (trước khi chỉnh sửa)
    originalContent: {
        type: String,
        default: null
    },

    // Metadata bổ sung
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes để tối ưu query
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, status: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual để lấy thông tin người gửi và nhận
messageSchema.virtual('sender', {
    ref: 'User',
    localField: 'senderId',
    foreignField: '_id',
    justOne: true
});

messageSchema.virtual('receiver', {
    ref: 'User',
    localField: 'receiverId',
    foreignField: '_id',
    justOne: true
});

// Đảm bảo virtual fields được include
messageSchema.set('toObject', { virtuals: true });
messageSchema.set('toJSON', { virtuals: true });

// Method để đánh dấu tin nhắn đã đọc
messageSchema.methods.markAsRead = function() {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
};

// Method để xóa tin nhắn
messageSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

// Method để chỉnh sửa tin nhắn
messageSchema.methods.editContent = function(newContent) {
    this.originalContent = this.content;
    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
    return this.save();
};

// Static method để lấy tin nhắn chưa đọc
messageSchema.statics.getUnreadCount = function(userId) {
    return this.countDocuments({
        receiverId: userId,
        status: { $ne: 'read' },
        isDeleted: false
    });
};

// Static method để lấy tin nhắn trong cuộc trò chuyện
messageSchema.statics.getConversationMessages = function(conversationId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    return this.find({
        conversationId: conversationId,
        isDeleted: false
    })
    .populate('senderId', 'fullName username avatarUrl role')
    .populate('receiverId', 'fullName username avatarUrl role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Message', messageSchema);
