const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

async function testAuth() {
    try {
        await mongoose.connect('mongodb://localhost:27017/student_forum_db');
        console.log('Connected to MongoDB');

        // Lấy một user từ database
        const user = await User.findOne({});
        if (!user) {
            console.log('No users found in database');
            return;
        }

        console.log('Found user:', {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            type: typeof user._id
        });

        // Tạo JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                fullName: user.fullName
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        console.log('Generated token:', token);

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Decoded token:', decoded);
        console.log('Decoded ID type:', typeof decoded.id);

        // Test với giá trị "1"
        console.log('\n--- Testing with value "1" ---');
        try {
            const testUser = await User.findById("1");
            console.log('User found with ID "1":', testUser);
        } catch (error) {
            console.log('Error finding user with ID "1":', error.message);
        }

        try {
            const testUser = await User.findById(1);
            console.log('User found with ID 1:', testUser);
        } catch (error) {
            console.log('Error finding user with ID 1:', error.message);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testAuth();
