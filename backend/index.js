// File: backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const postRoutes = require('./routes/postRoutes');
const authRoutess = require('./routes/auth.routes');
const imageRoutes = require('./routes/imageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');


dotenv.config();
connectDB();

const app = express();

// Phục vụ thư mục public/upload tại đường dẫn /uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/upload')));

// CORS phải được đặt trước các route
app.use(cors({
    origin: 'http://localhost:3000', // frontend
    credentials: true,
}));

app.use(express.json());

// Các route API
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutess); // Gọi đúng endpoint: /api/auth/google-login

app.use('/api/images', imageRoutes); // Route upload ảnh
app.use('/upload', express.static(path.join(__dirname, 'public', 'upload')));
app.use('/api/uploads', uploadRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
