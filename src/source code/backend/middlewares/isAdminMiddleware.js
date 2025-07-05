// backend/middleware/isAdminMiddleware.js
// Middleware này sẽ được gọi sau authMiddleware, đảm bảo req.user đã tồn tại
module.exports = (req, res, next) => {
    // Giả định req.user đã được thiết lập bởi authMiddleware và chứa trường 'role'
    if (req.user && req.user.role === 'admin') {
        next(); // Người dùng là admin, tiếp tục
    } else {
        res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này (chỉ dành cho Admin).' });
    }
};