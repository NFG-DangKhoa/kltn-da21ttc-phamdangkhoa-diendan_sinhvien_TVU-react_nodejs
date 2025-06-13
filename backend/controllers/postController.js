const Post = require('../models/Post');
const Comment = require('../models/Comment');
const CommentLike = require('../models/CommentLike');
const Rating = require('../models/Rating');
const Like = require('../models/Like');
const Image = require('../models/Image');
const fs = require('fs'); // Để tương tác với hệ thống tệp
const path = require('path'); // Để xử lý đường dẫn tệp
const { getPostThumbnail } = require('../utils/imageExtractor');

// Thêm biến io để sử dụng Socket.IO
let io;

// Hàm để thiết lập Socket.IO (gọi một lần khi ứng dụng khởi động)
exports.setIo = (socketIoInstance) => {
    io = socketIoInstance;
};

// Lấy danh sách bài viết
exports.getPosts = async (req, res) => {
    try {
        const authorId = req.query.authorId;
        let query = {};

        if (authorId) {
            query.author = authorId;
        }

        const posts = await Post.find(query)
            .populate('author', 'username fullName avatarUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
        res.status(500).json({ message: "Không thể lấy bài viết" });
    }
};

// Lấy bài viết gần đây
exports.getRecentPosts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;

        const posts = await Post.find()
            .populate('authorId', 'fullName')
            .populate('topicId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Mock data nếu không có posts trong database
        if (!posts || posts.length === 0) {
            const mockPosts = [
                {
                    _id: '1',
                    title: 'Hướng dẫn học React cho người mới bắt đầu',
                    content: 'React là một thư viện JavaScript phổ biến...',
                    authorId: { fullName: 'Nguyễn Văn A' },
                    topicId: { name: 'Lập trình' },
                    createdAt: new Date(),
                    likeCount: 15,
                    commentCount: 8
                },
                {
                    _id: '2',
                    title: 'Tips học tập hiệu quả cho sinh viên',
                    content: 'Những phương pháp học tập được chứng minh...',
                    authorId: { fullName: 'Trần Thị B' },
                    topicId: { name: 'Học tập' },
                    createdAt: new Date(),
                    likeCount: 23,
                    commentCount: 12
                }
            ];
            return res.status(200).json(mockPosts);
        }

        // Add thumbnail image to each post
        const postsWithThumbnails = posts.map(post => ({
            ...post,
            thumbnailImage: getPostThumbnail(post),
            excerpt: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''
        }));

        res.status(200).json(postsWithThumbnails);
    } catch (error) {
        console.error("Lỗi khi lấy bài viết gần đây:", error);
        res.status(500).json({ message: "Không thể lấy bài viết gần đây" });
    }
};

// Lấy bài viết theo topic (deprecated - use getPostsByTopicWithDetails)
// exports.getPostsByTopic = async (req, res) => {
//     try {
//         const topicId = req.params.topicId;
//         const posts = await Post.find({ topic: topicId })
//             .populate('author', 'username fullName avatarUrl')
//             .sort({ createdAt: -1 });

//         res.status(200).json(posts);
//     } catch (error) {
//         console.error("Lỗi khi lấy bài viết theo topic:", error);
//         res.status(500).json({ message: "Không thể lấy bài viết từ topic" });
//     }
// };

