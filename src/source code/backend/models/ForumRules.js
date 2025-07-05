const mongoose = require('mongoose');

const forumRulesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Quy định diễn đàn'
    },
    content: {
        type: String,
        required: true,
        default: `
# Quy định diễn đàn sinh viên TVU

## 1. Quy định chung
- Tôn trọng các thành viên khác trong diễn đàn
- Không sử dụng ngôn từ thô tục, xúc phạm
- Không spam hoặc đăng nội dung không liên quan

## 2. Quy định về nội dung
- Nội dung phải phù hợp với chủ đề diễn đàn
- Không đăng nội dung vi phạm pháp luật
- Không chia sẻ thông tin cá nhân của người khác

## 3. Quy định về hình ảnh
- Không đăng hình ảnh không phù hợp
- Tôn trọng bản quyền hình ảnh
- Hình ảnh phải liên quan đến nội dung bài viết

## 4. Hình phạt
- Cảnh báo lần đầu
- Khóa tài khoản tạm thời
- Khóa tài khoản vĩnh viễn đối với vi phạm nghiêm trọng

## 5. Liên hệ
Mọi thắc mắc xin liên hệ admin qua hệ thống chat.
        `.trim()
    },
    isActive: {
        type: Boolean,
        default: true
    },
    version: {
        type: Number,
        default: 1
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt before saving
forumRulesSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get current active rules
forumRulesSchema.statics.getCurrentRules = function() {
    return this.findOne({ isActive: true }).sort({ version: -1 });
};

module.exports = mongoose.model('ForumRules', forumRulesSchema);
