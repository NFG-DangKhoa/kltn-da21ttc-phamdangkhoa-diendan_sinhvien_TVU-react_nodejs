const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required: false,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments',
        default: null, // null = comment gốc; khác null = reply
    },
    imageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Images',
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    likeCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Comments', commentSchema);