// Lấy bài viết theo topic id
exports.getPostsByTopicWithDetails = async (req, res) => {
    try {
        const { topicId } = req.params;

        console.log(`🔍 DEBUG: Fetching posts for topicId: ${topicId}`);
        console.log(`🔍 DEBUG: topicId type: ${typeof topicId}`);

        // Lấy bài viết và populate thông tin tác giả, chủ đề
        // Bao gồm luôn commentCount, likeCount, ratingCount từ Post model
        const posts = await Post.find({ topicId })
            .populate('authorId', 'fullName')
            .populate('topicId', 'name')
            .select('title content commentCount likeCount ratingCount') // Chọn rõ ràng các trường mong muốn
            .lean(); // Sử dụng .lean() để nhận về plain JavaScript objects

        console.log(`🔍 DEBUG: Found ${posts.length} posts for topicId ${topicId}`);
        posts.forEach((post, index) => {
            console.log(`  ${index + 1}. ${post.title} (topicId: ${post.topicId?._id})`);
        });

        if (!posts || posts.length === 0) {
            return res.status(200).json([]); // Trả về mảng rỗng và status 200 nếu không tìm thấy bài viết
        }

        const detailedPosts = await Promise.all(posts.map(async (post) => {
            // Lấy bình luận gốc (có populate tác giả)
            const comments = await Comment.find({ postId: post._id, parentCommentId: null })
                .populate('authorId', 'fullName')
                .lean();

            // Duyệt từng comment để lấy replies và likeCount
            const detailedComments = await Promise.all(comments.map(async (comment) => {
                const replies = await Comment.find({ parentCommentId: comment._id })
                    .populate('authorId', 'fullName')
                    .lean();

                const detailedReplies = await Promise.all(replies.map(async (reply) => {
                    const replyLikes = await Like.find({ targetId: reply._id, targetType: 'comment' }).lean();
                    return {
                        ...reply,
                        likeCount: replyLikes.length, // Vẫn tính likeCount cho từng reply
                    };
                }));

                const commentLikes = await Like.find({ targetId: comment._id, targetType: 'comment' }).lean();

                return {
                    ...comment,
                    likeCount: commentLikes.length, // Vẫn tính likeCount cho từng comment
                    replies: detailedReplies,
                    replyCount: detailedReplies.length, // Vẫn tính replyCount cho từng comment
                };
            }));

            // Lấy hình ảnh của bài viết
            const images = await Image.find({ postId: post._id }).lean();
            const mainImage = images.find(img => img.isMain) || null;
            const otherImages = images.filter(img => !img.isMain);

            // Lấy đánh giá
            const ratings = await Rating.find({ postId: post._id }).populate('userId', 'fullName').lean();
            const ratedUsers = ratings.map(r => r.userId);

            // Lấy lượt thích bài viết
            const likes = await Like.find({ targetId: post._id, targetType: 'post' }).populate('userId', 'fullName').lean();
            const likedUsers = likes.map(like => like.userId);

            // Trả về một đối tượng mới với tất cả các thông tin đã lấy
            return {
                ...post, // Bao gồm title, content, commentCount, likeCount, ratingCount từ Post model
                comments: detailedComments,
                ratedUsers,
                ratings, // Trả về toàn bộ mảng ratings nếu bạn muốn chi tiết
                likes,   // Trả về toàn bộ mảng likes nếu bạn muốn chi tiết
                likedUsers,
                images,
                mainImage,
                otherImages,
                thumbnailImage: getPostThumbnail(post), // Add thumbnail from content
                excerpt: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''
            };
        }));

        res.status(200).json(detailedPosts);

    } catch (err) {
        console.error('Lỗi khi lấy chi tiết bài viết theo topic ID:', err);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: err.message });
    }
};

