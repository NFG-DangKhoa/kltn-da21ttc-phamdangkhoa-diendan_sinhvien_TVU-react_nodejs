// File: backend/scripts/generateAnalyticsData.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Topic = require('../models/Topic');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const UserActivity = require('../models/UserActivity');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Sample data arrays
const sampleUsers = [
    { fullName: 'Nguyễn Văn An', email: 'an.nguyen@tvu.edu.vn', role: 'user' },
    { fullName: 'Trần Thị Bình', email: 'binh.tran@tvu.edu.vn', role: 'user' },
    { fullName: 'Lê Văn Cường', email: 'cuong.le@tvu.edu.vn', role: 'user' },
    { fullName: 'Phạm Thị Dung', email: 'dung.pham@tvu.edu.vn', role: 'user' },
    { fullName: 'Hoàng Văn Em', email: 'em.hoang@tvu.edu.vn', role: 'user' },
    { fullName: 'Võ Thị Phương', email: 'phuong.vo@tvu.edu.vn', role: 'user' },
    { fullName: 'Đặng Văn Giang', email: 'giang.dang@tvu.edu.vn', role: 'user' },
    { fullName: 'Bùi Thị Hoa', email: 'hoa.bui@tvu.edu.vn', role: 'user' },
    { fullName: 'Lý Văn Inh', email: 'inh.ly@tvu.edu.vn', role: 'user' },
    { fullName: 'Ngô Thị Kim', email: 'kim.ngo@tvu.edu.vn', role: 'user' },
    { fullName: 'Phan Văn Long', email: 'long.phan@tvu.edu.vn', role: 'user' },
    { fullName: 'Tôn Thị Mai', email: 'mai.ton@tvu.edu.vn', role: 'user' },
    { fullName: 'Huỳnh Văn Nam', email: 'nam.huynh@tvu.edu.vn', role: 'user' },
    { fullName: 'Cao Thị Oanh', email: 'oanh.cao@tvu.edu.vn', role: 'user' },
    { fullName: 'Đinh Văn Phúc', email: 'phuc.dinh@tvu.edu.vn', role: 'user' }
];

const sampleTopics = [
    { name: 'Học lập trình', description: 'Thảo luận về lập trình và công nghệ', category: 'Học tập', color: '#2196F3' },
    { name: 'Thực tập sinh', description: 'Chia sẻ kinh nghiệm thực tập', category: 'Thực tập', color: '#4CAF50' },
    { name: 'Tìm việc làm', description: 'Thông tin tuyển dụng và CV', category: 'Việc làm', color: '#FF9800' },
    { name: 'Nghiên cứu khoa học', description: 'Các đề tài nghiên cứu', category: 'Nghiên cứu', color: '#9C27B0' },
    { name: 'Chia sẻ kinh nghiệm', description: 'Kinh nghiệm học tập và làm việc', category: 'Kỹ năng mềm', color: '#F44336' },
    { name: 'Sự kiện trường', description: 'Các hoạt động và sự kiện', category: 'Hoạt động sinh viên', color: '#00BCD4' },
    { name: 'Hỏi đáp học tập', description: 'Giải đáp thắc mắc học tập', category: 'Trao đổi học thuật', color: '#795548' },
    { name: 'Công nghệ mới', description: 'Xu hướng công nghệ mới', category: 'Công nghệ', color: '#607D8B' }
];

