// File: backend/models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required: true,
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
        default: false, // true = ảnh chính
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
