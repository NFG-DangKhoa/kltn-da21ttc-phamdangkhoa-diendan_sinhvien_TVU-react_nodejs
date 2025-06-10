// File: backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phone, address } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ fullName, email, password: hashedPassword, phone, address });
        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role, // Thêm dòng này
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // Tăng số lần đăng nhập thất bại
            if (user) {
                user.loginAttempts = (user.loginAttempts || 0) + 1;
                await user.save();
            }
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Kiểm tra trạng thái tài khoản
        if (user.status === 'suspended') {
            return res.status(403).json({
                message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ admin.'
            });
        }

        if (user.status === 'banned') {
            return res.status(403).json({
                message: 'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ admin.'
            });
        }

        // Cập nhật thông tin đăng nhập thành công
        user.lastLogin = new Date();
        user.loginAttempts = 0; // Reset số lần đăng nhập thất bại
        await user.save();

        res.json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