const samplePosts = [
    { title: 'Hướng dẫn học React cơ bản cho người mới bắt đầu', content: 'React là một thư viện JavaScript phổ biến...', type: 'discussion' },
    { title: 'Kinh nghiệm thực tập tại công ty IT 6 tháng', content: 'Sau 6 tháng thực tập tại công ty...', type: 'discussion' },
    { title: 'Cách viết CV xin việc hiệu quả cho sinh viên IT', content: 'CV là yếu tố quan trọng...', type: 'discussion' },
    { title: 'Tổng hợp tài liệu học JavaScript từ cơ bản đến nâng cao', content: 'JavaScript là ngôn ngữ lập trình...', type: 'discussion' },
    { title: 'Chia sẻ kinh nghiệm phỏng vấn vào các công ty lớn', content: 'Quá trình phỏng vấn thường gồm...', type: 'discussion' },
    { title: 'Hướng dẫn sử dụng Git và GitHub cho người mới', content: 'Git là hệ thống quản lý phiên bản...', type: 'discussion' },
    { title: 'Làm thế nào để học Python hiệu quả?', content: 'Python là ngôn ngữ lập trình dễ học...', type: 'question' },
    { title: 'Thông báo tuyển dụng thực tập sinh Frontend', content: 'Công ty ABC tuyển thực tập sinh...', type: 'job' },
    { title: 'Seminar về AI và Machine Learning', content: 'Trường tổ chức seminar về AI...', type: 'event' },
    { title: 'Cách tối ưu hóa hiệu suất website', content: 'Hiệu suất website là yếu tố quan trọng...', type: 'discussion' },
    { title: 'Kinh nghiệm học tiếng Anh cho ngành IT', content: 'Tiếng Anh rất quan trọng trong IT...', type: 'discussion' },
    { title: 'Hướng dẫn deploy ứng dụng lên Heroku', content: 'Heroku là platform cloud phổ biến...', type: 'discussion' },
    { title: 'Tìm hiểu về Docker và containerization', content: 'Docker giúp đóng gói ứng dụng...', type: 'discussion' },
    { title: 'Lộ trình học Full-stack Developer', content: 'Full-stack developer cần biết...', type: 'discussion' },
    { title: 'Chia sẻ project cuối khóa hay ho', content: 'Dự án cuối khóa của tôi là...', type: 'discussion' }
];

const activityTypes = ['login', 'view_post', 'create_post', 'comment', 'like', 'search', 'view_topic'];

