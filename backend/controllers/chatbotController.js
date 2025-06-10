// File: backend/controllers/chatbotController.js
const ChatbotFAQ = require('../models/ChatbotFAQ');

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
        const { message, sessionId } = req.body;
        if (!message || !sessionId) {
            return res.status(400).json({ error: 'Missing message or sessionId' });
        }

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

