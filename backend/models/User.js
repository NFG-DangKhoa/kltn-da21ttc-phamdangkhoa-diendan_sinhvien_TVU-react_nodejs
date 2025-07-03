// File: backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    username: { type: String, unique: true, sparse: true },
    phoneNumber: String,
    isPhoneNumberHidden: { type: Boolean, default: false },
    bio: String,
    address: String,
    avatarUrl: { type: String, default: '' },
    coverPhotoUrl: { type: String, default: '' }, // New field for cover photo
    role: { type: String, enum: ['user', 'editor', 'admin'], default: 'user' },

    // Google OAuth fields
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    isEmailVerified: { type: Boolean, default: false },

    // Email verification and password reset
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Các trường mới cho quản lý tài khoản
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'banned'],
        default: 'pending'
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

    // Forum rules agreement
    rulesAgreedVersion: {
        type: Number,
        default: 0 // 0 means never agreed to any rules
    },
    rulesAgreedAt: {
        type: Date
    },

    // Real-time status
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },

    postsCount: { type: Number, default: 0 },

    activityVisibility: {
        posts: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        likes: { type: Boolean, default: true },
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
