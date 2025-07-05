// File: backend/middlewares/activityLogger.js
// Middleware để tự động log hoạt động người dùng

const UserActivity = require('../models/UserActivity');

/**
 * Middleware để log hoạt động người dùng
 * @param {string} activityType - Loại hoạt động
 * @param {function} getDetails - Function để lấy chi tiết hoạt động từ req
 */
const logActivity = (activityType, getDetails = null) => {
    return async (req, res, next) => {
        // Lưu thông tin để log sau khi response
        req.activityLog = {
            activityType,
            getDetails
        };
        
        next();
    };
};

/**
 * Middleware để thực hiện log sau khi response
 */
const executeActivityLog = async (req, res, next) => {
    // Override res.json để log sau khi response
    const originalJson = res.json;
    
    res.json = function(data) {
        // Gọi response gốc
        const result = originalJson.call(this, data);
        
        // Log hoạt động nếu có
        if (req.activityLog && req.user) {
            setImmediate(async () => {
                try {
                    const { activityType, getDetails } = req.activityLog;
                    
                    let details = {};
                    if (getDetails && typeof getDetails === 'function') {
                        details = getDetails(req, res, data);
                    }
                    
                    // Lấy thông tin session
                    const sessionInfo = {
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('User-Agent'),
                        deviceType: getDeviceType(req.get('User-Agent')),
                        browser: getBrowser(req.get('User-Agent')),
                        os: getOS(req.get('User-Agent')),
                        referrer: req.get('Referrer'),
                        currentUrl: req.originalUrl
                    };
                    
                    const activity = new UserActivity({
                        userId: req.user._id,
                        activityType,
                        details,
                        sessionInfo,
                        timestamp: new Date()
                    });
                    
                    await activity.save();
                } catch (error) {
                    console.error('Lỗi khi log hoạt động:', error);
                }
            });
        }
        
        return result;
    };
    
    next();
};

/**
 * Xác định loại thiết bị từ User-Agent
 */
function getDeviceType(userAgent) {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        return 'mobile';
    }
    
    if (ua.includes('tablet') || ua.includes('ipad')) {
        return 'tablet';
    }
    
    return 'desktop';
}

/**
 * Xác định browser từ User-Agent
 */
function getBrowser(userAgent) {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    
    return 'unknown';
}

/**
 * Xác định OS từ User-Agent
 */
function getOS(userAgent) {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    return 'unknown';
}

/**
 * Log hoạt động đăng nhập
 */
const logLogin = logActivity('login', (req, res, data) => ({
    targetType: 'user',
    metadata: {
        success: data.token ? true : false,
        loginMethod: 'email'
    }
}));

/**
 * Log hoạt động xem bài viết
 */
const logViewPost = logActivity('view_post', (req, res, data) => ({
    targetId: req.params.id,
    targetType: 'post',
    metadata: {
        postTitle: data.data?.title,
        topicId: data.data?.topicId
    }
}));

/**
 * Log hoạt động tạo bài viết
 */
const logCreatePost = logActivity('create_post', (req, res, data) => ({
    targetId: data.data?._id,
    targetType: 'post',
    metadata: {
        postTitle: data.data?.title,
        topicId: data.data?.topicId
    }
}));

/**
 * Log hoạt động xem chủ đề
 */
const logViewTopic = logActivity('view_topic', (req, res, data) => ({
    targetId: req.params.id,
    targetType: 'topic',
    metadata: {
        topicName: data.data?.name,
        category: data.data?.category
    }
}));

/**
 * Log hoạt động tìm kiếm
 */
const logSearch = logActivity('search', (req, res, data) => ({
    metadata: {
        query: req.query.q || req.body.query,
        searchType: req.query.type || 'global',
        resultCount: data.data?.length || 0
    }
}));

/**
 * Log hoạt động bình luận
 */
const logComment = logActivity('comment', (req, res, data) => ({
    targetId: data.data?._id,
    targetType: 'comment',
    metadata: {
        postId: req.body.postId,
        commentContent: req.body.content?.substring(0, 100) // Chỉ lưu 100 ký tự đầu
    }
}));

/**
 * Log hoạt động thích
 */
const logLike = logActivity('like', (req, res, data) => ({
    targetId: req.params.id,
    targetType: req.body.type || 'post',
    metadata: {
        action: data.data?.liked ? 'like' : 'unlike'
    }
}));

/**
 * Log hoạt động xem trang
 */
const logPageView = logActivity('page_view', (req, res, data) => ({
    metadata: {
        page: req.originalUrl,
        method: req.method
    }
}));

module.exports = {
    logActivity,
    executeActivityLog,
    logLogin,
    logViewPost,
    logCreatePost,
    logViewTopic,
    logSearch,
    logComment,
    logLike,
    logPageView
};
