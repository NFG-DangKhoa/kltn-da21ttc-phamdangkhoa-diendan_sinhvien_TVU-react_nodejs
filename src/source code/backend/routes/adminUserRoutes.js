// File: backend/routes/adminUserRoutes.js
const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

// Import middleware
const { protect, admin } = require('../middlewares/authMiddleware');

// Áp dụng middleware xác thực và phân quyền admin cho tất cả các route
router.use(protect);
router.use(admin);

// Routes cho quản lý người dùng

/**
 * @route GET /api/admin/users/stats
 * @desc Lấy thống kê người dùng
 * @access Private (Admin Only)
 */
router.get('/stats', adminUserController.getUserStats);

/**
 * @route GET /api/admin/users
 * @desc Lấy danh sách tất cả người dùng với phân trang, tìm kiếm và lọc
 * @access Private (Admin Only)
 */
router.get('/', adminUserController.getAllUsers);

/**
 * @route GET /api/admin/users/:id
 * @desc Lấy thông tin chi tiết một người dùng
 * @access Private (Admin Only)
 */
router.get('/:id', adminUserController.getUserById);

/**
 * @route POST /api/admin/users/:id/warn
 * @desc Cảnh báo người dùng
 * @access Private (Admin Only)
 */
router.post('/:id/warn', adminUserController.warnUser);

/**
 * @route PUT /api/admin/users/:id/suspend
 * @desc Tạm khóa tài khoản người dùng
 * @access Private (Admin Only)
 */
router.put('/:id/suspend', adminUserController.suspendUser);

/**
 * @route PUT /api/admin/users/:id/ban
 * @desc Cấm vĩnh viễn tài khoản người dùng
 * @access Private (Admin Only)
 */
router.put('/:id/ban', adminUserController.banUser);

/**
 * @route PUT /api/admin/users/:id/activate
 * @desc Kích hoạt lại tài khoản người dùng (bỏ khóa/cấm)
 * @access Private (Admin Only)
 */
router.put('/:id/activate', adminUserController.activateUser);

/**
 * @route PUT /api/admin/users/:id/role
 * @desc Thay đổi vai trò người dùng
 * @access Private (Admin Only)
 */
router.put('/:id/role', adminUserController.updateUserRole);

/**
 * @route DELETE /api/admin/users/:id/warnings/:warningId
 * @desc Xóa cảnh báo của người dùng
 * @access Private (Admin Only)
 */
router.delete('/:id/warnings/:warningId', adminUserController.removeWarning);

/**
 * @route PUT /api/admin/users/:id/block-avatar
 * @desc Tạm khóa ảnh đại diện của người dùng
 * @access Private (Admin Only)
 */
router.put('/:id/block-avatar', adminUserController.blockAvatar);

/**
 * @route PUT /api/admin/users/:id/unblock-avatar
 * @desc Bỏ tạm khóa ảnh đại diện của người dùng
 * @access Private (Admin Only)
 */
router.put('/:id/unblock-avatar', adminUserController.unblockAvatar);

/**
 * @route PUT /api/admin/users/:id/block-cover-photo
 * @desc Tạm khóa ảnh bìa của người dùng
 * @access Private (Admin Only)
 */
router.put('/:id/block-cover-photo', adminUserController.blockCoverPhoto);

/**
 * @route PUT /api/admin/users/:id/unblock-cover-photo
 * @desc Bỏ tạm khóa ảnh bìa của người dùng
 * @access Private (Admin Only)
 */
router.put('/:id/unblock-cover-photo', adminUserController.unblockCoverPhoto);

module.exports = router;
