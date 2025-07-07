const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },

    // Thông tin mở rộng cho quản lý
    category: {
        type: String,
        enum: [
            'Học tập',
            'Nghiên cứu',
            'Thực tập',
            'Việc làm',
            'Hoạt động sinh viên',
            'Công nghệ',
            'Kỹ năng mềm',
            'Trao đổi học thuật',
            'Thông báo',
            'Khác'
        ],
        default: 'Học tập'
    },

    // Mức độ ưu tiên hiển thị
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },

    // Trạng thái chủ đề
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    },

    // Màu sắc hiển thị (hex color)
    color: {
        type: String,
        default: '#1976d2',
        match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    },

    // Icon cho chủ đề
    icon: {
        type: String,
        default: 'topic'
    },

    // Ảnh đại diện cho chủ đề
    imageUrl: {
        type: String,
        default: ''
    },

    // Thẻ tags liên quan
    tags: [{
        type: String,
        trim: true
    }],

    // Thống kê
    postCount: {
        type: Number,
        default: 0
    },

    viewCount: {
        type: Number,
        default: 0
    },

    // Thông tin quản lý
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Changed to false
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Cài đặt hiển thị
    isVisible: {
        type: Boolean,
        default: true
    },

    // Cho phép tạo bài viết
    allowPosts: {
        type: Boolean,
        default: true
    },

    // Yêu cầu duyệt bài viết
    requireApproval: {
        type: Boolean,
        default: false
    },

    // Đánh dấu chủ đề thịnh hành
    trending: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Tạo index để tối ưu hóa tìm kiếm
topicSchema.index({ name: 'text', description: 'text', tags: 'text' });
topicSchema.index({ category: 1, status: 1, priority: -1 });
topicSchema.index({ status: 1, isVisible: 1, priority: -1 });
topicSchema.index({ createdBy: 1 });

// Virtual để lấy URL đầy đủ của ảnh
topicSchema.virtual('fullImageUrl').get(function () {
    if (this.imageUrl && !this.imageUrl.startsWith('http')) {
        return `${process.env.BASE_URL || 'http://localhost:5000'}${this.imageUrl}`;
    }
    return this.imageUrl;
});

// Middleware để cập nhật updatedBy khi save
topicSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.updatedAt = new Date();
    }
    next();
});

// Static method để lấy chủ đề theo category
topicSchema.statics.findByCategory = function (category, options = {}) {
    const query = { category, status: 'active', isVisible: true };
    return this.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .limit(options.limit || 10);
};

// Static method để lấy chủ đề phổ biến
topicSchema.statics.findPopular = function (limit = 10) {
    return this.find({ status: 'active', isVisible: true })
        .sort({ postCount: -1, viewCount: -1 })
        .limit(limit);
};

// Instance method để tăng view count
topicSchema.methods.incrementViewCount = function () {
    this.viewCount += 1;
    return this.save();
};

// Instance method để cập nhật post count
topicSchema.methods.updatePostCount = async function () {
    const Post = mongoose.model('Post');
    this.postCount = await Post.countDocuments({
        topicId: this._id,
        status: { $ne: 'deleted' }
    });
    return this.save();
};

module.exports = mongoose.model('Topics', topicSchema);

