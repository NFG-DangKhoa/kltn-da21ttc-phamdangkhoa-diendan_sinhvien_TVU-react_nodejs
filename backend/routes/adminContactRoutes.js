const express = require('express');
const router = express.Router();
const adminContactController = require('../controllers/adminContactController');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');

/**
 * @route GET /api/admin/contact-info
 * @desc Lấy thông tin liên hệ admin (public)
 * @access Public
 */
router.get('/contact-info', adminContactController.getAdminContactInfo);

/**
 * @route PUT /api/admin/contact-info
 * @desc Cập nhật thông tin liên hệ admin
 * @access Private (Admin Only)
 */
router.put('/contact-info', authMiddleware, isAdminMiddleware, adminContactController.updateAdminContactInfo);

/**
 * @route GET /api/admin/profile/contact-info
 * @desc Lấy thông tin liên hệ admin cho trang profile admin
 * @access Private (Admin Only)
 */
router.get('/profile/contact-info', authMiddleware, isAdminMiddleware, adminContactController.getAdminProfileContactInfo);

module.exports = router;
