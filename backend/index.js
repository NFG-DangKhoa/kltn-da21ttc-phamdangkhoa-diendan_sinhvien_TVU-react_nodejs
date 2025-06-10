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

// CORS middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

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

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinPostRoom', (postId) => {
        socket.join(postId);
        console.log(`Socket ${socket.id} joined room for post: ${postId}`);
    });

    socket.on('leavePostRoom', (postId) => {
        socket.leave(postId);
        console.log(`Socket ${socket.id} left room for post: ${postId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));