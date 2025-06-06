// CÁC IMPORT HIỆN CÓ CỦA BẠN
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
const ratingRoutes = require('./routes/ratingRoutes'); // Vẫn import như bình thường
const path = require('path');

// --- THÊM CÁC DÒNG NÀY ĐỂ TÍCH HỢP SOCKET.IO ---
const http = require('http'); // Import module http
const { Server } = require('socket.io'); // Import Server từ socket.io
// --- HẾT PHẦN THÊM ---

// --- THÊM DÒNG NÀY ĐỂ TÍCH HỢP DIALOGFLOW ---
const dialogflow = require('@google-cloud/dialogflow'); // Import thư viện Dialogflow
// --- HẾT PHẦN THÊM ---

// --- IMPORT MỚI CHO ADMIN CONTROLLER VÀ ROUTES ---
const adminPostController = require('./controllers/adminPostController'); // Import controller Admin
const adminPostRoutes = require('./routes/adminPostRoutes'); // Import routes Admin
// --- HẾT PHẦN IMPORT MỚI ---

dotenv.config(); // Đảm bảo bạn gọi dotenv.config() đầu tiên để load các biến môi trường
connectDB();

const app = express();
// --- THÊM DÒNG NÀY ĐỂ TẠO HTTP SERVER TỪ APP EXPRESS ---
const server = http.createServer(app);

// --- KHỞI TẠO SOCKET.IO SERVER VÀ CẤU HÌNH CORS ---
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Địa chỉ frontend của bạn
        methods: ["GET", "POST", "PUT", "DELETE"] // Cho phép các phương thức này
    }
});

// Thiết lập thể hiện io trong các controller cần sử dụng Socket.IO
// postController.setIo(io); // Nếu postController cũng cần io, hãy bỏ comment dòng này
// likeController.setIo(io); // Đã có, giữ nguyên
// commentController.setIo(io); // Giả định commentController cũng nhận io
// ratingController.setIo(io); // Giả định ratingController cũng nhận io
// THIẾT LẬP IO CHO ADMIN POST CONTROLLER MỚI
adminPostController.setIo(io);
// --- HẾT PHẦN THÊM ---

