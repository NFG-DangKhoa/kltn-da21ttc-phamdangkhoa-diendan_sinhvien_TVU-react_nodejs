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

    // Tin nhắn đã bị thu hồi (cho cả hai phía)
    isRecalled: {
        type: Boolean,
        default: false
    },

    // Thời gian xóa
    deletedAt: {
        type: Date,
        default: null
    },

    // Người xóa tin nhắn (để hỗ trợ xóa cho từng người)
    deletedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        deletedAt: {
            type: Date,
            default: Date.now
        }
    }],

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

    // Trạng thái chấp nhận tin nhắn
    acceptanceStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'auto_accepted'],
        default: 'auto_accepted'
    },

    // Thời gian chấp nhận/từ chối
    acceptedAt: {
        type: Date,
        default: null
    },

    // Người chấp nhận/từ chối
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
messageSchema.methods.markAsRead = function () {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
};

// Method để xóa tin nhắn
messageSchema.methods.softDelete = function (userId) {
    if (userId) {
        // Xóa tin nhắn cho một người dùng cụ thể
        const existingIndex = this.deletedBy.findIndex(
            item => item.userId.toString() === userId.toString()
        );
        if (existingIndex === -1) {
            this.deletedBy.push({
                userId: userId,
                deletedAt: new Date()
            });
        }
    } else {
        // Xóa tin nhắn cho cả hai phía (nếu không truyền userId)
        this.isDeleted = true;
        this.deletedAt = new Date();
    }
    return this.save();
};

// Method để thu hồi tin nhắn (cho cả hai phía)
messageSchema.methods.recallMessage = function () {
    this.isRecalled = true;
    this.deletedAt = new Date(); // Dùng deletedAt để lưu thời gian thu hồi
    // Đánh dấu là đã xóa cho tất cả các bên liên quan (sender và receiver)
    if (!this.deletedBy.some(item => item.userId.toString() === this.senderId.toString())) {
        this.deletedBy.push({ userId: this.senderId, deletedAt: new Date() });
    }
    if (!this.deletedBy.some(item => item.userId.toString() === this.receiverId.toString())) {
        this.deletedBy.push({ userId: this.receiverId, deletedAt: new Date() });
    }
    return this.save();
};

// Method để xóa tin nhắn cho một người dùng cụ thể (thu hồi)
messageSchema.methods.deleteForUser = function (userId) {
    const existingIndex = this.deletedBy.findIndex(
        item => item.userId.toString() === userId.toString()
    );

    if (existingIndex === -1) {
        this.deletedBy.push({
            userId: userId,
            deletedAt: new Date()
        });
    }

    return this.save();
};

// Method để kiểm tra tin nhắn có bị xóa cho user không
messageSchema.methods.isDeletedForUser = function (userId) {
    return this.deletedBy.some(
        item => item.userId.toString() === userId.toString()
    ) || this.isRecalled; // Nếu tin nhắn bị thu hồi, coi như đã xóa cho mọi người
};

// Method để chỉnh sửa tin nhắn
messageSchema.methods.editContent = function (newContent) {
    this.originalContent = this.content;
    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
    return this.save();
};

// Method để chấp nhận tin nhắn
messageSchema.methods.acceptMessage = function (acceptedBy) {
    this.acceptanceStatus = 'accepted';
    this.acceptedAt = new Date();
    this.acceptedBy = acceptedBy;
    return this.save();
};

// Method để từ chối tin nhắn
messageSchema.methods.rejectMessage = function (rejectedBy) {
    this.acceptanceStatus = 'rejected';
    this.acceptedAt = new Date();
    this.acceptedBy = rejectedBy;
    return this.save();
};

// Method để kiểm tra tin nhắn có thể thu hồi không (trong vòng 5 phút)
messageSchema.methods.canRecall = function () {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.createdAt > fiveMinutesAgo;
};

// Static method để lấy tin nhắn chưa đọc
messageSchema.statics.getUnreadCount = function (userId) {
    return this.countDocuments({
        receiverId: userId,
        status: { $ne: 'read' },
        isDeleted: false,
        isRecalled: false, // Không tính tin nhắn đã thu hồi vào unread count
        'deletedBy.userId': { $ne: userId } // Không tính tin nhắn đã xóa cho user vào unread count
    });
};

// Static method để lấy tin nhắn trong cuộc trò chuyện
messageSchema.statics.getConversationMessages = function (conversationId, userId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    return this.find({
        conversationId: conversationId,
        // Tin nhắn không bị xóa hoàn toàn (hard delete)
        isDeleted: false,
        // Đảm bảo tin nhắn không bị xóa cho người dùng hiện tại (soft delete)
        'deletedBy.userId': { $ne: userId },
        $or: [
            { acceptanceStatus: 'accepted' },
            { acceptanceStatus: 'auto_accepted' },
            { senderId: userId } // Luôn hiển thị tin nhắn của chính mình
        ]
    })
        .populate('senderId', 'fullName username avatarUrl role')
        .populate('receiverId', 'fullName username avatarUrl role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method để lấy tin nhắn đang chờ chấp nhận
messageSchema.statics.getPendingMessages = function (userId) {
    return this.find({
        receiverId: userId,
        acceptanceStatus: 'pending',
        isDeleted: false
    })
        .populate('senderId', 'fullName username avatarUrl role')
        .populate('conversationId')
        .sort({ createdAt: -1 });
};

// Static method để xóa tất cả tin nhắn trong cuộc trò chuyện cho một user
messageSchema.statics.deleteAllForUserInConversation = function (conversationId, userId) {
    return this.updateMany(
        {
            conversationId: conversationId,
            'deletedBy.userId': { $ne: userId }
        },
        {
            $push: {
                deletedBy: {
                    userId: userId,
                    deletedAt: new Date()
                }
            }
        }
    );
};

module.exports = mongoose.model('Message', messageSchema);
