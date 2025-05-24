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