// Hàm này chỉ có chức năng lấy dữ liệu và không thực hiện bất kỳ cập nhật nào vào cơ sở dữ liệu.
exports.getPostByTopicAndPostIdWithDetails = async (req, res) => {
    try {
        const { topicId, postId } = req.params;

        // 1. Tìm bài viết và populate thông tin tác giả, topic
        // Đây là thao tác đọc dữ liệu
        const post = await Post.findOne({ _id: postId, topicId })
            .populate('authorId', 'fullName avatar') // Thêm avatar cho tác giả bài viết
            .populate('topicId', 'name');

        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        // 2. Lấy TẤT CẢ bình luận liên quan đến bài viết này (gốc và phản hồi)
        // Mặc dù chúng ta không dùng `allCommentsForPost.length` cho `post.commentCount` nữa,
        // chúng ta vẫn cần lấy tất cả bình luận để hiển thị chi tiết các bình luận và phản hồi.
        const allCommentsForPost = await Comment.find({ postId: post._id })
            .populate('authorId', 'fullName avatar') // Populate tác giả của bình luận
            .populate('parentCommentId', 'authorId content'); // Populate thông tin của bình luận cha nếu có

        // 3. Lọc bình luận gốc
        const rootComments = allCommentsForPost.filter(comment => comment.parentCommentId === null);

        // 4. Build nested comment tree using the same logic as commentController
        const buildCommentTree = async (comments, allReplies) => {
            // Build nested structure
            const commentMap = new Map();

            // Add root comments to map
            comments.forEach(comment => {
                commentMap.set(comment._id.toString(), {
                    ...comment.toObject(),
                    replies: []
                });
            });

            // Add replies to map
            allReplies.forEach(reply => {
                commentMap.set(reply._id.toString(), {
                    ...reply.toObject(),
                    replies: []
                });
            });

            // Build tree structure
            allReplies.forEach(reply => {
                const parentId = reply.parentCommentId.toString();
                if (commentMap.has(parentId)) {
                    commentMap.get(parentId).replies.push(commentMap.get(reply._id.toString()));
                }
            });

            // Return root comments with nested replies
            return comments.map(comment => commentMap.get(comment._id.toString()));
        };

        // Get all replies for the post (not just direct replies)
        const allReplies = allCommentsForPost.filter(comment => comment.parentCommentId !== null);

        // Build the nested comment tree
        const detailedComments = await buildCommentTree(rootComments, allReplies);

        // Add like information to all comments (using CommentLike model)
        const allCommentIds = [...rootComments.map(c => c._id), ...allReplies.map(r => r._id)];

        // Get like counts for all comments
        const commentLikeCounts = await CommentLike.aggregate([
            { $match: { commentId: { $in: allCommentIds } } },
            { $group: { _id: '$commentId', count: { $sum: 1 } } }
        ]);

        const likeCountMap = new Map();
        commentLikeCounts.forEach(item => {
            likeCountMap.set(item._id.toString(), item.count);
        });

        // Get user's liked comments if user is authenticated
        let userLikedCommentIds = new Set();
        if (req.user && req.user.id) {
            const userLikes = await CommentLike.find({
                commentId: { $in: allCommentIds },
                userId: req.user.id
            }).lean();
            userLikedCommentIds = new Set(userLikes.map(like => like.commentId.toString()));
        }

        // Update like counts and isLiked status in the comment tree
        const updateLikeCounts = (comments) => {
            return comments.map(comment => {
                const updatedComment = {
                    ...comment,
                    likeCount: likeCountMap.get(comment._id.toString()) || 0,
                    isLiked: userLikedCommentIds.has(comment._id.toString())
                };
                if (updatedComment.replies && updatedComment.replies.length > 0) {
                    updatedComment.replies = updateLikeCounts(updatedComment.replies);
                }
                return updatedComment;
            });
        };

        const finalDetailedComments = updateLikeCounts(detailedComments);

        // 5. Lấy thông tin về Rating
        const ratings = await Rating.find({ postId: post._id }).populate('userId', 'fullName avatar');
        const ratedUsers = ratings.map(r => r.userId);
        const ratingCount = ratings.length; // Tính toán ratingCount từ số lượng ratings lấy được

        // 6. Lấy thông tin về Like của bài viết
        const likes = await Like.find({ postId: post._id, targetType: 'post' }).populate('userId', 'fullName avatar');
        const likeCount = likes.length; // Tính toán likeCount từ số lượng likes lấy được
        const likedUsers = likes.map(like => like.userId);

        // 6.1. Kiểm tra xem user hiện tại đã thích bài viết chưa
        let isLikedByCurrentUser = false;
        if (req.user && req.user.id) {
            isLikedByCurrentUser = likes.some(like => like.userId._id.toString() === req.user.id.toString());
        }

        // 7. Lấy thông tin về Image
        const images = await Image.find({ postId: post._id });
        const mainImage = images.find(img => img.isMain) || null;
        const otherImages = images.filter(img => !img.isMain);

        // 8. Đảm bảo KHÔNG có thao tác cập nhật vào DB ở đây.
        // Các trường đếm (commentCount, likeCount, ratingCount) được lấy trực tiếp từ đối tượng 'post'
        // hoặc được tính toán dựa trên dữ liệu đã đọc (như likeCount, ratingCount).

        // 9. Chuẩn bị đối tượng bài viết chi tiết để gửi về client
        const detailedPost = {
            ...post.toObject(), // Sử dụng post.toObject() để lấy đối tượng thuần túy
            comments: finalDetailedComments, // Các bình luận gốc kèm phản hồi đã được xử lý với like counts
            ratedUsers,
            ratingCount, // Sử dụng ratingCount đã tính toán
            likeCount, // Sử dụng likeCount đã tính toán
            likedUsers,
            isLikedByCurrentUser, // Thêm thông tin user đã thích hay chưa
            commentCount: post.commentCount, // Lấy commentCount trực tiếp từ post model
            images,
            mainImage,
            otherImages,
            thumbnailImage: getPostThumbnail(post), // Add thumbnail from content
            excerpt: post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''
        };

        // Gửi dữ liệu đã được xử lý về cho frontend
        res.json(detailedPost);
    } catch (err) {
        console.error('Lỗi server khi lấy chi tiết bài viết:', err);
        res.status(500).json({ message: 'Đã xảy ra lỗi server' });
    }
};

