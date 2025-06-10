// File: backend/controllers/adminUserController.js
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * @route GET /api/admin/users
 * @desc Lấy danh sách tất cả người dùng với phân trang, tìm kiếm và lọc
 * @access Private (Admin Only)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = '',
            status = '',
            sortBy = 'createdAt',
            sortOrder = '-1'
        } = req.query;

        // Tạo query object
        const query = {};

        // Tìm kiếm theo tên hoặc email
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Lọc theo role
        if (role) {
            query.role = role;
        }

        // Lọc theo status
        if (status) {
            query.status = status;
        }

        // Tạo sort options
        const sortOptions = {};
        sortOptions[sortBy] = parseInt(sortOrder); // -1 for descending, 1 for ascending

        // Tính toán skip và limit
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Thực hiện query
        const users = await User.find(query)
            .select('-password') // Không trả về password
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('warnings.createdBy', 'fullName email')
            .populate('suspensionInfo.suspendedBy', 'fullName email')
            .populate('banInfo.bannedBy', 'fullName email');

        // Đếm tổng số documents
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalUsers,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách người dùng',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/users/:id
 * @desc Lấy thông tin chi tiết một người dùng
 * @access Private (Admin Only)
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        const user = await User.findById(id)
            .select('-password')
            .populate('warnings.createdBy', 'fullName email')
            .populate('suspensionInfo.suspendedBy', 'fullName email')
            .populate('banInfo.bannedBy', 'fullName email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin người dùng',
            error: error.message
        });
    }
};

/**
 * @route POST /api/admin/users/:id/warn
 * @desc Cảnh báo người dùng
 * @access Private (Admin Only)
 */
exports.warnUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, reason } = req.body;
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        if (!message || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp nội dung cảnh báo và lý do'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Không cho phép cảnh báo admin khác
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không thể cảnh báo admin khác'
            });
        }

        // Thêm cảnh báo mới
        user.warnings.push({
            message,
            reason,
            createdBy: adminId,
            createdAt: new Date()
        });

        user.updatedAt = new Date();
        await user.save();

        // Populate thông tin admin đã tạo cảnh báo
        await user.populate('warnings.createdBy', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Đã cảnh báo người dùng thành công',
            data: user
        });
    } catch (error) {
        console.error('Lỗi khi cảnh báo người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cảnh báo người dùng',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/users/:id/suspend
 * @desc Tạm khóa tài khoản người dùng
 * @access Private (Admin Only)
 */
exports.suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, suspendedUntil } = req.body;
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp lý do tạm khóa'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Không cho phép khóa admin khác
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không thể khóa admin khác'
            });
        }

        // Cập nhật trạng thái và thông tin tạm khóa
        user.status = 'suspended';
        user.suspensionInfo = {
            reason,
            suspendedBy: adminId,
            suspendedAt: new Date(),
            suspendedUntil: suspendedUntil ? new Date(suspendedUntil) : null
        };
        user.updatedAt = new Date();

        await user.save();
        await user.populate('suspensionInfo.suspendedBy', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Đã tạm khóa tài khoản người dùng thành công',
            data: user
        });
    } catch (error) {
        console.error('Lỗi khi tạm khóa người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạm khóa người dùng',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/users/:id/ban
 * @desc Cấm vĩnh viễn tài khoản người dùng
 * @access Private (Admin Only)
 */
exports.banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, isPermanent = true } = req.body;
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp lý do cấm tài khoản'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Không cho phép cấm admin khác
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không thể cấm admin khác'
            });
        }

        // Cập nhật trạng thái và thông tin cấm
        user.status = 'banned';
        user.banInfo = {
            reason,
            bannedBy: adminId,
            bannedAt: new Date(),
            isPermanent
        };
        user.updatedAt = new Date();

        await user.save();
        await user.populate('banInfo.bannedBy', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Đã cấm tài khoản người dùng thành công',
            data: user
        });
    } catch (error) {
        console.error('Lỗi khi cấm người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cấm người dùng',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/users/:id/activate
 * @desc Kích hoạt lại tài khoản người dùng (bỏ khóa/cấm)
 * @access Private (Admin Only)
 */
exports.activateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Kích hoạt lại tài khoản
        user.status = 'active';
        user.suspensionInfo = undefined;
        user.banInfo = undefined;
        user.updatedAt = new Date();

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Đã kích hoạt lại tài khoản người dùng thành công',
            data: user
        });
    } catch (error) {
        console.error('Lỗi khi kích hoạt người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi kích hoạt người dùng',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/admin/users/:id/role
 * @desc Thay đổi vai trò người dùng
 * @access Private (Admin Only)
 */
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ'
            });
        }

        if (!role || !['user', 'editor', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ. Chỉ chấp nhận: user, editor, admin'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Cập nhật vai trò
        user.role = role;
        user.updatedAt = new Date();

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Đã cập nhật vai trò người dùng thành công',
            data: user
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật vai trò người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật vai trò người dùng',
            error: error.message
        });
    }
};

/**
 * @route DELETE /api/admin/users/:id/warnings/:warningId
 * @desc Xóa cảnh báo của người dùng
 * @access Private (Admin Only)
 */
exports.removeWarning = async (req, res) => {
    try {
        const { id, warningId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(warningId)) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Xóa cảnh báo
        user.warnings = user.warnings.filter(warning =>
            warning._id.toString() !== warningId
        );
        user.updatedAt = new Date();

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Đã xóa cảnh báo thành công',
            data: user
        });
    } catch (error) {
        console.error('Lỗi khi xóa cảnh báo:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa cảnh báo',
            error: error.message
        });
    }
};

/**
 * @route GET /api/admin/users/stats
 * @desc Lấy thống kê người dùng
 * @access Private (Admin Only)
 */
exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const suspendedUsers = await User.countDocuments({ status: 'suspended' });
        const bannedUsers = await User.countDocuments({ status: 'banned' });

        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentUsers = await User.find()
            .select('fullName email role status createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                suspendedUsers,
                bannedUsers,
                usersByRole,
                recentUsers
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê người dùng',
            error: error.message
        });
    }
};
