// controllers/auth.controller.js
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Giả sử bạn đã có model User
const generateToken = require('../utils/generateToken'); // Hàm tạo JWT app của bạn

const client = new OAuth2Client();

const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '990724811150-jdm9kngkj7lfmkjl1pqake1hbhfju9tt.apps.googleusercontent.com', // 🔁 Thay bằng client ID thật
            clockToleranceSeconds: 60 // ✅ Cho phép lệch thời gian nhỏ (60 giây)
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ email, name, avatar: picture });
        }

        const appToken = generateToken(user._id);

        res.json({ user, token: appToken });
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

module.exports = {
    googleLogin,
};
