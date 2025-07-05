// File: backend/models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    refType: {
        type: String,
        enum: ['post', 'topic'],
        required: true,
    },
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'refType', // liên kết động theo refType
    },
    url: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        default: '',
    },
    isMain: {
        type: Boolean,
        default: false,
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    commentCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Images', imageSchema);
