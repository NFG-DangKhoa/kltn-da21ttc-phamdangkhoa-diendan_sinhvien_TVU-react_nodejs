// File: backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const postRoutes = require('./routes/postRoutes');
const authRoutess = require('./routes/auth.routes'); // Đảm bảo bạn gọi đúng file này
const imageRoutes = require('./routes/imageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes'); // Import likeRoutes
const likeController = require('./controllers/likeController'); // Import likeController
const path = require('path');

// --- THÊM CÁC DÒNG NÀY ĐỂ TÍCH HỢP SOCKET.IO ---
const http = require('http'); // Import module http
const { Server } = require('socket.io'); // Import Server từ socket.io
// --- HẾT PHẦN THÊM ---

dotenv.config();
connectDB();

const app = express();
// --- THÊM DÒNG NÀY ĐỂ TẠO HTTP SERVER TỪ APP EXPRESS ---
const server = http.createServer(app);

// --- KHỞI TẠO SOCKET.IO SERVER VÀ CẤU HÌNH CORS ---
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Địa chỉ frontend của bạn
        methods: ["GET", "POST"] // Cho phép các phương thức này
    }
});

// Thiết lập thể hiện io trong likeController
likeController.setIo(io);

// Bạn có thể xử lý các kết nối Socket.IO tại đây
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });

    // Thêm các sự kiện Socket.IO khác mà bạn muốn lắng nghe hoặc xử lý tại server
    // Ví dụ: socket.on('joinRoom', (roomId) => { ... });
});
// --- HẾT PHẦN SOCKET.IO INIT ---


// Phục vụ thư mục public/upload tại đường dẫn /uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/upload')));

// CORS phải được đặt trước các route
app.use(cors({
    origin: 'http://localhost:3000', // frontend
    credentials: true,
}));

app.use(express.json());

// --- TRUYỀN ĐỐI TƯỢNG `io` VÀO CÁC ROUTE CẦN SỬ DỤNG REAL-TIME ---
// Bạn sẽ cần điều chỉnh các file route để chấp nhận `io` nếu chúng cần nó trực tiếp.
// Tuy nhiên, với likeController, chúng ta đã sử dụng hàm setIo.
// Đối với postRoutes và commentRoutes, nếu chúng cũng có hàm setIo tương tự,
// bạn cũng sẽ gọi chúng như likeController.setIo(io).
// Nếu postRoutes và commentRoutes được thiết kế để nhận `io` như một hàm,
// thì cách bạn đang làm là đúng cho chúng.

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/posts', postRoutes(io)); // Truyền 'io' vào postRoutes (giả định postRoutes là một hàm nhận io)
app.use('/api/auth', authRoutess); // Gọi đúng endpoint: /api/auth/google-login

app.use('/api/images', imageRoutes); // Route upload ảnh
app.use('/upload', express.static(path.join(__dirname, 'public', 'upload')));
app.use('/api/uploads', uploadRoutes);
app.use('/api/comments', commentRoutes(io)); // Truyền 'io' vào commentRoutes (giả định commentRoutes là một hàm nhận io)
app.use('/api/likes', likeRoutes); // KHÔNG TRUYỀN 'io' VÀO likeRoutes, vì likeController đã được thiết lập

const PORT = process.env.PORT || 5000;
// --- THAY THẾ app.listen BẰNG server.listen ---
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
