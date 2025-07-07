// File: backend/controllers/chatbotController.js
const ChatbotFAQ = require('../models/ChatbotFAQ');
const ChatbotConversation = require('../models/ChatbotConversation');
const fs = require('fs').promises;
const path = require('path');

exports.getFAQs = async (req, res) => {
    try {
        const faqs = await ChatbotFAQ.find();
        res.json(faqs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Xử lý text input từ frontend gửi lên (Dialogflow)
exports.handleDialogflowTextInput = async (req, res) => {
    try {
        const { message, sessionId, userId } = req.body; // Thêm userId
        if (!message || !sessionId) {
            return res.status(400).json({ error: 'Missing message or sessionId' });
        }

        // Lấy thông tin IP, User Agent từ request
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        // Tìm hoặc tạo cuộc hội thoại
        let conversation = await ChatbotConversation.findOne({ sessionId });

        if (!conversation) {
            conversation = new ChatbotConversation({
                sessionId,
                userId: userId || null, // Gán userId nếu có
                sessionInfo: {
                    ipAddress,
                    userAgent,
                    // Có thể thêm logic để detect deviceType, platform, language từ userAgent
                },
                messages: []
            });
        }

        // Thêm tin nhắn của người dùng vào cuộc hội thoại
        conversation.messages.push({
            type: 'user',
            text: message,
            timestamp: new Date(),
        });

        // --- Dưới đây là ví dụ gọi Dialogflow bằng thư viện google-cloud/dialogflow ---
        const dialogflow = require('dialogflow');
        const projectId = process.env.DIALOGFLOW_PROJECT_ID || 'pioneering-rex-462008-g9';
        const sessionClient = new dialogflow.SessionsClient();
        const sessionPath = sessionClient.sessionPath(projectId, sessionId);

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: message,
                    languageCode: 'vi',
                },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        // Thêm tin nhắn của bot vào cuộc hội thoại
        conversation.messages.push({
            type: 'bot',
            text: result.fulfillmentText,
            fulfillmentText: result.fulfillmentText,
            richResponses: result.fulfillmentMessages,
            webhookResponse: result.webhookPayload,
            detectedIntent: {
                name: result.intent.name,
                displayName: result.intent.displayName,
                confidence: result.intentDetectionConfidence,
                parameters: result.parameters,
            },
            contexts: result.outputContexts,
            timestamp: new Date(),
        });

        // Cập nhật thống kê và lưu cuộc hội thoại
        conversation.updateStats();
        await conversation.save();

        res.json({
            fulfillmentText: result.fulfillmentText,
            fulfillmentMessages: result.fulfillmentMessages,
            richContent: result.fulfillmentMessages?.[0]?.payload?.fields?.richContent,
            webhookPayload: result.webhookPayload,
        });
    } catch (err) {
        console.error('Dialogflow error:', err);
        res.status(500).json({ error: err.message || 'Dialogflow error' });
    }
};

// Xử lý kết thúc cuộc hội thoại chatbot
exports.endChatbotConversation = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: 'Missing sessionId' });
        }

        const conversation = await ChatbotConversation.findOne({ sessionId });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (conversation.status === 'active') {
            await conversation.endConversation();
            res.status(200).json({ message: 'Conversation ended successfully', conversationId: conversation._id });
        } else {
            res.status(200).json({ message: 'Conversation already ended or not active', conversationId: conversation._id });
        }
    } catch (err) {
        console.error('Error ending chatbot conversation:', err);
        res.status(500).json({ error: err.message || 'Error ending conversation' });
    }
};

// Lấy cài đặt widget chatbot cho frontend
exports.getChatbotWidgetSettings = async (req, res) => {
    try {
        const settingsPath = path.join(__dirname, '../config/chatbot-widget-settings.json');

        // Default settings (should match the ones in adminChatbotController for consistency)
        const defaultSettings = {
            primaryColor: '#1976d2',
            secondaryColor: '#f5f5f5',
            textColor: '#333333',
            greetingMessage: 'Hù, bạn cần hỗ trợ gì không nè',
            greetingDelay: 3000,
            position: 'bottom-right',
            size: 'medium',
            showAvatar: true,
            autoOpen: false,
            welcomeSound: true,
        };

        try {
            const settingsData = await fs.readFile(settingsPath, 'utf8');
            const settings = JSON.parse(settingsData);

            res.status(200).json({
                success: true,
                data: { ...defaultSettings, ...settings }
            });
        } catch (fileError) {
            // File doesn't exist, return default settings
            res.status(200).json({
                success: true,
                data: defaultSettings
            });
        }
    } catch (error) {
        console.error('Error getting public widget settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy cài đặt widget công khai',
            error: error.message
        });
    }
};
