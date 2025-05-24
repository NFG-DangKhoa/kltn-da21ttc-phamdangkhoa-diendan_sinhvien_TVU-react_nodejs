// File: backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    address: String,
    avatar: String,
    role: { type: String, enum: ['user', 'editor', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Users', userSchema);

