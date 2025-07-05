const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
require('dotenv').config({ path: '../.env' });

const updateUserPostCounts = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/dien_dan_TVU', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to database');

        const users = await User.find({});
        console.log(`Found ${users.length} users to update.`);

        for (const user of users) {
            const postCount = await Post.countDocuments({ authorId: user._id });
            user.postsCount = postCount;
            await user.save();
            console.log(`Updated post count for ${user.username} to ${postCount}`);
        }

        console.log('Finished updating all user post counts.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating user post counts:', error);
        process.exit(1);
    }
};

updateUserPostCounts();
