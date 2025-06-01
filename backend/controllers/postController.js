const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const Like = require('../models/Like');
const Image = require('../models/Image');
const fs = require('fs'); // Để tương tác với hệ thống tệp
const path = require('path'); // Để xử lý đường dẫn tệp

// Thêm biến io để sử dụng Socket.IO
let io;

// Hàm để thiết lập Socket.IO (gọi một lần khi ứng dụng khởi động)
exports.setIo = (socketIoInstance) => {
    io = socketIoInstance;
};

// Lấy bài viết theo topic id
exports.getPostsByTopicWithDetails = async (req, res) => {
    try {
        const { topicId } = req.params;

        // Lấy bài viết và populate thông tin tác giả, chủ đề
        // Bao gồm luôn commentCount, likeCount, ratingCount từ Post model
        const posts = await Post.find({ topicId })
            .populate('authorId', 'fullName')
            .populate('topicId', 'name')
            .select('title content commentCount likeCount ratingCount') // Chọn rõ ràng các trường mong muốn
            .lean(); // Sử dụng .lean() để nhận về plain JavaScript objects

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

        // 4. Xử lý chi tiết từng bình luận gốc và các phản hồi của nó
        const detailedComments = await Promise.all(rootComments.map(async (comment) => {
            // Lọc các phản hồi trực tiếp của bình luận gốc này từ allCommentsForPost
            const replies = allCommentsForPost.filter(reply =>
                reply.parentCommentId && reply.parentCommentId.equals(comment._id)
            );

            // Populate likes cho từng bình luận (nếu cần)
            const commentLikes = await Like.find({ targetId: comment._id, targetType: 'comment' });

            // Tính toán số lượng like và phản hồi hiện tại dựa trên dữ liệu đã đọc
            const currentReplyCount = replies.length;
            const currentLikeCount = commentLikes.length;

            return {
                ...comment.toObject(),
                likeCount: currentLikeCount,
                replyCount: currentReplyCount, // Cập nhật replyCount dựa trên số lượng phản hồi được lấy ra
                replies: replies.map(r => r.toObject()), // Chuyển phản hồi thành plain object
            };
        }));

        // 5. Lấy thông tin về Rating
        const ratings = await Rating.find({ postId: post._id }).populate('userId', 'fullName avatar');
        const ratedUsers = ratings.map(r => r.userId);
        const ratingCount = ratings.length; // Tính toán ratingCount từ số lượng ratings lấy được

        // 6. Lấy thông tin về Like của bài viết
        const likes = await Like.find({ targetId: post._id, targetType: 'post' }).populate('userId', 'fullName avatar');
        const likeCount = likes.length; // Tính toán likeCount từ số lượng likes lấy được
        const likedUsers = likes.map(like => like.userId);

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
            comments: detailedComments, // Các bình luận gốc kèm phản hồi đã được xử lý
            ratedUsers,
            ratingCount, // Sử dụng ratingCount đã tính toán
            likeCount, // Sử dụng likeCount đã tính toán
            likedUsers,
            commentCount: post.commentCount, // Lấy commentCount trực tiếp từ post model
            images,
            mainImage,
            otherImages,
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

        // 1. Tạo bài viết
        const newPost = new Post({
            authorId,
            title,
            content,
            topicId,
            tags,
        });

        const savedPost = await newPost.save();

        // 2. Tìm tất cả URL ảnh trong nội dung
        const imageUrls = extractImageUrls(content);

        // 3. Lưu ảnh gắn với post
        const imageDocs = await Promise.all(
            imageUrls.map(url => {
                return Image.create({
                    refType: 'post',
                    refId: savedPost._id,
                    url,
                });
            })
        );

        // Phát sự kiện Socket.IO khi có bài viết mới
        if (io) {
            io.emit('newPost', savedPost);
        }

        res.status(201).json({
            message: 'Tạo bài viết thành công',
            post: savedPost,
            images: imageDocs,
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

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tìm thấy' });
        }
        if (post.authorId.toString() !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bài viết này' });
        }

        const oldContent = post.content || '';
        let { title, content, topicId, tags } = req.body;

        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (topicId !== undefined) post.topicId = topicId;
        if (tags !== undefined) post.tags = tags;

        post.updatedAt = Date.now();
        const savedPost = await post.save();

        // --- Logic quản lý ảnh vật lý và trong DB sau khi cập nhật bài viết ---

        const oldImageUrls = extractImageUrls(oldContent);
        const newImageUrls = extractImageUrls(savedPost.content);

        // 1. Xác định các URL ảnh đã bị xóa khỏi nội dung bài viết
        const removedImageUrls = oldImageUrls.filter(url => !newImageUrls.includes(url));

        // 2. Xóa các tệp ảnh vật lý đã bị xóa khỏi thư mục public/upload
        await Promise.all(removedImageUrls.map(async url => {
            const filename = extractFilenameFromUrl(url);
            if (filename && isLocalImageUrl(url)) { // Only delete if it's a local image URL
                await deletePhysicalImage(filename);
            }
        }));

        // 3. Cập nhật các bản ghi ảnh trong cơ sở dữ liệu (xóa cũ, thêm mới)
        await Image.deleteMany({ refType: 'post', refId: savedPost._id });

        const imageDocs = await Promise.all(
            newImageUrls.map(async url => {
                return Image.create({
                    refType: 'post',
                    refId: savedPost._id,
                    url,
                });
            })
        );

        // Phát sự kiện Socket.IO khi có bài viết được cập nhật
        if (io) {
            io.emit('updatedPost', savedPost);
        }

        res.json({
            message: 'Bài viết và ảnh liên kết đã được cập nhật thành công',
            post: savedPost,
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

        // 2. Xóa bài viết khỏi cơ sở dữ liệu
        const deletePostResult = await Post.deleteOne({ _id: postId });
        console.log(`Kết quả xóa bài viết từ DB:`, deletePostResult);

        // 3. Xóa tất cả các bản ghi ảnh liên kết với bài viết này khỏi DB
        const deleteImageResult = await Image.deleteMany({ refType: 'post', refId: postId });
        console.log(`Kết quả xóa ảnh liên kết từ DB:`, deleteImageResult);

        // 4. Xóa các tệp ảnh vật lý từ thư mục public/upload
        await Promise.all(imageUrlsToDeletePhysical.map(async url => {
            const filename = extractFilenameFromUrl(url);
            if (filename && isLocalImageUrl(url)) { // Only delete if it's a local image URL
                await deletePhysicalImage(filename);
            }
        }));

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
// Ví dụ: "http://localhost:5000/uploads/1678901234567-abc.png" => "1678901234567-abc.png"
function extractFilenameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        // Lấy phần pathname và sau đó lấy tên file cuối cùng
        return path.basename(urlObj.pathname);
    } catch (e) {
        console.error("URL ảnh không hợp lệ hoặc không thể trích xuất tên file:", url, e);
        return null;
    }
}

// Thêm hàm này vào phần "HÀM TRỢ GIÚP" của bạn
function isLocalImageUrl(url) {
    try {
        const urlObj = new URL(url);
        // Thay đổi 'localhost:5000' bằng domain và port thực tế của bạn trong production
        // Hoặc kiểm tra xem pathname có bắt đầu bằng '/uploads/' không
        // Cách 1: Kiểm tra hostname (tốt hơn cho môi trường production)
        const localDomains = ['localhost:5000', 'yourdomain.com', 'www.yourdomain.com']; // Thêm các domain của bạn vào đây
        if (localDomains.includes(urlObj.host)) {
            return urlObj.pathname.startsWith('/uploads/');
        }
        // Cách 2: Chỉ kiểm tra pathname nếu bạn biết chắc rằng chỉ có ảnh upload mới có đường dẫn này
        // return urlObj.pathname.startsWith('/uploads/');
        return false; // Không phải ảnh local
    } catch (e) {
        // console.warn("URL không hợp lệ khi kiểm tra local:", url);
        return false; // URL không hợp lệ thì không phải ảnh local
    }
}

// Hàm để xóa các tệp ảnh vật lý khỏi thư mục public/upload
function deletePhysicalImage(filename) {
    // Đảm bảo đường dẫn tới thư mục lưu trữ ảnh là chính xác
    const filePath = path.join(__dirname, '../public/upload', filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            // Xử lý các lỗi phổ biến như tệp không tồn tại (ENOENT)
            if (err.code === 'ENOENT') {
                console.warn(`File ảnh vật lý không tồn tại: ${filePath}. Có thể đã bị xóa trước đó.`);
            } else {
                console.error(`Lỗi khi xóa file ảnh vật lý ${filePath}:`, err);
            }
        } else {
            console.log(`Đã xóa file ảnh vật lý: ${filePath}`);
        }
    });
}