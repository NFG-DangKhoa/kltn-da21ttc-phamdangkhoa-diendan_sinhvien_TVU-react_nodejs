const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const NotificationService = require('./notificationService');

class ChatService {
    constructor(io) {
        this.io = io;
        this.notificationService = new NotificationService(io);
        this.onlineUsers = new Map(); // Map để track user online: userId -> {socketId, lastSeen, heartbeat}
        this.typingUsers = new Map(); // Map để track user đang gõ
        this.userHeartbeats = new Map(); // Map để track user heartbeat

        // Khởi tạo heartbeat checker
        this.startHeartbeatChecker();
    }

    // Đăng ký user online
    userConnected(userId, socketId) {
        // Ensure userId is string for consistency
        const userIdStr = userId.toString();

        console.log(`🔗 ChatService: Connecting user ${userIdStr} with socket ${socketId}`);

        // Xóa connection cũ nếu có
        const oldUserData = this.onlineUsers.get(userIdStr);
        if (oldUserData && oldUserData.socketId !== socketId) {
            console.log(`🔄 User ${userIdStr} reconnecting, removing old socket ${oldUserData.socketId}`);
            // Disconnect old socket if it exists
            const oldSocket = this.io.sockets.sockets.get(oldUserData.socketId);
            if (oldSocket) {
                console.log(`🔄 Disconnecting old socket ${oldUserData.socketId}`);
                oldSocket.disconnect();
            }
        }

        // Lưu thông tin user với timestamp
        const userData = {
            socketId: socketId,
            lastSeen: new Date().toISOString(),
            heartbeat: Date.now()
        };

        this.onlineUsers.set(userIdStr, userData);
        this.userHeartbeats.set(userIdStr, Date.now());

        console.log(`👤 ChatService: User ${userIdStr} connected with socket ${socketId}`);
        console.log(`📊 ChatService: Total online users: ${this.onlineUsers.size}`);
        console.log(`📊 ChatService: Online users map:`, Array.from(this.onlineUsers.entries()));

        // Cập nhật last seen trong database
        this.updateUserLastSeen(userId);

        // Broadcast user online status với lastSeen
        this.io.emit('userOnline', {
            userId,
            lastSeen: userData.lastSeen,
            isOnline: true
        });
    }

    // Hủy đăng ký user offline
    userDisconnected(socketId) {
        console.log(`🔌 ChatService: Socket ${socketId} disconnecting`);

        // Tìm userId từ socketId
        let disconnectedUserId = null;
        for (const [userId, userData] of this.onlineUsers.entries()) {
            if (userData.socketId === socketId) {
                disconnectedUserId = userId;
                break;
            }
        }

        if (disconnectedUserId) {
            this.onlineUsers.delete(disconnectedUserId);
            this.userHeartbeats.delete(disconnectedUserId);
            console.log(`👤 ChatService: User ${disconnectedUserId} disconnected`);
            console.log(`📊 ChatService: Remaining online users: ${this.onlineUsers.size}`);

            // Cập nhật last seen trong database
            this.updateUserLastSeen(disconnectedUserId);

            // Broadcast user offline status
            this.io.emit('userOffline', {
                userId: disconnectedUserId,
                lastSeen: new Date().toISOString(),
                isOnline: false
            });

            // Xóa typing status nếu có
            this.stopTyping(disconnectedUserId);
        }
    }