// Tạo bài viết mới và lưu ảnh liên kết
exports.createPost = async (req, res) => {
    try {
        const { authorId, title, content, topicId, tags } = req.body;

        console.log('🔄 Creating post with image processing...');
        console.log('📝 Original content preview:', content.substring(0, 500));
        console.log('🔍 Content includes img tags:', content.includes('<img'));
        console.log('🔍 Content includes data:', content.includes('data:'));

        // 1. Process images first (convert data URLs and external URLs to files)
        let finalContent = content;
        const { processImagesForPost } = require('./uploadController');
        const axios = require('axios');

        // Extract and process data URLs in content
        const dataUrlRegex = /data:image\/([a-zA-Z]*);base64,([^"']*)/g;
        const dataUrls = [];
        let match;

        while ((match = dataUrlRegex.exec(content)) !== null) {
            dataUrls.push({
                fullMatch: match[0],
                format: match[1],
                data: match[2],
                type: 'dataUrl'
            });
        }

        // Extract and process external image URLs
        const externalUrlRegex = /<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp|svg|bmp)(?:\?[^"']*)?)[^>]*>/gi;
        const externalUrls = [];
        let externalMatch;

        while ((externalMatch = externalUrlRegex.exec(content)) !== null) {
            externalUrls.push({
                fullMatch: externalMatch[0],
                url: externalMatch[1],
                type: 'external'
            });
        }

        console.log(`📸 Found ${dataUrls.length} data URLs and ${externalUrls.length} external URLs to process`);

        // Process each data URL and save to public/upload
        for (let i = 0; i < dataUrls.length; i++) {
            const { fullMatch, format, data } = dataUrls[i];

            try {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `${uniqueSuffix}.${format}`;
                const filepath = path.join(__dirname, '../public/upload', filename);

                // Convert base64 to buffer and save
                const buffer = Buffer.from(data, 'base64');
                fs.writeFileSync(filepath, buffer);

                // Create new URL with full server path
                const newUrl = `http://localhost:5000/upload/${filename}`;

                // Replace data URL with file URL in content
                finalContent = finalContent.replace(fullMatch, newUrl);

                console.log(`✅ Processed data URL ${i + 1}: ${filename} (${buffer.length} bytes)`);

            } catch (imageError) {
                console.error(`❌ Error processing data URL ${i + 1}:`, imageError);
            }
        }

        // Process each external URL and download to public/upload
        for (let i = 0; i < externalUrls.length; i++) {
            const { fullMatch, url } = externalUrls[i];

            try {
                console.log(`🌐 Downloading external image ${i + 1}: ${url}`);

                // Download image from external URL
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 10000, // 10 second timeout
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                // Determine file extension from URL or content-type
                const urlParts = url.split('.');
                let extension = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
                if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension.toLowerCase())) {
                    const contentType = response.headers['content-type'];
                    extension = contentType ? contentType.split('/')[1] : 'jpg';
                }

                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `external-${uniqueSuffix}.${extension}`;
                const filepath = path.join(__dirname, '../public/upload', filename);

                // Save downloaded image
                fs.writeFileSync(filepath, response.data);

                // Create new URL with full server path
                const newUrl = `http://localhost:5000/upload/${filename}`;

                // Replace external URL with local file URL in content
                finalContent = finalContent.replace(url, newUrl);

                console.log(`✅ Downloaded external image ${i + 1}: ${filename} (${response.data.length} bytes)`);

            } catch (imageError) {
                console.error(`❌ Error downloading external image ${i + 1} from ${url}:`, imageError.message);
                // Keep original URL if download fails
                console.log(`⚠️ Keeping original external URL: ${url}`);
            }
        }

        // 2. Tạo bài viết với content đã được process
        const newPost = new Post({
            authorId,
            title,
            content: finalContent,
            topicId,
            tags,
        });

        const savedPost = await newPost.save();

        // 3. Tìm tất cả URL ảnh trong nội dung (sau khi process)
        const imageUrls = extractImageUrls(finalContent);

        // 4. Lưu ảnh gắn với post
        const imageDocs = await Promise.all(
            imageUrls.map(url => {
                return Image.create({
                    refType: 'post',
                    refId: savedPost._id,
                    url,
                });
            })
        );

        console.log(`✅ Post created with ${imageDocs.length} images saved to public/upload`);

        // Populate post với thông tin author và topic
        await savedPost.populate([
            { path: 'authorId', select: 'fullName username' },
            { path: 'topicId', select: 'name' }
        ]);

        // Gửi notification cho admin
        if (global.notificationService) {
            await global.notificationService.notifyPostCreated(
                savedPost._id,
                authorId,
                savedPost.title,
                savedPost.topicId.name
            );
        }

        // Phát sự kiện Socket.IO khi có bài viết mới
        if (io) {
            io.emit('newPost', savedPost);
        }

        res.status(201).json({
            message: 'Tạo bài viết thành công',
            post: savedPost,
            images: imageDocs,
            processedImages: dataUrls.length
        });
    } catch (error) {
        console.error('Lỗi tạo bài viết:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo bài viết' });
    }
};

