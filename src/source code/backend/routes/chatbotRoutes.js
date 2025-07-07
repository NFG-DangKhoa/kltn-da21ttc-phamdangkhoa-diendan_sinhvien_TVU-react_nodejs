const express = require('express');
const router = express.Router();
const { handleDialogflowTextInput, endChatbotConversation, getChatbotWidgetSettings } = require('../controllers/chatbotController');

// Route cho frontend chatbot
router.post('/dialogflow-text-input', handleDialogflowTextInput);
router.post('/end-chatbot-conversation', endChatbotConversation);
router.get('/chatbot-widget-settings', getChatbotWidgetSettings);

module.exports = router;
