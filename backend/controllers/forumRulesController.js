const ForumRules = require('../models/ForumRules');
const User = require('../models/User');

/**
 * @route GET /api/forum-rules
 * @desc Lấy quy định diễn đàn hiện tại
 * @access Public
 */
exports.getCurrentRules = async (req, res) => {
    try {
        let rules = await ForumRules.getCurrentRules();

        // Nếu chưa có quy định nào, tạo quy định mặc định
        if (!rules) {
            rules = new ForumRules({
                title: 'Quy định diễn đàn',
                content: `
# Quy định diễn đàn sinh viên TVU

## 1. Quy định chung
- Tôn trọng các thành viên khác trong diễn đàn
- Không sử dụng ngôn từ thô tục, xúc phạm
- Không spam hoặc đăng nội dung không liên quan

## 2. Quy định về nội dung
- Nội dung phải phù hợp với chủ đề diễn đàn
- Không đăng nội dung vi phạm pháp luật
- Không chia sẻ thông tin cá nhân của người khác

## 3. Quy định về hình ảnh
- Không đăng hình ảnh không phù hợp
- Tôn trọng bản quyền hình ảnh
- Hình ảnh phải liên quan đến nội dung bài viết

## 4. Hình phạt
- Cảnh báo lần đầu
- Khóa tài khoản tạm thời
- Khóa tài khoản vĩnh viễn đối với vi phạm nghiêm trọng

## 5. Liên hệ
Mọi thắc mắc xin liên hệ admin qua hệ thống chat.
                `.trim(),
                version: 1,
                isActive: true
            });
            await rules.save();
        }

        res.status(200).json({
            success: true,
            data: rules
        });
    } catch (error) {
        console.error('Error getting forum rules:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy quy định diễn đàn',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/forum-rules
 * @desc Cập nhật quy định diễn đàn (Admin only)
 * @access Admin
 */
exports.updateRules = async (req, res) => {
    try {
        const { title, content } = req.body;
        const adminId = req.user.id;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề và nội dung không được để trống'
            });
        }

        // Tìm quy định hiện tại
        const currentRules = await ForumRules.getCurrentRules();

        if (currentRules) {
            // Deactivate current rules
            currentRules.isActive = false;
            await currentRules.save();
        }

        // Tạo quy định mới với version tăng lên
        const newVersion = currentRules ? currentRules.version + 1 : 1;
        const newRules = new ForumRules({
            title,
            content,
            version: newVersion,
            isActive: true,
            lastUpdatedBy: adminId
        });

        await newRules.save();

        // Populate thông tin admin
        await newRules.populate('lastUpdatedBy', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Cập nhật quy định thành công',
            data: newRules
        });
    } catch (error) {
        console.error('Error updating forum rules:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật quy định diễn đàn',
            error: error.message
        });
    }
};

/**
 * @route GET /api/forum-rules/history
 * @desc Lấy lịch sử các phiên bản quy định (Admin only)
 * @access Admin
 */
exports.getRulesHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const rules = await ForumRules.find()
            .populate('lastUpdatedBy', 'fullName email')
            .sort({ version: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ForumRules.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                rules,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting rules history:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử quy định',
            error: error.message
        });
    }
};

/**
 * @route POST /api/forum-rules/agree
 * @desc User đồng ý với quy định diễn đàn
 * @access Private
 */
exports.agreeToRules = async (req, res) => {
    try {
        const userId = req.user.id;

        // Lấy quy định hiện tại
        const currentRules = await ForumRules.getCurrentRules();
        if (!currentRules) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quy định diễn đàn'
            });
        }

        // Cập nhật user đã đồng ý quy định
        const user = await User.findByIdAndUpdate(
            userId,
            {
                rulesAgreedVersion: currentRules.version,
                rulesAgreedAt: new Date()
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã đồng ý với quy định diễn đàn',
            data: {
                rulesVersion: currentRules.version,
                agreedAt: user.rulesAgreedAt
            }
        });
    } catch (error) {
        console.error('Error agreeing to rules:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đồng ý quy định',
            error: error.message
        });
    }
};

/**
 * @route GET /api/forum-rules/check-agreement
 * @desc Kiểm tra user đã đồng ý quy định chưa
 * @access Private
 */
exports.checkRulesAgreement = async (req, res) => {
    try {
        const userId = req.user.id;

        // Lấy quy định hiện tại
        const currentRules = await ForumRules.getCurrentRules();
        if (!currentRules) {
            return res.status(200).json({
                success: true,
                data: {
                    needsAgreement: false,
                    message: 'Chưa có quy định nào'
                }
            });
        }

        // Lấy thông tin user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Kiểm tra user đã đồng ý quy định hiện tại chưa
        const needsAgreement = user.rulesAgreedVersion < currentRules.version;

        res.status(200).json({
            success: true,
            data: {
                needsAgreement,
                currentRulesVersion: currentRules.version,
                userAgreedVersion: user.rulesAgreedVersion || 0,
                lastAgreedAt: user.rulesAgreedAt,
                rules: needsAgreement ? currentRules : null
            }
        });
    } catch (error) {
        console.error('Error checking rules agreement:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi kiểm tra đồng ý quy định',
            error: error.message
        });
    }
};
