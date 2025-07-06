const User = require('../models/User');

const updateUserActivity = async (req, res, next) => {
    if (req.user) {
        try {
            // We don't need to wait for this to complete.
            // Fire and forget.
            User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() }).exec();
        } catch (error) {
            console.error('Error updating user activity:', error);
        }
    }
    next();
};

module.exports = updateUserActivity;
