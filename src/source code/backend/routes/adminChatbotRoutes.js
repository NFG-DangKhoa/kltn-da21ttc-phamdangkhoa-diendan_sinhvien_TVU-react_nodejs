// File: backend/routes/adminChatbotRoutes.js
const express = require('express');
const router = express.Router();
const adminChatbotController = require('../controllers/adminChatbotController');

// Import middleware
const { protect, admin } = require('../middlewares/authMiddleware');

// Áp dụng middleware xác thực và phân quyền admin cho tất cả routes
router.use(protect);
router.use(admin);

// Intent Management Routes

/**
 * @route GET /api/admin/chatbot/intents
 * @desc Lấy danh sách intents
 * @access Private (Admin Only)
 */
router.get('/intents', adminChatbotController.getIntents);

/**
 * @route GET /api/admin/chatbot/intents/:id
 * @desc Lấy chi tiết intent
 * @access Private (Admin Only)
 */
router.get('/intents/:id', adminChatbotController.getIntentById);

/**
 * @route POST /api/admin/chatbot/intents
 * @desc Tạo intent mới
 * @access Private (Admin Only)
 */
router.post('/intents', adminChatbotController.createIntent);

/**
 * @route PUT /api/admin/chatbot/intents/:id
 * @desc Cập nhật intent
 * @access Private (Admin Only)
 */
router.put('/intents/:id', adminChatbotController.updateIntent);

/**
 * @route DELETE /api/admin/chatbot/intents/:id
 * @desc Xóa intent
 * @access Private (Admin Only)
 */
router.delete('/intents/:id', adminChatbotController.deleteIntent);

/**
 * @route POST /api/admin/chatbot/intents/:id/training-phrases
 * @desc Thêm training phrase cho intent
 * @access Private (Admin Only)
 */
router.post('/intents/:id/training-phrases', adminChatbotController.addTrainingPhrase);

/**
 * @route POST /api/admin/chatbot/intents/:id/responses
 * @desc Thêm response cho intent
 * @access Private (Admin Only)
 */
router.post('/intents/:id/responses', adminChatbotController.addResponse);

// Dialogflow Management Routes

/**
 * @route POST /api/admin/chatbot/sync
 * @desc Sync tất cả intents với Dialogflow
 * @access Private (Admin Only)
 */
router.post('/sync', adminChatbotController.syncWithDialogflow);

/**
 * @route POST /api/admin/chatbot/train
 * @desc Huấn luyện lại agent
 * @access Private (Admin Only)
 */
router.post('/train', adminChatbotController.trainAgent);

// Conversation Management Routes

/**
 * @route GET /api/admin/chatbot/conversations
 * @desc Lấy danh sách conversations
 * @access Private (Admin Only)
 */
router.get('/conversations', adminChatbotController.getConversations);

/**
 * @route GET /api/admin/chatbot/conversations/:id
 * @desc Lấy chi tiết conversation
 * @access Private (Admin Only)
 */
router.get('/conversations/:id', adminChatbotController.getConversationById);

/**
 * @route PUT /api/admin/chatbot/conversations/:id/review
 * @desc Đánh dấu conversation đã review
 * @access Private (Admin Only)
 */
router.put('/conversations/:id/review', adminChatbotController.markConversationReviewed);

/**
 * @route POST /api/admin/chatbot/conversations/:id/notes
 * @desc Thêm ghi chú cho conversation
 * @access Private (Admin Only)
 */
router.post('/conversations/:id/notes', adminChatbotController.addConversationNote);

// Analytics Routes

/**
 * @route GET /api/admin/chatbot/analytics/overview
 * @desc Lấy thống kê tổng quan chatbot
 * @access Private (Admin Only)
 */
router.get('/analytics/overview', adminChatbotController.getChatbotAnalytics);

/**
 * @route GET /api/admin/chatbot/analytics/intents
 * @desc Lấy thống kê intents
 * @access Private (Admin Only)
 */
router.get('/analytics/intents', adminChatbotController.getIntentAnalytics);

/**
 * @route GET /api/admin/chatbot/analytics/conversations
 * @desc Lấy thống kê conversations
 * @access Private (Admin Only)
 */
router.get('/analytics/conversations', adminChatbotController.getConversationAnalytics);

// Widget Settings Routes

/**
 * @route GET /api/admin/chatbot/widget-settings
 * @desc Lấy cài đặt widget chatbot
 * @access Private (Admin Only)
 */
router.get('/widget-settings', adminChatbotController.getWidgetSettings);

/**
 * @route PUT /api/admin/chatbot/widget-settings
 * @desc Cập nhật cài đặt widget chatbot
 * @access Private (Admin Only)
 */
router.put('/widget-settings', adminChatbotController.updateWidgetSettings);

module.exports = router;
