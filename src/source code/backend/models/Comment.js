const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    imageId: { type: Schema.Types.ObjectId, ref: 'Image', default: null },
    level: { type: Number, default: 0 },
    rootCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    replyCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
}, { timestamps: true });

// Virtual field for replies
CommentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentCommentId',
    justOne: false
});

// Ensure virtual fields are included in toObject and toJSON
CommentSchema.set('toObject', { virtuals: true });
CommentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Comment', CommentSchema);