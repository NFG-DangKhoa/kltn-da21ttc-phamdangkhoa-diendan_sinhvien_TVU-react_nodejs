// File: backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    title: String,
    content: String,
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topics' },
    tags: [String],
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,

    // Trường đếm mới:
    commentCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Posts', postSchema);
