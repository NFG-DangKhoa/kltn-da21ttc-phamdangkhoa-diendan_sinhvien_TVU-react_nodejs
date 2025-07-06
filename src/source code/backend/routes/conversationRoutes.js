const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const auth = require('../middlewares/authMiddleware');

// GET /api/conversations/:conversationId/settings - Lấy cài đặt cuộc trò chuyện
router.get('/:conversationId/settings', auth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập cuộc trò chuyện này'
            });
        }

        const settings = conversation.getMessageAcceptanceSettings(userId);

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error getting conversation settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy cài đặt cuộc trò chuyện',
            error: error.message
        });
    }
});

// PUT /api/conversations/:conversationId/settings - Cập nhật cài đặt cuộc trò chuyện
router.put('/:conversationId/settings', auth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;
        const { requireAcceptance, autoAcceptFromKnownUsers } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập cuộc trò chuyện này'
            });
        }

        const settings = {
            requireAcceptance: requireAcceptance !== undefined ? requireAcceptance : false,
            autoAcceptFromKnownUsers: autoAcceptFromKnownUsers !== undefined ? autoAcceptFromKnownUsers : true
        };

        await conversation.updateMessageAcceptanceSettings(userId, settings);

        res.json({
            success: true,
            message: 'Cài đặt đã được cập nhật thành công',
            data: settings
        });
    } catch (error) {
        console.error('Error updating conversation settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật cài đặt cuộc trò chuyện',
            error: error.message
        });
    }
});

// GET /api/conversations/:conversationId/pending-count - Lấy số lượng tin nhắn chờ chấp nhận
router.get('/:conversationId/pending-count', auth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập cuộc trò chuyện này'
            });
        }

        const pendingCount = conversation.pendingMessages.length;

        res.json({
            success: true,
            data: {
                pendingCount
            }
        });
    } catch (error) {
        console.error('Error getting pending count:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy số lượng tin nhắn chờ chấp nhận',
            error: error.message
        });
    }
});

module.exports = router;
