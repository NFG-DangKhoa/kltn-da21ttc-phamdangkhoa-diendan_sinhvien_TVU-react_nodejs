// File: backend/middlewares/updateTopicPostCount.js
// Middleware để tự động cập nhật postCount khi có thay đổi bài viết

const Topic = require('../models/Topic');
const Post = require('../models/Post');

/**
 * Cập nhật postCount cho một chủ đề cụ thể
 * @param {ObjectId} topicId - ID của chủ đề
 */
async function updateTopicPostCount(topicId) {
    try {
        if (!topicId) return;
        
        const postCount = await Post.countDocuments({ 
            topicId: topicId,
            status: { $ne: 'deleted' }
        });
        
        await Topic.findByIdAndUpdate(topicId, { postCount });
        console.log(`✅ Đã cập nhật postCount cho topic ${topicId}: ${postCount}`);
    } catch (error) {
        console.error(`❌ Lỗi khi cập nhật postCount cho topic ${topicId}:`, error);
    }
}

/**
 * Middleware cho Post model - cập nhật postCount khi tạo bài viết mới
 */
function addPostSaveMiddleware() {
    const Post = require('../models/Post');
    
    // Middleware sau khi save (tạo mới)
    Post.schema.post('save', async function(doc) {
        if (this.isNew && doc.topicId) {
            await updateTopicPostCount(doc.topicId);
        }
    });
    
    // Middleware sau khi update
    Post.schema.post('findOneAndUpdate', async function(doc) {
        if (doc && doc.topicId) {
            await updateTopicPostCount(doc.topicId);
        }
    });
    
    // Middleware sau khi delete
    Post.schema.post('findOneAndDelete', async function(doc) {
        if (doc && doc.topicId) {
            await updateTopicPostCount(doc.topicId);
        }
    });
    
    // Middleware sau khi remove
    Post.schema.post('remove', async function(doc) {
        if (doc && doc.topicId) {
            await updateTopicPostCount(doc.topicId);
        }
    });
}

/**
 * Khởi tạo middleware
 */
function initializePostCountMiddleware() {
    try {
        addPostSaveMiddleware();
        console.log('✅ Đã khởi tạo middleware cập nhật postCount');
    } catch (error) {
        console.error('❌ Lỗi khi khởi tạo middleware postCount:', error);
    }
}

module.exports = {
    updateTopicPostCount,
    initializePostCountMiddleware
};
