const mongoose = require('mongoose');

const chatbotFAQSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    tags: [{
        type: String,
    }]
});

module.exports = mongoose.model('ChatbotFAQ', chatbotFAQSchema);