// **Thêm hàm createPostWithImages ở đây**
exports.createPostWithImages = async (req, res) => {
    // This function can be the same as createPost if it handles images within the 'content' field.
    // If it's intended for a different image upload mechanism (e.g., direct file upload),
    // you'll need to adjust the logic. For now, assuming it's similar to createPost.
    try {
        const { authorId, title, content, topicId, tags } = req.body;

        const newPost = new Post({
            authorId,
            title,
            content,
            topicId,
            tags,
        });

        const savedPost = await newPost.save();

        const imageUrls = extractImageUrls(content);

        const imageDocs = await Promise.all(
            imageUrls.map(url => {
                return Image.create({
                    refType: 'post',
                    refId: savedPost._id,
                    url,
                });
            })
        );

        if (io) {
            io.emit('newPost', savedPost);
        }

        res.status(201).json({
            message: 'Tạo bài viết với ảnh thành công',
            post: savedPost,
            images: imageDocs,
        });
    } catch (error) {
        console.error('Lỗi tạo bài viết với ảnh:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo bài viết với ảnh' });
    }
};


// Lấy tất cả bài viết theo topicId
exports.getPostsByTopic = async (req, res) => {
    try {
        const posts = await Post.find({ topicId: req.params.topicId }).populate('authorId', 'fullName'); // Use fullName for author name
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: err.message });
    }
};

// Lấy chi tiết bài viết theo id
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('authorId', 'fullName'); // Use fullName for author name
        if (!post) return res.status(404).json({ message: 'Bài viết không tồn tại' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: err.message });
    }
};

