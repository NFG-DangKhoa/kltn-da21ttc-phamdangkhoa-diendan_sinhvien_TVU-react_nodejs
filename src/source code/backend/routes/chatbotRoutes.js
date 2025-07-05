const express = require('express');
const router = express.Router();
const { handleDialogflowTextInput } = require('../controllers/chatbotController');

// Route cho frontend chatbot
router.post('/dialogflow-text-input', handleDialogflowTextInput);

module.exports = router;

