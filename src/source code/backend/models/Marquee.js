const mongoose = require('mongoose');

const MarqueeSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
    backgroundColor: {
        type: String,
        default: '#f8d7da',
    },
}, { timestamps: true });

module.exports = mongoose.model('Marquee', MarqueeSchema);