// Cập nhật bài viết và quản lý ảnh liên kết
exports.updatePost = async (req, res) => {
    try {
        const postId = req.params.id; // Changed from req.params.postId for consistency with other functions
        const userId = req.user.id; // Assuming req.user.id is available from authentication middleware

        // 1. Tìm bài viết cần cập nhật
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tìm thấy' });
        }
        if (post.authorId.toString() !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bài viết này' });
        }

        const oldContent = post.content || ''; // Lưu nội dung cũ để quản lý ảnh
        let { title, content, topicId, tags } = req.body;

        console.log('🔄 Updating post with image processing...');

        // 2. Process new images in content (convert data URLs and external URLs to files)
        let finalContent = content;
        if (content !== undefined) {
            const dataUrlRegex = /data:image\/([a-zA-Z]*);base64,([^"']*)/g;
            const dataUrls = [];
            let match;

            while ((match = dataUrlRegex.exec(content)) !== null) {
                dataUrls.push({
                    fullMatch: match[0],
                    format: match[1],
                    data: match[2],
                    type: 'dataUrl'
                });
            }

            // Extract and process external image URLs
            const externalUrlRegex = /<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp|svg|bmp)(?:\?[^"']*)?)[^>]*>/gi;
            const externalUrls = [];
            let externalMatch;

            while ((externalMatch = externalUrlRegex.exec(content)) !== null) {
                externalUrls.push({
                    fullMatch: externalMatch[0],
                    url: externalMatch[1],
                    type: 'external'
                });
            }

            console.log(`📸 Found ${dataUrls.length} data URLs and ${externalUrls.length} external URLs to process`);

            // Process each data URL and save to public/upload
            for (let i = 0; i < dataUrls.length; i++) {
                const { fullMatch, format, data } = dataUrls[i];

                try {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const filename = `${uniqueSuffix}.${format}`;
                    const filepath = path.join(__dirname, '../public/upload', filename);

                    // Convert base64 to buffer and save
                    const buffer = Buffer.from(data, 'base64');
                    fs.writeFileSync(filepath, buffer);

                    // Create new URL with full server path
                    const newUrl = `http://localhost:5000/upload/${filename}`;

                    // Replace data URL with file URL in content
                    finalContent = finalContent.replace(fullMatch, newUrl);

                    console.log(`✅ Processed new data URL ${i + 1}: ${filename} (${buffer.length} bytes)`);

                } catch (imageError) {
                    console.error(`❌ Error processing new data URL ${i + 1}:`, imageError);
                }
            }

            // Process each external URL and download to public/upload
            for (let i = 0; i < externalUrls.length; i++) {
                const { fullMatch, url } = externalUrls[i];

                try {
                    console.log(`🌐 Downloading external image ${i + 1}: ${url}`);

                    // Download image from external URL
                    const response = await axios.get(url, {
                        responseType: 'arraybuffer',
                        timeout: 10000, // 10 second timeout
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    // Determine file extension from URL or content-type
                    const urlParts = url.split('.');
                    let extension = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
                    if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension.toLowerCase())) {
                        const contentType = response.headers['content-type'];
                        extension = contentType ? contentType.split('/')[1] : 'jpg';
                    }

                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const filename = `external-${uniqueSuffix}.${extension}`;
                    const filepath = path.join(__dirname, '../public/upload', filename);

                    // Save downloaded image
                    fs.writeFileSync(filepath, response.data);

                    // Create new URL with full server path
                    const newUrl = `http://localhost:5000/upload/${filename}`;

                    // Replace external URL with local file URL in content
                    finalContent = finalContent.replace(url, newUrl);

                    console.log(`✅ Downloaded external image ${i + 1}: ${filename} (${response.data.length} bytes)`);

                } catch (imageError) {
                    console.error(`❌ Error downloading external image ${i + 1} from ${url}:`, imageError.message);
                    // Keep original URL if download fails
                    console.log(`⚠️ Keeping original external URL: ${url}`);
                }
            }
        }

        // 3. Cập nhật các trường của bài viết
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = finalContent;
        if (topicId !== undefined) post.topicId = topicId;
        if (tags !== undefined) post.tags = tags;

        post.updatedAt = Date.now(); // Cập nhật thời gian chỉnh sửa
        const savedPost = await post.save(); // Lưu các thay đổi vào DB

        // --- Logic quản lý ảnh vật lý và trong DB sau khi cập nhật bài viết ---

        // Trích xuất URL ảnh cũ và mới từ nội dung
        const oldImageUrls = extractImageUrls(oldContent);
        const newImageUrls = extractImageUrls(savedPost.content);

        // 1. Xác định các URL ảnh đã bị xóa khỏi nội dung bài viết
        const removedImageUrls = oldImageUrls.filter(url => !newImageUrls.includes(url));

        // 2. Xóa các tệp ảnh vật lý đã bị xóa khỏi thư mục public/upload
        await Promise.all(removedImageUrls.map(async url => {
            const filename = extractFilenameFromUrl(url);
            // Chỉ xóa nếu là ảnh cục bộ
            if (filename && isLocalImageUrl(url)) {
                await deletePhysicalImage(filename);
            }
        }));

        // 3. Cập nhật các bản ghi ảnh trong cơ sở dữ liệu (xóa các bản ghi cũ, thêm các bản ghi mới)
        await Image.deleteMany({ refType: 'post', refId: savedPost._id }); // Xóa tất cả ảnh liên kết cũ

        const imageDocs = await Promise.all(
            newImageUrls.map(async url => {
                // Tạo bản ghi mới cho từng ảnh trong nội dung cập nhật
                return Image.create({
                    refType: 'post',
                    refId: savedPost._id,
                    url,
                });
            })
        );

        // --- Populate thông tin tác giả trước khi gửi phản hồi và emit Socket.IO ---
        // Tìm lại bài viết và populate thông tin tác giả
        const populatedPost = await Post.findById(savedPost._id)
            .populate('authorId', 'fullName avatar'); // Thêm các trường của tác giả bạn muốn hiển thị

        // Phát sự kiện Socket.IO khi có bài viết được cập nhật
        // Gửi đối tượng bài viết đã được populate để client nhận đủ thông tin
        if (io) {
            io.emit('updatedPost', populatedPost);
        }

        // Gửi phản hồi thành công về client
        // Trả về đối tượng bài viết đã được populate
        res.json({
            message: 'Bài viết và ảnh liên kết đã được cập nhật thành công',
            post: populatedPost, // Gửi bài viết đã có thông tin tác giả đầy đủ
            images: imageDocs,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật bài viết', error: error.message });
    }
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id; // Changed from req.params.postId for consistency with other functions
        const userId = req.user.id; // Assuming req.user.id is available from authentication middleware

        const post = await Post.findById(postId);
        if (!post) {
            console.warn(`Bài viết ${postId} không tìm thấy.`);
            return res.status(404).json({ message: 'Bài viết không tìm thấy' });
        }
        if (post.authorId.toString() !== userId) {
            console.warn(`Người dùng ${userId} không có quyền xóa bài viết ${postId}`);
            return res.status(403).json({ message: 'Bạn không có quyền xóa bài viết này' });
        }

        // 1. Trích xuất URL ảnh từ nội dung bài viết trước khi xóa bài viết khỏi DB
        const imageUrlsToDeletePhysical = extractImageUrls(post.content || '');
        console.log(`🔍 Found ${imageUrlsToDeletePhysical.length} images to delete:`, imageUrlsToDeletePhysical);

        // 2. Xóa bài viết khỏi cơ sở dữ liệu
        const deletePostResult = await Post.deleteOne({ _id: postId });
        console.log(`✅ Kết quả xóa bài viết từ DB:`, deletePostResult);

        // 3. Xóa tất cả các bản ghi ảnh liên kết với bài viết này khỏi DB
        const deleteImageResult = await Image.deleteMany({ refType: 'post', refId: postId });
        console.log(`✅ Kết quả xóa ảnh liên kết từ DB:`, deleteImageResult);

        // 4. Xóa các tệp ảnh vật lý từ thư mục public/upload
        console.log(`🗑️ Starting to delete physical image files...`);
        await Promise.all(imageUrlsToDeletePhysical.map(async url => {
            const filename = extractFilenameFromUrl(url);
            console.log(`🔍 Processing image URL: ${url} → filename: ${filename}`);
            console.log(`🔍 Is local image: ${isLocalImageUrl(url)}`);
            if (filename && isLocalImageUrl(url)) { // Only delete if it's a local image URL
                console.log(`🗑️ Deleting physical file: ${filename}`);
                await deletePhysicalImage(filename);
            } else {
                console.log(`⏭️ Skipping non-local image: ${url}`);
            }
        }));
        console.log(`✅ Finished deleting physical image files`);


        // Phát sự kiện Socket.IO khi có bài viết bị xóa
        if (io) {
            io.emit('deletedPost', { postId: postId });
        }

        res.json({ message: 'Bài viết và các ảnh liên kết đã được xóa thành công' });
        console.log(`Bài viết ${postId} đã được xóa thành công.`);
    } catch (error) {
        console.error('Lỗi khi xóa bài viết (backend):', error);
        res.status(500).json({ message: 'Lỗi server khi xóa bài viết', error: error.message });
    }
};

// Tăng lượt xem
exports.incrementViews = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        // No Socket.IO emit here as views might update too frequently.
        // Consider emitting only if there's a significant change or less frequently.
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tăng lượt xem', error: err.message });
    }
};


// --- HÀM TRỢ GIÚP ---

/**
 * Hàm helper để trích xuất tất cả src của thẻ <img> trong HTML
 */
const extractImageUrls = (htmlContent) => {
    const imageUrls = [];
    // Regex này sẽ tìm các thẻ <img> và trích xuất giá trị của thuộc tính src
    const imgTagRegex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"]/gi;
    let match;

    while ((match = imgTagRegex.exec(htmlContent))) {
        const src = match[1].trim(); // loại bỏ khoảng trắng nếu có
        imageUrls.push(src);
    }

    return imageUrls;
};

// Hàm này sẽ trích xuất tên file ảnh từ các URL ảnh
// Ví dụ: "http://localhost:5000/upload/1678901234567-abc.png" => "1678901234567-abc.png"
// Hoặc: "/upload/1678901234567-abc.png" => "1678901234567-abc.png"
function extractFilenameFromUrl(url) {
    try {
        // Handle relative URLs (starting with /)
        if (url.startsWith('/')) {
            return path.basename(url);
        }

        // Handle absolute URLs
        const urlObj = new URL(url);
        return path.basename(urlObj.pathname);
    } catch (e) {
        console.error("URL ảnh không hợp lệ hoặc không thể trích xuất tên file:", url, e);
        return null;
    }
}

// Thêm hàm này vào phần "HÀM TRỢ GIÚP" của bạn
function isLocalImageUrl(url) {
    try {
        // Check if it's a relative URL starting with /upload/
        if (url.startsWith('/upload/')) {
            return true;
        }

        const urlObj = new URL(url);
        // Check for localhost and upload path
        const localDomains = ['localhost:5000', 'localhost:3000', '127.0.0.1:5000', '127.0.0.1:3000'];
        if (localDomains.includes(urlObj.host)) {
            return urlObj.pathname.startsWith('/upload/');
        }

        return false; // Không phải ảnh local
    } catch (e) {
        // If URL parsing fails, check if it's a relative path
        return url.startsWith('/upload/');
    }
}

// Hàm để xóa các tệp ảnh vật lý khỏi thư mục public/upload
function deletePhysicalImage(filename) {
    return new Promise((resolve, reject) => {
        // Đảm bảo đường dẫn tới thư mục lưu trữ ảnh là chính xác
        const filePath = path.join(__dirname, '../public/upload', filename);
        console.log(`🗑️ Attempting to delete file: ${filePath}`);

        fs.unlink(filePath, (err) => {
            if (err) {
                // Xử lý các lỗi phổ biến như tệp không tồn tại (ENOENT)
                if (err.code === 'ENOENT') {
                    console.warn(`⚠️ File ảnh vật lý không tồn tại: ${filePath}. Có thể đã bị xóa trước đó.`);
                    resolve(); // Resolve anyway since file doesn't exist
                } else {
                    console.error(`❌ Lỗi khi xóa file ảnh vật lý ${filePath}:`, err);
                    reject(err);
                }
            } else {
                console.log(`✅ Đã xóa file ảnh vật lý: ${filePath}`);
                resolve();
            }
        });
    });
}