// Bạn có thể xử lý các kết nối Socket.IO tại đây
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Lắng nghe sự kiện để client tham gia một room cho bài viết cụ thể
    socket.on('joinPostRoom', (postId) => {
        socket.join(postId);
        console.log(`Socket ${socket.id} joined room for post: ${postId}`);
    });

    // Lắng nghe sự kiện để client rời khỏi một room cho bài viết cụ thể
    socket.on('leavePostRoom', (postId) => {
        socket.leave(postId);
        console.log(`Socket ${socket.id} left room for post: ${postId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });

    // Thêm các sự kiện Socket.IO khác mà bạn muốn lắng nghe hoặc xử lý tại server
});
// --- HẾT PHẦN SOCKET.IO INIT ---




// CORS phải được đặt trước các route
app.use(cors({
    origin: 'http://localhost:5173', // frontend
    credentials: true,
}));

// --- ĐÂY LÀ ĐIỂM CHÚNG TA THAY ĐỔI: TĂNG GIỚI HẠN KÍCH THƯỚC REQUEST BODY ---
app.use(express.json({ limit: '50mb' }));
// --- KẾT THÚC ĐIỂM THAY ĐỔI ---


// --- KHỞI TẠO DIALOGFLOW SESSION CLIENT ---
// Đảm bảo bạn đã thêm DIALOGFLOW_PROJECT_ID vào file .env của mình
// Ví dụ: DIALOGFLOW_PROJECT_ID=your-gcp-project-id
// Và GOOGLE_APPLICATION_CREDENTIALS=./path/to/your-service-account-key.json
const projectId = process.env.DIALOGFLOW_PROJECT_ID;

// Thiết lập GOOGLE_APPLICATION_CREDENTIALS nếu chưa được thiết lập
// Ví dụ: process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'path/to/your-service-account-key.json');
// HOẶC đảm bảo biến môi trường này đã được set trong môi trường của bạn trước khi chạy app

const sessionClient = new dialogflow.SessionsClient();
// --- HẾT PHẦN KHỞI TẠO DIALOGFLOW ---


// --- ĐỊNH NGHĨA API ENDPOINT MỚI CHO CHATBOT ---
app.post('/api/dialogflow-text-input', async (req, res) => {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
        return res.status(400).json({ error: 'Tin nhắn và sessionId là bắt buộc.' });
    }

    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'vi-VN', // Quan trọng: Đảm bảo khớp với ngôn ngữ của Dialogflow Agent của bạn
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult; // Đây là đối tượng quan trọng

        console.log(`[Dialogflow] Câu hỏi người dùng: ${result.queryText}`);
        console.log(`[Dialogflow] Intent được nhận diện: ${result.intent ? result.intent.displayName : 'Không xác định'}`);
        console.log(`[Dialogflow] Phản hồi của bot: ${result.fulfillmentText}`);
        console.log(`[Dialogflow] Toàn bộ queryResult:`, result); // LOG TOÀN BỘ queryResult ĐỂ DEBUG

        let richContentData = null; // Biến để lưu richContent

        // --- BẮT ĐẦU TRÍCH XUẤT RICH CONTENT ---
        // Case 1: Rich content nằm trong fulfillmentMessages (cấu hình trực tiếp trong Dialogflow Responses)
        if (result.fulfillmentMessages && result.fulfillmentMessages.length > 0) {
            for (const msg of result.fulfillmentMessages) {
                if (msg.payload && msg.payload.fields && msg.payload.fields.richContent) {
                    // payload là một Struct, cần truy cập thông qua .fields để lấy giá trị thực
                    richContentData = msg.payload.fields.richContent.listValue.values.map(item => item.listValue.values.map(subItem => subItem.structValue.fields));
                    // console.log(`[Dialogflow] Rich content từ fulfillmentMessages:`, richContentData); // LOG CHI TIẾT
                    break; // Thoát vòng lặp sau khi tìm thấy richContent đầu tiên
                }
            }
        }

        // Case 2: Rich content nằm trong webhookPayload (nếu bạn sử dụng Webhook)
        // Điều này chỉ xảy ra nếu webhook của bạn gửi richContent trong payload
        if (!richContentData && result.webhookPayload && result.webhookPayload.fields && result.webhookPayload.fields.richContent) {
            richContentData = result.webhookPayload.fields.richContent.listValue.values.map(item => item.listValue.values.map(subItem => subItem.structValue.fields));
            // console.log(`[Dialogflow] Rich content từ webhookPayload:`, richContentData); // LOG CHI TIẾT
        }
        // --- KẾT THÚC TRÍCH XUẤT RICH CONTENT ---

        res.json({
            fulfillmentText: result.fulfillmentText,
            intentDisplayName: result.intent ? result.intent.displayName : 'UNKNOWN',
            // --- THÊM RICH CONTENT VÀO PHẢN HỒI ---
            richContent: richContentData,
            // Bạn có thể thêm các thông tin khác từ 'result' nếu cần
            // Ví dụ: queryResult: result // Gửi toàn bộ queryResult để frontend xử lý chi tiết hơn
        });

    } catch (error) {
        console.error('[Dialogflow ERROR]: Không thể giao tiếp với Dialogflow API.', error);
        res.status(500).json({ error: 'Lỗi khi giao tiếp với chatbot. Vui lòng thử lại sau.' });
    }
});
// --- HẾT PHẦN API ENDPOINT CHATBOT ---


// --- TRUYỀN ĐỐI TƯỢNG `io` VÀO CÁC ROUTE CẦN SỬ DỤNG REAL-TIME ---
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/posts', postRoutes(io)); // Truyền 'io' vào postRoutes (giả định postRoutes là một hàm nhận io)
app.use('/api/auth', authRoutess); // Gọi đúng endpoint: /api/auth/google-login

app.use('/api/images', imageRoutes); // Route upload ảnh
app.use('/upload', express.static(path.join(__dirname, 'public', 'upload')));
app.use('/api/uploads', uploadRoutes);
app.use('/api/comments', commentRoutes(io)); // Truyền 'io' vào commentRoutes (giả định commentRoutes là một hàm nhận io)
app.use('/api/likes', likeRoutes); // KHÔNG TRUYỀN 'io' VÀO likeRoutes, vì likeController đã được thiết lập
app.use('/api/ratings', ratingRoutes(io)); // <--- ĐÃ CHỈNH SỬA TẠI ĐÂY: TRUYỀN 'io' VÀO ratingRoutes

// --- ĐƯỜNG DẪN MỚI CHO ADMIN ---
app.use('/api/admin/posts', adminPostRoutes); // Thêm routes admin
// --- HẾT ĐƯỜNG DẪN MỚI CHO ADMIN ---

const PORT = process.env.PORT || 5000;
// --- THAY THẾ app.listen BẰNG server.listen ---
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));