// Helper functions
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateData() {
    try {
        console.log('🚀 Starting data generation...');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({ email: { $regex: '@tvu.edu.vn' } });
        await Topic.deleteMany({});
        await Post.deleteMany({});
        await Comment.deleteMany({});
        await Like.deleteMany({});
        await UserActivity.deleteMany({});

        // Create users
        console.log('👥 Creating users...');
        const users = [];
        for (const userData of sampleUsers) {
            const user = new User({
                ...userData,
                password: '$2b$10$hashedpassword', // Fake hashed password
                status: 'active',
                isEmailVerified: true,
                lastLogin: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
            });
            await user.save();
            users.push(user);
        }
        console.log(`✅ Created ${users.length} users`);

        // Create topics
        console.log('📚 Creating topics...');
        const topics = [];
        for (const topicData of sampleTopics) {
            const topic = new Topic({
                ...topicData,
                createdBy: getRandomElement(users)._id,
                postCount: 0,
                viewCount: getRandomNumber(100, 1000)
            });
            await topic.save();
            topics.push(topic);
        }
        console.log(`✅ Created ${topics.length} topics`);

        // Create posts
        console.log('📝 Creating posts...');
        const posts = [];
        for (const postData of samplePosts) {
            const topic = getRandomElement(topics);
            const author = getRandomElement(users);
            const post = new Post({
                ...postData,
                authorId: author._id,
                topicId: topic._id,
                status: 'published',
                views: getRandomNumber(50, 500),
                commentCount: getRandomNumber(0, 20),
                likeCount: getRandomNumber(0, 50),
                createdAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
            });
            await post.save();
            posts.push(post);

            // Update topic post count
            topic.postCount += 1;
            await topic.save();
        }
        console.log(`✅ Created ${posts.length} posts`);

        // Create comments
        console.log('💬 Creating comments...');
        const comments = [];
        for (let i = 0; i < 100; i++) {
            const post = getRandomElement(posts);
            const author = getRandomElement(users);
            const comment = new Comment({
                postId: post._id,
                authorId: author._id,
                content: `Đây là bình luận số ${i + 1}. Cảm ơn bạn đã chia sẻ!`,
                likeCount: getRandomNumber(0, 10),
                createdAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
            });
            await comment.save();
            comments.push(comment);
        }
        console.log(`✅ Created ${comments.length} comments`);

        // Create likes
        console.log('❤️ Creating likes...');
        const likes = [];
        for (let i = 0; i < 200; i++) {
            const user = getRandomElement(users);
            const isPostLike = Math.random() > 0.3;

            if (isPostLike) {
                const post = getRandomElement(posts);
                const like = new Like({
                    userId: user._id,
                    postId: post._id,
                    targetType: 'post',
                    createdAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
                });
                await like.save();
                likes.push(like);
            } else {
                const comment = getRandomElement(comments);
                const like = new Like({
                    userId: user._id,
                    commentId: comment._id,
                    targetType: 'comment',
                    createdAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
                });
                await like.save();
                likes.push(like);
            }
        }
        console.log(`✅ Created ${likes.length} likes`);

        console.log('📊 Generating user activities...');
        const activities = [];

        // Generate activities for the last 30 days
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = new Date();

        for (let i = 0; i < 1000; i++) {
            const user = getRandomElement(users);
            const activityType = getRandomElement(activityTypes);
            const timestamp = getRandomDate(startDate, endDate);

            let details = {};

            // Add specific details based on activity type
            switch (activityType) {
                case 'view_post':
                    details = {
                        targetType: 'post',
                        targetId: getRandomElement(posts)._id,
                        duration: getRandomNumber(30, 300) // seconds
                    };
                    break;
                case 'create_post':
                    details = {
                        targetType: 'post',
                        targetId: getRandomElement(posts)._id
                    };
                    break;
                case 'comment':
                    details = {
                        targetType: 'comment',
                        targetId: getRandomElement(comments)._id,
                        postId: getRandomElement(posts)._id
                    };
                    break;
                case 'like':
                    details = {
                        targetType: Math.random() > 0.5 ? 'post' : 'comment',
                        targetId: Math.random() > 0.5 ? getRandomElement(posts)._id : getRandomElement(comments)._id
                    };
                    break;
                case 'search':
                    const searchTerms = ['React', 'JavaScript', 'Python', 'thực tập', 'việc làm', 'học tập', 'lập trình'];
                    details = {
                        searchQuery: getRandomElement(searchTerms),
                        resultsCount: getRandomNumber(0, 50)
                    };
                    break;
                case 'view_topic':
                    details = {
                        targetType: 'topic',
                        targetId: getRandomElement(topics)._id,
                        duration: getRandomNumber(60, 600)
                    };
                    break;
                case 'login':
                    details = {
                        loginMethod: 'email'
                    };
                    break;
            }

            const activity = new UserActivity({
                userId: user._id,
                activityType,
                timestamp,
                details,
                sessionInfo: {
                    ipAddress: `192.168.1.${getRandomNumber(1, 254)}`,
                    userAgent: getRandomElement([
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
                    ]),
                    device: getRandomElement(['desktop', 'mobile', 'tablet']),
                    browser: getRandomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
                    os: getRandomElement(['Windows', 'macOS', 'Linux', 'iOS', 'Android'])
                }
            });

            await activity.save();
            activities.push(activity);
        }
        console.log(`✅ Created ${activities.length} user activities`);

        // Update post and topic view counts based on activities
        console.log('🔄 Updating view counts...');
        const viewActivities = activities.filter(a => a.activityType === 'view_post');
        for (const activity of viewActivities) {
            if (activity.details.targetId) {
                await Post.findByIdAndUpdate(activity.details.targetId, { $inc: { views: 1 } });
            }
        }

        const topicViewActivities = activities.filter(a => a.activityType === 'view_topic');
        for (const activity of topicViewActivities) {
            if (activity.details.targetId) {
                await Topic.findByIdAndUpdate(activity.details.targetId, { $inc: { viewCount: 1 } });
            }
        }

        console.log('✅ Updated view counts');

    } catch (error) {
        console.error('❌ Error generating data:', error);
    }
}

module.exports = { generateData };

// Run if called directly
if (require.main === module) {
    generateData().then(() => {
        console.log('🎉 Data generation completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}
