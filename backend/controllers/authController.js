// File: backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Email transporter configuration
// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false,
//     auth: {
//         user: 'ethereal.user@ethereal.email',
//         pass: 'ethereal.pass'
//     }
// });

// Gmail config - ACTIVE
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'phamdangkhoa.21092003@gmail.com',
        pass: process.env.EMAIL_PASS || 'stobuzyorabfjxnx'
    }
});

exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phone, address } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phone,
            address,
            emailVerificationToken,
            emailVerificationExpires,
            isEmailVerified: false,
            status: 'pending' // Account chưa được kích hoạt
        });

        // Send verification email - temporarily disabled
        try {
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;

            console.log('📧 Sending verification email to:', email);
            console.log('🔗 Verification URL:', verificationUrl);
            console.log('🔐 Email User:', process.env.EMAIL_USER);
            console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}****` : 'undefined');
            console.log('🔑 Email Pass Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');

            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@tvuforum.com',
                to: email,
                subject: 'Xác thực tài khoản - Diễn đàn TVU',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="width: 80px; height: 80px; background-color: #1976d2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                    <span style="color: white; font-size: 40px;">✉️</span>
                                </div>
                                <h1 style="color: #1976d2; margin: 0; font-size: 28px; font-weight: 700;">Chào mừng đến với Diễn đàn TVU!</h1>
                            </div>

                            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                                Xin chào <strong style="color: #1976d2;">${fullName}</strong>,
                            </p>

                            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
                                Cảm ơn bạn đã đăng ký tài khoản tại <strong>Diễn đàn TVU</strong>.
                                Để hoàn tất quá trình đăng ký, vui lòng click vào nút bên dưới để xác thực email của bạn:
                            </p>

                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${verificationUrl}"
                                   style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                                          color: white;
                                          padding: 16px 32px;
                                          text-decoration: none;
                                          border-radius: 8px;
                                          display: inline-block;
                                          font-weight: 600;
                                          font-size: 16px;
                                          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
                                          transition: all 0.3s ease;">
                                    🔐 Xác thực Email
                                </a>
                            </div>

                            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
                                <p style="margin: 0; font-size: 14px; color: #666;">
                                    <strong>Hoặc copy link sau vào trình duyệt:</strong>
                                </p>
                                <p style="word-break: break-all; color: #1976d2; margin: 10px 0 0 0; font-size: 14px;">
                                    ${verificationUrl}
                                </p>
                            </div>

                            <div style="border-top: 2px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
                                <p style="font-size: 14px; color: #666; margin: 0;">
                                    ⏰ <strong>Lưu ý:</strong> Link này sẽ hết hạn sau <strong>24 giờ</strong>.
                                </p>
                                <p style="font-size: 12px; color: #999; margin: 15px 0 0 0;">
                                    Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
                                </p>
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 20px;">
                            <p style="font-size: 12px; color: #999; margin: 0;">
                                © 2024 Diễn đàn TVU. All rights reserved.
                            </p>
                        </div>
                    </div>
                `
            });

            console.log('✅ Verification email sent successfully!');
        } catch (emailError) {
            console.error('❌ Error sending verification email:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng kiểm tra email và click vào link xác thực để kích hoạt tài khoản.',
            email: user.email,
            requiresVerification: true
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

        // Kiểm tra xác thực email
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email và click vào link xác thực.',
                requiresVerification: true,
                email: user.email
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (user.status === 'pending') {
            return res.status(403).json({
                message: 'Tài khoản đang chờ xác thực email. Vui lòng kiểm tra email của bạn.',
                requiresVerification: true,
                email: user.email
            });
        }

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

// Email verification
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Token xác thực không hợp lệ hoặc đã hết hạn'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        user.status = 'active'; // Kích hoạt tài khoản
        await user.save();

        res.json({
            message: 'Email đã được xác thực thành công! Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.',
            success: true,
            accountActivated: true
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'Không tìm thấy tài khoản với email này'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        // Send reset email
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

            console.log('📧 Password reset email would be sent to:', email);
            console.log('🔗 Reset URL:', resetUrl);
            console.log('💡 To enable emails: Configure Gmail in .env and uncomment email code');

            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@tvuforum.com',
                to: email,
                subject: 'Đặt lại mật khẩu - Diễn đàn TVU',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="width: 80px; height: 80px; background-color: #f44336; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                    <span style="color: white; font-size: 40px;">🔒</span>
                                </div>
                                <h1 style="color: #f44336; margin: 0; font-size: 28px; font-weight: 700;">Đặt lại mật khẩu</h1>
                            </div>

                            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                                Xin chào <strong style="color: #f44336;">${user.fullName}</strong>,
                            </p>

                            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
                                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại <strong>Diễn đàn TVU</strong>.
                                Click vào nút bên dưới để đặt lại mật khẩu của bạn:
                            </p>

                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${resetUrl}"
                                   style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                                          color: white;
                                          padding: 16px 32px;
                                          text-decoration: none;
                                          border-radius: 8px;
                                          display: inline-block;
                                          font-weight: 600;
                                          font-size: 16px;
                                          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
                                          transition: all 0.3s ease;">
                                    🔑 Đặt lại mật khẩu
                                </a>
                            </div>

                            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
                                <p style="margin: 0; font-size: 14px; color: #666;">
                                    <strong>Hoặc copy link sau vào trình duyệt:</strong>
                                </p>
                                <p style="word-break: break-all; color: #f44336; margin: 10px 0 0 0; font-size: 14px;">
                                    ${resetUrl}
                                </p>
                            </div>

                            <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 30px 0;">
                                <p style="margin: 0; font-size: 14px; color: #e65100;">
                                    ⚠️ <strong>Quan trọng:</strong> Link này sẽ hết hạn sau <strong>10 phút</strong> vì lý do bảo mật.
                                </p>
                            </div>

                            <div style="border-top: 2px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
                                <p style="font-size: 12px; color: #999; margin: 0;">
                                    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                                    Mật khẩu của bạn sẽ không thay đổi.
                                </p>
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 20px;">
                            <p style="font-size: 12px; color: #999; margin: 0;">
                                © 2024 Diễn đàn TVU. All rights reserved.
                            </p>
                        </div>
                    </div>
                `
            });

            console.log('✅ Password reset email sent successfully!');

            res.json({
                message: 'Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.',
                success: true
            });
        } catch (emailError) {
            console.error('❌ Error sending reset email:', emailError);
            res.status(500).json({
                message: 'Lỗi khi gửi email. Vui lòng thử lại sau.'
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            message: 'Mật khẩu đã được đặt lại thành công!',
            success: true
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