    // Kiểm tra user có online không
    isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    }

    // Lấy danh sách user online
    getOnlineUsers() {
        return Array.from(this.onlineUsers.keys());
    }

    // Gửi tin nhắn
    async sendMessage(senderId, receiverId, content, messageType = 'text', attachments = []) {
        try {
            // Kiểm tra người gửi và nhận có tồn tại
            const sender = await User.findById(senderId);
            const receiver = await User.findById(receiverId);

            if (!sender || !receiver) {
                throw new Error('Người gửi hoặc người nhận không tồn tại');
            }

            // Tìm hoặc tạo cuộc trò chuyện
            const conversation = await Conversation.findOrCreateDirectConversation(senderId, receiverId);

            // Kiểm tra cài đặt chấp nhận tin nhắn của người nhận
            const receiverSettings = conversation.getMessageAcceptanceSettings(receiverId);
            let acceptanceStatus = 'auto_accepted';

            // Nếu người nhận yêu cầu chấp nhận tin nhắn
            if (receiverSettings.requireAcceptance) {
                // Kiểm tra xem có phải là cuộc trò chuyện mới không (chưa có tin nhắn nào được chấp nhận)
                const existingAcceptedMessages = await Message.countDocuments({
                    conversationId: conversation._id,
                    acceptanceStatus: { $in: ['accepted', 'auto_accepted'] }
                });

                if (existingAcceptedMessages === 0) {
                    // Cuộc trò chuyện mới, cần chấp nhận
                    acceptanceStatus = 'pending';
                } else if (receiverSettings.autoAcceptFromKnownUsers) {
                    // Đã có tin nhắn trước đó, tự động chấp nhận
                    acceptanceStatus = 'auto_accepted';
                } else {
                    // Vẫn cần chấp nhận mỗi tin nhắn
                    acceptanceStatus = 'pending';
                }
            }

            // Tạo tin nhắn mới
            const message = new Message({
                conversationId: conversation._id,
                senderId,
                receiverId,
                content,
                messageType,
                attachments,
                status: 'sent',
                acceptanceStatus
            });

            await message.save();

            // Populate thông tin người gửi và nhận
            await message.populate([
                { path: 'senderId', select: 'fullName username avatarUrl role' },
                { path: 'receiverId', select: 'fullName username avatarUrl role' }
            ]);

            // Nếu tin nhắn được chấp nhận, cập nhật cuộc trò chuyện
            if (acceptanceStatus === 'auto_accepted') {
                await conversation.updateLastMessage(message._id);
                // Đánh dấu cuộc trò chuyện đã đọc cho người gửi
                await conversation.markAsRead(senderId, message._id);
                // Gửi tin nhắn realtime
                this.sendRealtimeMessage(message);
            } else {
                // Tin nhắn đang chờ chấp nhận
                await conversation.addPendingMessage(message._id);
                // Gửi thông báo pending message
                this.sendPendingMessageNotification(message);
            }

            // Không tạo notification cho tin nhắn chat
            // Tin nhắn sẽ hiện trực tiếp trong khung chat qua Socket.IO
            // Chỉ tạo notification cho các sự kiện khác như comments, likes, etc.

            return message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    // Gửi tin nhắn realtime qua Socket.IO
    sendRealtimeMessage(message) {
        if (!this.io) {
            console.log('❌ Socket.IO instance not available');
            return;
        }

        const messageData = {
            id: message._id,
            _id: message._id, // Thêm cả hai để đảm bảo compatibility
            conversationId: message.conversationId,
            senderId: message.senderId._id,
            receiverId: message.receiverId._id,
            content: message.content,
            messageType: message.messageType,
            attachments: message.attachments,
            status: message.status,
            createdAt: message.createdAt,
            isRead: false,
            sender: message.senderId,
            receiver: message.receiverId
        };

        const senderIdStr = message.senderId._id.toString();
        const receiverIdStr = message.receiverId._id.toString();

        console.log(`\n💬 === SENDING REALTIME MESSAGE ===`);
        console.log(`   Message ID: ${message._id}`);
        console.log(`   From: ${message.senderId.fullName} (${senderIdStr})`);
        console.log(`   To: ${message.receiverId.fullName} (${receiverIdStr})`);
        console.log(`   Content: "${message.content}"`);
        console.log(`   Conversation: ${message.conversationId}`);

        // Debug online users
        console.log(`🎯 Current online users:`, Array.from(this.onlineUsers.entries()));

        // Gửi đến người gửi qua user room (để sync trên các device khác)
        const senderRoom = `user_${senderIdStr}`;
        console.log(`📤 Sending to SENDER room: ${senderRoom}`);
        this.io.to(senderRoom).emit('newMessage', messageData);
        console.log(`✅ Message sent to sender room successfully`);

        // Gửi đến người nhận qua user room
        const receiverRoom = `user_${receiverIdStr}`;
        console.log(`📤 Sending to RECEIVER room: ${receiverRoom}`);
        this.io.to(receiverRoom).emit('newMessage', messageData);
        console.log(`✅ Message sent to receiver room successfully`);

        // Kiểm tra receiver có online không để cập nhật status
        const receiverUserData = this.onlineUsers.get(receiverIdStr);
        if (receiverUserData) {
            console.log(`📱 Receiver is online, marking message as delivered`);
            // Đánh dấu tin nhắn đã được delivered
            message.status = 'delivered';
            message.save();
        } else {
            console.log(`📱 Receiver is offline, keeping status as sent`);
        }

        // Broadcast update để cập nhật UI conversation list
        console.log(`🔄 Broadcasting conversation update`);
        this.io.to(senderRoom).emit('conversationUpdate', {
            conversationId: message.conversationId,
            lastMessage: messageData,
            lastMessageAt: message.createdAt,
            senderId: message.senderId._id
        });
        this.io.to(receiverRoom).emit('conversationUpdate', {
            conversationId: message.conversationId,
            lastMessage: messageData,
            lastMessageAt: message.createdAt,
            senderId: message.senderId._id
        });

        console.log(`✅ === REALTIME MESSAGE PROCESSING COMPLETED ===\n`);
    }

    // Đánh dấu tin nhắn đã đọc
    async markMessageAsRead(messageId, userId) {
        try {
            const message = await Message.findById(messageId);
            if (!message) {
                throw new Error('Tin nhắn không tồn tại');
            }

            // Chỉ người nhận mới có thể đánh dấu đã đọc
            if (message.receiverId.toString() !== userId.toString()) {
                throw new Error('Không có quyền đánh dấu tin nhắn này');
            }

            // Cập nhật trạng thái tin nhắn
            await message.markAsRead();

            // Cập nhật trạng thái đọc trong cuộc trò chuyện
            const conversation = await Conversation.findById(message.conversationId);
            await conversation.markAsRead(userId, messageId);

            // Thông báo cho người gửi rằng tin nhắn đã được đọc
            const senderUserData = this.onlineUsers.get(message.senderId.toString());
            if (senderUserData) {
                const senderSocketId = typeof senderUserData === 'string' ? senderUserData : senderUserData.socketId;
                this.io.to(senderSocketId).emit('messageRead', {
                    messageId: messageId,
                    readBy: userId,
                    readAt: message.readAt
                });
            }

            return message;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }

    // Đánh dấu tất cả tin nhắn trong cuộc trò chuyện đã đọc
    async markConversationAsRead(conversationId, userId) {
        try {
            // Kiểm tra user có quyền truy cập cuộc trò chuyện không
            const conversation = await Conversation.findById(conversationId);
            if (!conversation || !conversation.participants.includes(userId)) {
                throw new Error('Không có quyền truy cập cuộc trò chuyện này');
            }

            // Tìm tin nhắn mới nhất trong cuộc trò chuyện
            const latestMessage = await Message.findOne({
                conversationId: conversationId,
                isDeleted: false
            }).sort({ createdAt: -1 });

            // Đánh dấu tất cả tin nhắn chưa đọc của user trong cuộc trò chuyện
            const result = await Message.updateMany(
                {
                    conversationId: conversationId,
                    receiverId: userId,
                    status: { $ne: 'read' },
                    isDeleted: false
                },
                {
                    $set: {
                        status: 'read',
                        readAt: new Date()
                    }
                }
            );

            // Cập nhật readStatus trong conversation với tin nhắn mới nhất
            if (latestMessage) {
                await conversation.markAsRead(userId, latestMessage._id);
                console.log(`✅ Updated readStatus for user ${userId} with latest message ${latestMessage._id}`);
            } else {
                // Nếu không có tin nhắn nào, vẫn cập nhật lastReadAt
                await conversation.markAsRead(userId);
                console.log(`✅ Updated readStatus for user ${userId} without specific message`);
            }

            // Thông báo cho người gửi rằng tin nhắn đã được đọc
            conversation.participants.forEach(participantId => {
                if (participantId.toString() !== userId.toString()) {
                    const userData = this.onlineUsers.get(participantId.toString());
                    if (userData) {
                        const socketId = typeof userData === 'string' ? userData : userData.socketId;
                        this.io.to(socketId).emit('conversationRead', {
                            conversationId: conversationId,
                            readBy: userId,
                            markedCount: result.modifiedCount
                        });
                    }
                }
            });

            return {
                markedCount: result.modifiedCount,
                conversationId: conversationId
            };
        } catch (error) {
            console.error('Error marking conversation as read:', error);
            throw error;
        }
    }

    // Lấy tin nhắn trong cuộc trò chuyện
    async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
        try {
            // Kiểm tra user có quyền truy cập cuộc trò chuyện không
            const conversation = await Conversation.findById(conversationId);
            if (!conversation || !conversation.participants.includes(userId)) {
                throw new Error('Không có quyền truy cập cuộc trò chuyện này');
            }

            const messages = await Message.getConversationMessages(conversationId, userId, page, limit);
            return messages.reverse(); // Đảo ngược để tin nhắn cũ nhất ở đầu
        } catch (error) {
            console.error('Error getting conversation messages:', error);
            throw error;
        }
    }

    // Lấy danh sách cuộc trò chuyện của user
    async getUserConversations(userId, page = 1, limit = 20) {
        try {
            const conversations = await Conversation.getUserConversations(userId, page, limit);

            // Thêm thông tin số tin nhắn chưa đọc cho mỗi cuộc trò chuyện
            const conversationsWithUnread = await Promise.all(
                conversations.map(async (conversation) => {
                    const unreadCount = await conversation.getUnreadCount(userId);
                    return {
                        ...conversation.toObject(),
                        unreadCount
                    };
                })
            );

            return conversationsWithUnread;
        } catch (error) {
            console.error('Error getting user conversations:', error);
            throw error;
        }
    }

    // Xử lý typing indicator
    startTyping(userId, conversationId) {
        const typingKey = `${conversationId}_${userId}`;

        // Lưu thông tin typing
        this.typingUsers.set(typingKey, {
            userId,
            conversationId,
            timestamp: Date.now()
        });

        // Gửi thông báo typing đến các thành viên khác trong cuộc trò chuyện
        this.broadcastToConversation(conversationId, userId, 'userTyping', {
            userId,
            conversationId,
            isTyping: true
        });

        // Tự động dừng typing sau 3 giây
        setTimeout(() => {
            this.stopTyping(userId, conversationId);
        }, 3000);
    }

    stopTyping(userId, conversationId = null) {
        if (conversationId) {
            const typingKey = `${conversationId}_${userId}`;
            this.typingUsers.delete(typingKey);

            // Gửi thông báo dừng typing
            this.broadcastToConversation(conversationId, userId, 'userTyping', {
                userId,
                conversationId,
                isTyping: false
            });
        } else {
            // Dừng tất cả typing của user này
            for (const [key, value] of this.typingUsers.entries()) {
                if (value.userId === userId) {
                    this.typingUsers.delete(key);
                    this.broadcastToConversation(value.conversationId, userId, 'userTyping', {
                        userId,
                        conversationId: value.conversationId,
                        isTyping: false
                    });
                }
            }
        }
    }

    // Broadcast tin nhắn đến tất cả thành viên trong cuộc trò chuyện (trừ người gửi)
    async broadcastToConversation(conversationId, excludeUserId, event, data) {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;

            conversation.participants.forEach(participantId => {
                if (participantId.toString() !== excludeUserId.toString()) {
                    const userData = this.onlineUsers.get(participantId.toString());
                    if (userData) {
                        const socketId = typeof userData === 'string' ? userData : userData.socketId;
                        this.io.to(socketId).emit(event, data);
                    }
                }
            });
        } catch (error) {
            console.error('Error broadcasting to conversation:', error);
        }
    }

    // Lấy số tin nhắn chưa đọc tổng của user
    async getTotalUnreadCount(userId) {
        try {
            return await Message.getUnreadCount(userId);
        } catch (error) {
            console.error('Error getting total unread count:', error);
            return 0;
        }
    }

    // Cập nhật thời gian hoạt động cuối của user
    async updateUserLastSeen(userId) {
        try {
            const User = require('../models/User');
            await User.findByIdAndUpdate(userId, {
                lastLogin: new Date()
            });
        } catch (error) {
            console.error('Error updating user last seen:', error);
        }
    }

    // Xử lý heartbeat từ client
    handleHeartbeat(userId) {
        if (this.onlineUsers.has(userId)) {
            const userData = this.onlineUsers.get(userId);
            userData.heartbeat = Date.now();
            userData.lastSeen = new Date().toISOString();
            this.onlineUsers.set(userId, userData);
            this.userHeartbeats.set(userId, Date.now());

            // Cập nhật database
            this.updateUserLastSeen(userId);
        }
    }

    // Khởi tạo heartbeat checker
    startHeartbeatChecker() {
        // Kiểm tra heartbeat mỗi 30 giây
        setInterval(() => {
            this.checkUserHeartbeats();
        }, 30000);
    }

    // Kiểm tra heartbeat của các user
    checkUserHeartbeats() {
        const now = Date.now();
        const timeout = 60000; // 60 giây timeout

        for (const [userId, userData] of this.onlineUsers.entries()) {
            if (now - userData.heartbeat > timeout) {
                console.log(`💔 User ${userId} heartbeat timeout, marking as offline`);

                // Đánh dấu user offline
                this.onlineUsers.delete(userId);
                this.userHeartbeats.delete(userId);

                // Cập nhật database
                this.updateUserLastSeen(userId);

                // Broadcast user offline
                this.io.emit('userOffline', {
                    userId,
                    lastSeen: userData.lastSeen,
                    isOnline: false
                });

                // Xóa typing status
                this.stopTyping(userId);
            }
        }
    }

    // Lấy thông tin user activity
    getUserActivity(userId) {
        const userData = this.onlineUsers.get(userId);
        if (userData) {
            return {
                isOnline: true,
                lastSeen: userData.lastSeen,
                socketId: userData.socketId
            };
        }
        return {
            isOnline: false,
            lastSeen: null,
            socketId: null
        };
    }

    // Lấy danh sách tất cả user online với thông tin activity
    getAllUserActivities() {
        const activities = {};
        for (const [userId, userData] of this.onlineUsers.entries()) {
            activities[userId] = {
                isOnline: true,
                lastSeen: userData.lastSeen,
                socketId: userData.socketId
            };
        }
        return activities;
    }

    // Gửi thông báo tin nhắn đang chờ chấp nhận
    sendPendingMessageNotification(message) {
        try {
            const receiverSocketId = this.getUserSocketId(message.receiverId.toString());
            if (receiverSocketId) {
                this.io.to(receiverSocketId).emit('pendingMessage', {
                    messageId: message._id,
                    senderId: message.senderId,
                    senderName: message.senderId.fullName || message.senderId.username,
                    content: message.content,
                    conversationId: message.conversationId,
                    timestamp: message.createdAt
                });
            }
        } catch (error) {
            console.error('Error sending pending message notification:', error);
        }
    }

    // Chấp nhận tin nhắn
    async acceptMessage(messageId, userId) {
        try {
            const message = await Message.findById(messageId);
            if (!message || message.receiverId.toString() !== userId) {
                throw new Error('Không có quyền chấp nhận tin nhắn này');
            }

            await message.acceptMessage(userId);

            // Xóa khỏi danh sách pending
            const conversation = await Conversation.findById(message.conversationId);
            if (conversation) {
                await conversation.removePendingMessage(messageId);
                // Cập nhật last message nếu đây là tin nhắn mới nhất
                await conversation.updateLastMessage(messageId);
            }

            // Populate thông tin để gửi realtime
            await message.populate([
                { path: 'senderId', select: 'fullName username avatarUrl role' },
                { path: 'receiverId', select: 'fullName username avatarUrl role' }
            ]);

            // Gửi tin nhắn realtime
            this.sendRealtimeMessage(message);

            // Thông báo cho người gửi rằng tin nhắn đã được chấp nhận
            const senderSocketId = this.getUserSocketId(message.senderId._id.toString());
            if (senderSocketId) {
                this.io.to(senderSocketId).emit('messageAccepted', {
                    messageId: message._id,
                    conversationId: message.conversationId
                });
            }

            return message;
        } catch (error) {
            console.error('Error accepting message:', error);
            throw error;
        }
    }

    // Từ chối tin nhắn
    async rejectMessage(messageId, userId) {
        try {
            const message = await Message.findById(messageId);
            if (!message || message.receiverId.toString() !== userId) {
                throw new Error('Không có quyền từ chối tin nhắn này');
            }

            await message.rejectMessage(userId);

            // Xóa khỏi danh sách pending
            const conversation = await Conversation.findById(message.conversationId);
            if (conversation) {
                await conversation.removePendingMessage(messageId);
            }

            // Thông báo cho người gửi rằng tin nhắn đã bị từ chối
            const senderSocketId = this.getUserSocketId(message.senderId.toString());
            if (senderSocketId) {
                this.io.to(senderSocketId).emit('messageRejected', {
                    messageId: message._id,
                    conversationId: message.conversationId
                });
            }

            return message;
        } catch (error) {
            console.error('Error rejecting message:', error);
            throw error;
        }
    }

    // Thu hồi tin nhắn (cho cả hai phía)
    async recallMessage(messageId, userId) {
        try {
            const message = await Message.findById(messageId);
            if (!message) {
                throw new Error('Tin nhắn không tồn tại');
            }

            // Chỉ người gửi mới có thể thu hồi tin nhắn
            if (message.senderId.toString() !== userId.toString()) {
                throw new Error('Không có quyền thu hồi tin nhắn này');
            }

            // Kiểm tra có thể thu hồi không (trong vòng 5 phút)
            if (!message.canRecall()) {
                throw new Error('Không thể thu hồi tin nhắn sau 5 phút');
            }

            await message.recallMessage();

            // Gửi thông báo realtime cho tất cả các thành viên trong cuộc trò chuyện
            const conversation = await Conversation.findById(message.conversationId);
            if (conversation) {
                conversation.participants.forEach(participantId => {
                    this.io.to(`user_${participantId.toString()}`).emit('messageRecalled', {
                        messageId: message._id,
                        conversationId: message.conversationId,
                        recalledBy: userId
                    });
                });
            }

            return message;
        } catch (error) {
            console.error('Error recalling message:', error);
            throw error;
        }
    }

    // Xóa tin nhắn (một phía)
    async deleteMessage(messageId, userId) {
        try {
            const message = await Message.findById(messageId);
            if (!message) {
                throw new Error('Tin nhắn không tồn tại');
            }

            // Chỉ người gửi hoặc người nhận mới có thể xóa tin nhắn cho chính họ
            if (message.senderId.toString() !== userId.toString() && message.receiverId.toString() !== userId.toString()) {
                throw new Error('Không có quyền xóa tin nhắn này');
            }

            await message.softDelete(userId);

            // Gửi thông báo realtime cho người dùng đã xóa tin nhắn
            this.io.to(`user_${userId.toString()}`).emit('messageDeleted', {
                messageId: message._id,
                conversationId: message.conversationId,
                deletedBy: userId
            });

            return message;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    // Xóa tất cả tin nhắn trong cuộc trò chuyện cho một user
    async deleteAllMessagesForUser(conversationId, userId) {
        try {
            const result = await Message.deleteAllForUserInConversation(conversationId, userId);

            // Gửi thông báo realtime
            const userSocketId = this.getUserSocketId(userId);
            if (userSocketId) {
                this.io.to(userSocketId).emit('allMessagesDeleted', {
                    conversationId,
                    deletedCount: result.modifiedCount
                });
            }

            return result;
        } catch (error) {
            console.error('Error deleting all messages for user:', error);
            throw error;
        }
    }
}

module.exports = ChatService;
