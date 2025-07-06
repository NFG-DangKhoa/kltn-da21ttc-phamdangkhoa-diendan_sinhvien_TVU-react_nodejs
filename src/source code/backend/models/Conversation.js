const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Danh sách người tham gia (2 người cho chat 1-1)
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    // Loại cuộc trò chuyện
    type: {
        type: String,
        enum: ['direct', 'group'], // Hiện tại chỉ support direct (1-1)
        default: 'direct'
    },

    // Tin nhắn cuối cùng
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },

    // Thời gian tin nhắn cuối
    lastMessageAt: {
        type: Date,
        default: Date.now
    },

    // Trạng thái cuộc trò chuyện
    status: {
        type: String,
        enum: ['active', 'archived', 'blocked'],
        default: 'active'
    },

    // Thông tin về việc đã đọc tin nhắn cuối của từng người
    readStatus: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastReadMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        lastReadAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Cài đặt thông báo cho từng người
    notificationSettings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        muted: {
            type: Boolean,
            default: false
        },
        mutedUntil: {
            type: Date,
            default: null
        }
    }],

    // Cài đặt chấp nhận tin nhắn cho từng người
    messageAcceptanceSettings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        requireAcceptance: {
            type: Boolean,
            default: false
        },
        autoAcceptFromKnownUsers: {
            type: Boolean,
            default: true
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Danh sách tin nhắn đang chờ chấp nhận
    pendingMessages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],

    // Thống kê
    messageCount: {
        type: Number,
        default: 0
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
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ 'participants': 1, 'lastMessageAt': -1 });

// Đảm bảo mỗi cặp người chỉ có 1 cuộc trò chuyện direct
// Index đã được xóa bằng script, giờ có thể tạo conversation bình thường

// Virtual để lấy thông tin participants
conversationSchema.virtual('participantDetails', {
    ref: 'User',
    localField: 'participants',
    foreignField: '_id'
});

// Virtual để lấy thông tin tin nhắn cuối
conversationSchema.virtual('lastMessageDetails', {
    ref: 'Message',
    localField: 'lastMessage',
    foreignField: '_id',
    justOne: true
});

// Đảm bảo virtual fields được include
conversationSchema.set('toObject', { virtuals: true });
conversationSchema.set('toJSON', { virtuals: true });

// Method để cập nhật tin nhắn cuối
conversationSchema.methods.updateLastMessage = function (messageId) {
    this.lastMessage = messageId;
    this.lastMessageAt = new Date();
    this.messageCount += 1;
    return this.save();
};

// Method để đánh dấu đã đọc
conversationSchema.methods.markAsRead = function (userId, messageId = null) {
    const readStatusIndex = this.readStatus.findIndex(
        status => status.userId.toString() === userId.toString()
    );

    if (readStatusIndex >= 0) {
        if (messageId) {
            this.readStatus[readStatusIndex].lastReadMessageId = messageId;
        }
        this.readStatus[readStatusIndex].lastReadAt = new Date();
    } else {
        this.readStatus.push({
            userId: userId,
            lastReadMessageId: messageId,
            lastReadAt: new Date()
        });
    }

    return this.save();
};

// Method để lấy số tin nhắn chưa đọc cho user
conversationSchema.methods.getUnreadCount = async function (userId) {
    const Message = mongoose.model('Message');

    // Tìm tin nhắn cuối cùng mà user đã đọc trong cuộc trò chuyện này
    const userReadStatus = this.readStatus.find(
        status => status.userId.toString() === userId.toString()
    );

    let query = {
        conversationId: this._id,
        receiverId: userId, // Tin nhắn gửi đến user này
        status: { $ne: 'read' }, // Chưa được đánh dấu là đã đọc
        isDeleted: false, // Không phải tin nhắn đã bị xóa hoàn toàn
        isRecalled: false, // Không phải tin nhắn đã bị thu hồi
        'deletedBy.userId': { $ne: userId } // Không phải tin nhắn đã bị xóa một phía cho user này
    };

    if (userReadStatus && userReadStatus.lastReadMessageId) {
        // Nếu có lastReadMessageId, chỉ đếm những tin nhắn sau đó
        const lastReadMessage = await Message.findById(userReadStatus.lastReadMessageId);
        if (lastReadMessage) {
            query.createdAt = { $gt: lastReadMessage.createdAt };
        }
    }

    return await Message.countDocuments(query);
};

