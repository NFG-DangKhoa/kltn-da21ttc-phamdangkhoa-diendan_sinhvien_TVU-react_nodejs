// controllers/auth.controller.js (hoặc authController.js nếu bạn muốn đặt tên nhất quán)
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Đảm bảo đường dẫn đúng đến model User của bạn
const generateToken = require('../utils/generateToken'); // Đảm bảo đường dẫn đúng đến hàm generateToken của bạn

// Thay vì hardcode, bạn nên sử dụng biến môi trường cho Google Client ID
// Ví dụ: Tạo file .env và thêm GOOGLE_CLIENT_ID='YOUR_CLIENT_ID'
// Sau đó, cài đặt và sử dụng gói `dotenv` (npm install dotenv)
// require('dotenv').config(); // Thêm dòng này ở đầu file nếu bạn dùng dotenv
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc Đăng nhập hoặc đăng ký người dùng thông qua Google OAuth
 * @route POST /api/auth/google
 * @access Public
 */
exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // 1. Xác minh Google ID Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
            clockToleranceSeconds: 60 // Cho phép sai lệch thời gian 60 giây
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload; // 'picture' là URL ảnh đại diện từ Google

        // 2. Tìm hoặc tạo người dùng trong cơ sở dữ liệu của bạn
        let user = await User.findOne({ email });

        if (!user) {
            // Nếu người dùng không tồn tại, tạo mới
            user = await User.create({
                email,
                fullName: name, // Sử dụng 'name' từ Google payload cho 'fullName'
                avatarUrl: picture, // Lưu URL ảnh đại diện
                role: 'user' // Vai trò mặc định cho người dùng mới
            });
        } else {
            // Nếu người dùng đã tồn tại, cập nhật avatarUrl nếu có thay đổi
            // (Tùy chọn: bạn có thể không cần cập nhật nếu không muốn)
            if (user.avatarUrl !== picture) {
                user.avatarUrl = picture;
                await user.save();
            }
        }

        // 3. Tạo token ứng dụng của bạn và gửi phản hồi
        // Phản hồi được cấu trúc giống như các hàm đăng nhập/đăng ký khác
        const token = generateToken(user._id);

        res.json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatarUrl: user.avatarUrl, // Thêm avatarUrl vào phản hồi
                role: user.role
            },
            token: token
        });

    } catch (err) {
        // Xử lý lỗi xác minh token Google hoặc lỗi server
        console.error('Lỗi khi xác minh Google ID token hoặc lỗi server:', err.message);
        res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc lỗi xác thực Google.'
        });
    }
};

// Nếu bạn muốn đặt các hàm khác như register, login vào cùng file này, bạn sẽ làm tương tự:
/*
exports.register = async (req, res) => {
    // ... code cho register
};

exports.login = async (req, res) => {
    // ... code cho login
};
*/