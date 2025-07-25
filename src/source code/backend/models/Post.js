const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); // <<< THÊM DÒNG NÀY

const postSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topics', required: true },
    tags: [String],
    views: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // Thêm trường này để phân loại bài viết
    type: {
        type: String,
        enum: ['discussion', 'question', 'event', 'job', 'news', 'other'],
        default: 'discussion'
    },

    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'archived', 'flagged', 'deleted'],
        default: 'pending'
    },

    // Trường để đánh dấu bài viết nổi bật
    featured: {
        type: Boolean,
        default: false
    },

    // Thêm trường images để lưu ảnh
    images: [{
        type: String // URL của ảnh
    }]
}, {
    timestamps: true // <<< THÊM DÒNG NÀY ĐỂ Mongoose tự động quản lý createdAt và updatedAt
});

// ÁP DỤNG PLUGIN VÀO SCHEMA <<< THÊM DÒNG NÀY
postSchema.plugin(mongoosePaginate);

// Virtual field để lấy ảnh thumbnail từ content
postSchema.virtual('thumbnailImage').get(function () {
    const { extractFirstImageFromContent } = require('../utils/imageExtractor');
    return extractFirstImageFromContent(this.content);
});

// Virtual field để lấy tất cả ảnh từ content
postSchema.virtual('extractedImages').get(function () {
    const { extractAllImagesFromContent } = require('../utils/imageExtractor');
    return extractAllImagesFromContent(this.content);
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Tạo index để tối ưu hóa tìm kiếm và sắp xếp theo các trường thường xuyên truy vấn
postSchema.index({ topicId: 1, status: 1, createdAt: -1 });
postSchema.index({ authorId: 1, status: 1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' }); // Full-text search index

// Thay đổi tên model từ 'Posts' thành 'Post' để khớp với cách bạn sử dụng `Post` ở frontend và convention
// Tuy nhiên, nếu bạn đã sử dụng 'Posts' ở nhiều nơi khác và nó không gây lỗi, có thể giữ nguyên.
// Nếu bạn muốn thống nhất, hãy đổi thành 'Post' và đảm bảo các ref: 'Posts' trong các model khác cũng được đổi thành 'Post'.
module.exports = mongoose.model('Post', postSchema); // <<< ĐỔI 'Posts' thành 'Post' để khớp với convention và tên bạn require