// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Đảm bảo đường dẫn này đúng tới User model của bạn

const authMiddleware = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Không có token hoặc định dạng không hợp lệ, ủy quyền bị từ chối.' });
    }

    try {
        const tokenValue = token.split(' ')[1]; // Lấy phần token sau 'Bearer '
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET); // Sử dụng biến môi trường JWT_SECRET

        // Gán user từ database vào req.user (không bao gồm password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(404).json({ message: 'Người dùng không tìm thấy.' });
        }

        next();
    } catch (err) {
        console.error('Lỗi xác thực token:', err);
        return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn.' });
    }
};

module.exports = authMiddleware;