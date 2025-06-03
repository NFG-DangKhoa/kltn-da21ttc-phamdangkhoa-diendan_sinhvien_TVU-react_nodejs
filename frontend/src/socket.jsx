// src/socket.js
import { io } from 'socket.io-client';

// Địa chỉ backend của bạn (đảm bảo trùng khớp với origin trong CORS của backend)
const SOCKET_SERVER_URL = 'http://localhost:5000';

// Khởi tạo instance Socket.IO client
const socket = io(SOCKET_SERVER_URL, {
    // Tùy chọn cấu hình bổ sung nếu cần, ví dụ:
    // autoConnect: false, // Nếu bạn muốn kết nối thủ công sau này
    // withCredentials: true, // Nếu bạn sử dụng cookie/session qua Socket.IO
});

export default socket;