// Method để reset read status khi có vấn đề đồng bộ
conversationSchema.methods.resetReadStatus = async function (userId) {
    const Message = mongoose.model('Message');

    // Tìm tin nhắn mới nhất mà user đã đọc (status = 'read')
    const latestReadMessage = await Message.findOne({
        conversationId: this._id,
        receiverId: userId,
        status: 'read',
        isDeleted: false
    }).sort({ createdAt: -1 });

    if (latestReadMessage) {
        await this.markAsRead(userId, latestReadMessage._id);
    } else {
        // Nếu không có tin nhắn nào đã đọc, xóa read status
        this.readStatus = this.readStatus.filter(
            status => status.userId.toString() !== userId.toString()
        );
        await this.save();
    }
};

// Static method để tìm hoặc tạo cuộc trò chuyện giữa 2 người
conversationSchema.statics.findOrCreateDirectConversation = async function (user1Id, user2Id) {
    // Tìm cuộc trò chuyện hiện có
    let conversation = await this.findOne({
        type: 'direct',
        participants: { $all: [user1Id, user2Id] }
    }).populate('participants', 'fullName username avatarUrl role status');

    // Nếu chưa có, tạo mới
    if (!conversation) {
        // Sort participants để đảm bảo consistency cho unique index
        const sortedParticipants = [user1Id, user2Id].sort();

        try {
            conversation = new this({
                type: 'direct',
                participants: sortedParticipants
            });
            await conversation.save();
            await conversation.populate('participants', 'fullName username avatarUrl role status');
        } catch (error) {
            // Nếu lỗi duplicate key, có thể conversation đã được tạo bởi request khác
            if (error.code === 11000) {
                conversation = await this.findOne({
                    type: 'direct',
                    participants: { $all: [user1Id, user2Id] }
                }).populate('participants', 'fullName username avatarUrl role status');

                if (!conversation) {
                    throw error; // Nếu vẫn không tìm thấy thì throw lỗi gốc
                }
            } else {
                throw error;
            }
        }
    }

    return conversation;
};

// Static method để lấy danh sách cuộc trò chuyện của user
conversationSchema.statics.getUserConversations = function (userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    return this.find({
        participants: userId,
        status: 'active'
    })
        .populate('participants', 'fullName username avatarUrl role status')
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Method để cập nhật cài đặt chấp nhận tin nhắn
conversationSchema.methods.updateMessageAcceptanceSettings = function (userId, settings) {
    const settingsIndex = this.messageAcceptanceSettings.findIndex(
        setting => setting.userId.toString() === userId.toString()
    );

    if (settingsIndex >= 0) {
        this.messageAcceptanceSettings[settingsIndex] = {
            ...this.messageAcceptanceSettings[settingsIndex],
            ...settings,
            userId: userId,
            updatedAt: new Date()
        };
    } else {
        this.messageAcceptanceSettings.push({
            userId: userId,
            ...settings,
            updatedAt: new Date()
        });
    }

    return this.save();
};

// Method để lấy cài đặt chấp nhận tin nhắn của user
conversationSchema.methods.getMessageAcceptanceSettings = function (userId) {
    const settings = this.messageAcceptanceSettings.find(
        setting => setting.userId.toString() === userId.toString()
    );

    return settings || {
        requireAcceptance: false,
        autoAcceptFromKnownUsers: true
    };
};

// Method để thêm tin nhắn vào danh sách chờ chấp nhận
conversationSchema.methods.addPendingMessage = function (messageId) {
    if (!this.pendingMessages.includes(messageId)) {
        this.pendingMessages.push(messageId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Method để xóa tin nhắn khỏi danh sách chờ chấp nhận
conversationSchema.methods.removePendingMessage = function (messageId) {
    this.pendingMessages = this.pendingMessages.filter(
        id => id.toString() !== messageId.toString()
    );
    return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
