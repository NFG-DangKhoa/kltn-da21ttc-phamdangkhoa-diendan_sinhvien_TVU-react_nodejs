// File: backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    address: String,
    avatarUrl: { type: String, default: '' }, // ✅ Đảm bảo trường này tồn tại và đúng tên
    role: { type: String, enum: ['user', 'editor', 'admin'], default: 'user' },

    // Các trường mới cho quản lý tài khoản
    status: {
        type: String,
        enum: ['active', 'suspended', 'banned'],
        default: 'active'
    },
    warnings: [{
        message: String,
        reason: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    suspensionInfo: {
        reason: String,
        suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        suspendedAt: Date,
        suspendedUntil: Date
    },
    banInfo: {
        reason: String,
        bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        bannedAt: Date,
        isPermanent: { type: Boolean, default: false }
    },
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

