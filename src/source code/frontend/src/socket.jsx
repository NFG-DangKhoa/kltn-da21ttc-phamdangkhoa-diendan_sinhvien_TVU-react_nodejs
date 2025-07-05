// src/socket.js
import { io } from 'socket.io-client';

// Địa chỉ backend của bạn (đảm bảo trùng khớp với origin trong CORS của backend)
const SOCKET_SERVER_URL = 'http://localhost:5000';

// Khởi tạo instance Socket.IO client với cấu hình tối ưu cho realtime chat
const socket = io(SOCKET_SERVER_URL, {
    // Cấu hình reconnection để đảm bảo kết nối ổn định
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10, // Tăng số lần thử reconnect
    timeout: 20000,

    // Cấu hình transport
    transports: ['websocket', 'polling'],

    // Cấu hình heartbeat để duy trì kết nối
    pingTimeout: 60000,
    pingInterval: 25000,

    // Sử dụng credentials nếu cần
    withCredentials: true,

    // Cấu hình CORS
    forceNew: false
});

// Event listeners để debug connection
socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
});

socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
    console.error('❌ Socket reconnection failed:', error);
});

socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
});

export default socket;