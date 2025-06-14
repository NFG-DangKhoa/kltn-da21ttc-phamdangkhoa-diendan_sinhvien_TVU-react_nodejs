// CÁC IMPORT HIỆN CÓ CỦA BẠN
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const userRoutes = require('./routes/userRoutes');
const adminPostRoutes = require('./routes/adminPostRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');
const adminTopicRoutes = require('./routes/adminTopicRoutes');
const adminChatbotRoutes = require('./routes/adminChatbotRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const adminCommentRoutes = require('./routes/adminCommentRoutes');
const homeRoutes = require('./routes/homeRoutes');
const adminFeaturedRoutes = require('./routes/adminFeaturedRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Import Chat Service
const ChatService = require('./services/chatService');
const notificationRoutes = require('./routes/notificationRoutes');
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
const adminDataRoutes = require('./routes/adminDataRoutes');

// Import notification service
const NotificationService = require('./services/notificationService');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Khởi tạo Socket.IO
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Khởi tạo Notification Service
const notificationService = new NotificationService(io);

// Khởi tạo Chat Service
const chatService = new ChatService(io);

// Make services available globally
global.notificationService = notificationService;
global.chatService = chatService;

// CORS middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

// Serve static files from public/upload directory
app.use('/upload', express.static('public/upload'));
console.log('📁 Static files served from /upload -> public/upload');

// Middleware để inject services vào req (PHẢI ĐẶT TRƯỚC ROUTES)
app.use((req, res, next) => {
    req.io = io;
    req.notificationService = notificationService;
    req.chatService = chatService;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/posts', postRoutes(io));
app.use('/api/comments', commentRoutes(io));
app.use('/api/likes', likeRoutes);
app.use('/api/ratings', ratingRoutes(io));
app.use('/api/users', userRoutes);
app.use('/api/admin/posts', adminPostRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/topics', adminTopicRoutes);
app.use('/api/admin/chatbot', adminChatbotRoutes);
app.use('/api', chatbotRoutes);
app.use('/api/admin/comments', adminCommentRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/admin/featured', adminFeaturedRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/messages', messageRoutes(io));
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/data', adminDataRoutes);

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join user to their personal notification room
    socket.on('joinUserRoom', (userId) => {
        console.log(`🏠 Backend: Received joinUserRoom for user: ${userId}`);
        console.log(`🏠 Backend: Socket ID: ${socket.id}`);
        console.log(`🏠 Backend: User ID type: ${typeof userId}`);

        // Kiểm tra userId hợp lệ
        if (!userId || userId === null || userId === undefined) {
            console.log(`❌ Backend: Invalid userId received: ${userId}`);
            socket.emit('error', {
                message: 'Invalid user ID',
                code: 'INVALID_USER_ID'
            });
            return;
        }

        const userIdString = userId.toString();
        socket.join(`user_${userIdString}`);
        console.log(`🏠 Backend: Socket ${socket.id} joined user room: user_${userIdString}`);

        // Đăng ký user online cho chat
        chatService.userConnected(userIdString, socket.id);

        // Store userId in socket for cleanup
        socket.userId = userIdString;

        console.log(`👤 Backend: User ${userIdString} is now online with socket ${socket.id}`);
        console.log(`📊 Backend: Total online users: ${chatService.onlineUsers.size}`);
        console.log(`📊 Backend: Online users list: ${Array.from(chatService.onlineUsers.entries()).map(([id, data]) => `${id}:${data.socketId}`).join(', ')}`);

        // Gửi test event để kiểm tra connection
        socket.emit('test', {
            message: 'Connection successful',
            userId: userIdString,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });

        console.log(`✅ Backend: Test event sent to user ${userIdString}`);
    });

    // Join post room for real-time comments
    socket.on('joinPostRoom', (postId) => {
        socket.join(postId);
        console.log(`Socket ${socket.id} joined room for post: ${postId}`);
    });

    socket.on('leavePostRoom', (postId) => {
        socket.leave(postId);
        console.log(`Socket ${socket.id} left room for post: ${postId}`);
    });

    // Handle notification acknowledgment
    socket.on('notificationReceived', (notificationId) => {
        console.log(`Notification ${notificationId} received by ${socket.id}`);
    });

    // === CHAT EVENTS ===

    // Xử lý gửi tin nhắn
    socket.on('sendMessage', async (data) => {
        console.log('📨 Backend: Received sendMessage event:', data);
        console.log('📨 Backend: Socket ID:', socket.id);
        console.log('📨 Backend: User ID from socket:', socket.userId);
        console.log('📨 Backend: Current online users:', Array.from(chatService.onlineUsers.entries()));

        // Kiểm tra xem socket này có được đăng ký không
        if (!socket.userId) {
            console.log('❌ Backend: Socket not registered with userId, trying to register...');
            if (data.senderId) {
                socket.userId = data.senderId;
                chatService.userConnected(data.senderId, socket.id);
                console.log('✅ Backend: Socket registered with userId:', data.senderId);
            } else {
                console.log('❌ Backend: Cannot register socket - no senderId in data');
                socket.emit('messageSent', {
                    success: false,
                    error: 'Socket not registered',
                    tempId: data.tempId
                });
                return;
            }
        }

        try {
            const { senderId, receiverId, content, messageType = 'text', attachments = [], tempId } = data;

            // Validate data
            if (!senderId || !receiverId || !content) {
                throw new Error('Missing required fields: senderId, receiverId, content');
            }

            console.log('📨 Backend: Calling chatService.sendMessage');
            console.log(`📨 Backend: From ${senderId} to ${receiverId}: "${content}"`);

            // Check if both users are online
            const senderOnline = chatService.onlineUsers.has(senderId.toString());
            const receiverOnline = chatService.onlineUsers.has(receiverId.toString());
            console.log(`📨 Backend: Sender online: ${senderOnline}, Receiver online: ${receiverOnline}`);

            const message = await chatService.sendMessage(
                senderId,
                receiverId,
                content,
                messageType,
                attachments
            );

            console.log('✅ Backend: Message sent successfully:', message._id);
            console.log('✅ Backend: Message will be sent via realtime in chatService.sendRealtimeMessage');

            // Gửi confirmation về cho người gửi với tempId để replace
            socket.emit('messageSent', {
                success: true,
                message: message,
                tempId: tempId
            });
        } catch (error) {
            console.error('❌ Error sending message via socket:', error);
            socket.emit('messageSent', {
                success: false,
                error: error.message,
                tempId: data.tempId
            });
        }
    });

    // Xử lý đánh dấu tin nhắn đã đọc
    socket.on('markMessageRead', async (data) => {
        try {
            const { messageId, userId } = data;
            await chatService.markMessageAsRead(messageId, userId);
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    });

    // Xử lý xóa tin nhắn
    socket.on('deleteMessage', async (data) => {
        try {
            const { messageId, userId } = data;
            console.log(`🗑️ Backend: Delete message request - MessageID: ${messageId}, UserID: ${userId}`);

            // Verify user has permission to delete this message
            const message = await Message.findById(messageId);
            if (!message) {
                console.log('❌ Message not found');
                return;
            }

            if (message.senderId.toString() !== userId) {
                console.log('❌ User does not have permission to delete this message');
                return;
            }

            // Soft delete the message
            await message.softDelete();
            console.log('✅ Message soft deleted successfully');

            // Emit to both sender and receiver
            const senderUserData = chatService.onlineUsers.get(message.senderId.toString());
            const receiverUserData = chatService.onlineUsers.get(message.receiverId.toString());

            const deleteData = { messageId };

            if (senderUserData) {
                const senderSocketId = typeof senderUserData === 'string' ? senderUserData : senderUserData.socketId;
                io.to(senderSocketId).emit('messageDeleted', deleteData);
                console.log('📤 Delete notification sent to sender');
            }

            if (receiverUserData) {
                const receiverSocketId = typeof receiverUserData === 'string' ? receiverUserData : receiverUserData.socketId;
                io.to(receiverSocketId).emit('messageDeleted', deleteData);
                console.log('📤 Delete notification sent to receiver');
            }

        } catch (error) {
            console.error('❌ Error deleting message via socket:', error);
        }
    });

    // Xử lý typing indicators
    socket.on('startTyping', (data) => {
        const { userId, conversationId } = data;
        chatService.startTyping(userId, conversationId);
    });

    socket.on('stopTyping', (data) => {
        const { userId, conversationId } = data;
        chatService.stopTyping(userId, conversationId);
    });

    // Xử lý heartbeat từ client
    socket.on('heartbeat', (data) => {
        const { userId } = data;
        if (userId && socket.userId === userId) {
            chatService.handleHeartbeat(userId);
            socket.emit('heartbeatAck', { timestamp: Date.now() });
        }
    });

    // Lấy thông tin user activities
    socket.on('getUserActivities', () => {
        const activities = chatService.getAllUserActivities();
        socket.emit('userActivities', activities);
    });

    // Lấy thông tin activity của một user cụ thể
    socket.on('getUserActivity', (data) => {
        const { userId } = data;
        const activity = chatService.getUserActivity(userId);
        socket.emit('userActivity', { userId, ...activity });
    });

    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);

        if (socket.userId) {
            console.log(`🔌 User ${socket.userId} disconnected`);
        }

        // Hủy đăng ký user offline
        chatService.userDisconnected(socket.id);

        console.log(`📊 Remaining online users: ${chatService.onlineUsers.size}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));