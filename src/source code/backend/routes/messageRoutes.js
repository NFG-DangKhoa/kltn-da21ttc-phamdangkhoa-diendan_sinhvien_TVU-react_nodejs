const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const ChatService = require('../services/chatService');
const { protect } = require('../middlewares/authMiddleware');

// Middleware để khởi tạo ChatService
const initChatService = (req, res, next) => {
    if (!req.chatService) {
        req.chatService = new ChatService(req.io);
    }
    next();
};

// GET /api/messages/conversations - Lấy danh sách cuộc trò chuyện
router.get('/conversations', protect, initChatService, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user._id;

        const conversations = await req.chatService.getUserConversations(
            userId,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            data: conversations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: conversations.length
            }
        });
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách cuộc trò chuyện',
            error: error.message
        });
    }
});

// GET /api/messages/conversations/:conversationId - Lấy tin nhắn trong cuộc trò chuyện
router.get('/conversations/:conversationId', protect, initChatService, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const userId = req.user._id;

        const messages = await req.chatService.getConversationMessages(
            conversationId,
            userId,
            parseInt(page),
            parseInt(limit)
        );

        res.json({
            success: true,
            data: messages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: messages.length
            }
        });
    } catch (error) {
        console.error('Error getting conversation messages:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy tin nhắn',
            error: error.message
        });
    }
});

// POST /api/messages/send - Gửi tin nhắn
router.post('/send', protect, initChatService, async (req, res) => {
    try {
        const { receiverId, content, messageType = 'text', attachments = [] } = req.body;
        const senderId = req.user._id;

        // Validate input
        if (!receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin người nhận hoặc nội dung tin nhắn'
            });
        }

        // Kiểm tra không thể gửi tin nhắn cho chính mình
        if (senderId === receiverId) {
            return res.status(400).json({
                success: false,
                message: 'Không thể gửi tin nhắn cho chính mình'
            });
        }

        const message = await req.chatService.sendMessage(
            senderId,
            receiverId,
            content,
            messageType,
            attachments
        );

        res.json({
            success: true,
            data: message,
            message: 'Tin nhắn đã được gửi thành công'
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi gửi tin nhắn',
            error: error.message
        });
    }
});

// PUT /api/messages/:messageId/read - Đánh dấu tin nhắn đã đọc
router.put('/:messageId/read', protect, initChatService, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await req.chatService.markMessageAsRead(messageId, userId);

        res.json({
            success: true,
            data: message,
            message: 'Đã đánh dấu tin nhắn đã đọc'
        });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đánh dấu tin nhắn đã đọc',
            error: error.message
        });
    }
});

// GET /api/messages/unread-count - Lấy số tin nhắn chưa đọc
router.get('/unread-count', protect, initChatService, async (req, res) => {
    try {
        const userId = req.user._id;
        const unreadCount = await req.chatService.getTotalUnreadCount(userId);

        res.json({
            success: true,
            data: { unreadCount }
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy số tin nhắn chưa đọc',
            error: error.message
        });
    }
});

// POST /api/messages/conversation/create - Tạo cuộc trò chuyện mới
router.post('/conversation/create', protect, async (req, res) => {
    try {
        const { participantId } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!participantId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin người tham gia'
            });
        }

        // Kiểm tra không thể tạo cuộc trò chuyện với chính mình
        if (userId === participantId) {
            return res.status(400).json({
                success: false,
                message: 'Không thể tạo cuộc trò chuyện với chính mình'
            });
        }

        // Kiểm tra người tham gia có tồn tại không
        const participant = await User.findById(participantId);
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        // Tìm conversation hiện có trước
        let conversation = await Conversation.findOne({
            type: 'direct',
            participants: { $all: [userId, participantId] }
        }).populate('participants', 'fullName username avatarUrl role status');

        // Nếu chưa có, tạo mới
        if (!conversation) {
            // Tạo conversation mới với retry logic
            let retryCount = 0;
            const maxRetries = 3;

            while (retryCount < maxRetries && !conversation) {
                try {
                    conversation = new Conversation({
                        type: 'direct',
                        participants: [userId, participantId]
                    });
                    await conversation.save();
                    await conversation.populate('participants', 'fullName username avatarUrl role status');
                    break; // Success, exit loop
                } catch (error) {
                    retryCount++;
                    console.log(`Attempt ${retryCount} failed:`, error.message);

                    // Nếu lỗi duplicate key, thử tìm lại conversation
                    if (error.code === 11000) {
                        conversation = await Conversation.findOne({
                            type: 'direct',
                            participants: { $all: [userId, participantId] }
                        }).populate('participants', 'fullName username avatarUrl role status');

                        if (conversation) {
                            console.log('Found existing conversation after duplicate key error');
                            break; // Found existing, exit loop
                        }
                    }

                    // Nếu đã retry max lần và vẫn fail
                    if (retryCount >= maxRetries) {
                        throw new Error(`Không thể tạo cuộc trò chuyện sau ${maxRetries} lần thử`);
                    }

                    // Wait a bit before retry
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }

        res.json({
            success: true,
            data: conversation,
            message: 'Cuộc trò chuyện đã được tạo thành công'
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo cuộc trò chuyện',
            error: error.message
        });
    }
});

// GET /api/messages/users/search - Tìm kiếm người dùng để chat
router.get('/users/search', protect, async (req, res) => {
    try {
        const { q = '', page = 1, limit = 20 } = req.query;
        const userId = req.user._id;

        const searchQuery = {
            _id: { $ne: userId }, // Loại trừ chính mình
            status: 'active', // Chỉ user active
            $or: [
                { fullName: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        };

        const users = await User.find(searchQuery)
            .select('fullName username email avatarUrl role status')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ fullName: 1 });

        const total = await User.countDocuments(searchQuery);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm người dùng',
            error: error.message
        });
    }
});

// DELETE /api/messages/:messageId/delete-for-me - Xóa tin nhắn cho riêng mình
router.delete('/:messageId/delete-for-me', protect, initChatService, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        await req.chatService.deleteMessage(messageId, userId);

        res.json({
            success: true,
            message: 'Tin nhắn đã được xóa cho bạn'
        });
    } catch (error) {
        console.error('Error deleting message for user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE /api/messages/:messageId/delete-for-all - Xóa tin nhắn cho tất cả (chỉ người gửi)
router.delete('/:messageId/delete-for-all', protect, initChatService, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        // Gọi hàm thu hồi tin nhắn (sẽ kiểm tra quyền và thời gian)
        await req.chatService.recallMessage(messageId, userId);

        res.json({
            success: true,
            message: 'Tin nhắn đã được xóa cho tất cả mọi người'
        });
    } catch (error) {
        console.error('Error deleting message for all:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE /api/messages/conversations/:conversationId/delete-all-for-me - Xóa tất cả tin nhắn trong cuộc trò chuyện cho riêng mình
router.delete('/conversations/:conversationId/delete-all-for-me', protect, initChatService, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        await req.chatService.deleteAllMessagesForUser(conversationId, userId);

        res.json({
            success: true,
            message: 'Đã xóa tất cả tin nhắn trong cuộc trò chuyện cho bạn'
        });
    } catch (error) {
        console.error('Error deleting all messages for user in conversation:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = (io) => {
    // Attach io to request object
    router.use((req, res, next) => {
        req.io = io;
        next();
    });

    return router;
};
