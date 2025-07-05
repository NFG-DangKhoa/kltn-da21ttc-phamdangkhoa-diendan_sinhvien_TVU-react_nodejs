// File: backend/scripts/createAdminUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);

async function createAdminUser() {
    try {
        console.log('🔧 Creating admin user...');

        // Delete existing admin if exists
        await User.deleteOne({ email: 'admin@tvu.edu.vn' });
        console.log('🗑️ Deleted existing admin user if any');

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const adminUser = new User({
            fullName: 'Administrator',
            email: 'admin@tvu.edu.vn',
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            isEmailVerified: true,
            lastLogin: new Date()
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@tvu.edu.vn');
        console.log('Password: admin123');
        console.log('Role: admin');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run if called directly
if (require.main === module) {
    createAdminUser().then(() => {
        console.log('🎉 Admin user creation completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}

module.exports = { createAdminUser };
