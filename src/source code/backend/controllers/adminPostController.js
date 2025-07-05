const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const Like = require('../models/Like');
const Image = require('../models/Image'); // Model để lưu trữ thông tin ảnh trong DB
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Cần axios để tải ảnh từ URL
const { JSDOM } = require('jsdom'); // Cần cài đặt: npm install jsdom

// Socket.IO instance (cần được thiết lập từ server.js)
let io;
exports.setIo = (socketIoInstance) => {
    io = socketIoInstance;
};

// --- HÀM TRỢ GIÚP ---
// Trong dự án thực tế, bạn nên đặt chúng vào một file helper riêng và import vào.

/**
 * Hàm helper để trích xuất tất cả src của thẻ <img> trong HTML
 */
const extractImageUrls = (htmlContent) => {
    if (!htmlContent) return [];
    const imageUrls = [];
    // Sử dụng JSDOM để parse an toàn hơn và tránh lỗi với regex phức tạp
    try {
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;
        const imgElements = document.querySelectorAll('img');
        imgElements.forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                imageUrls.push(src.trim());
            }
        });
    } catch (e) {
        console.error("Lỗi khi trích xuất URL ảnh từ HTML:", e);
    }
    return imageUrls;
};

function extractFilenameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        // Lấy basename và loại bỏ query params nếu có
        return path.basename(urlObj.pathname).split('?')[0];
    } catch (e) {
        console.error("URL ảnh không hợp lệ hoặc không thể trích xuất tên file:", url, e);
        return null;
    }
}

function isLocalImageUrl(url) {
    try {
        const urlObj = new URL(url);
        // Thay đổi 'localhost:5000' bằng domain và port thực tế của bạn trong production
        const localDomains = ['localhost:5000', '127.0.0.1:5000']; // THAY ĐỔI THEO DOMAIN CỦA BẠN
        if (localDomains.includes(urlObj.host)) {
            return urlObj.pathname.startsWith('/upload/'); // Đảm bảo khớp với thư mục Multer
        }
        return false;
    } catch (e) {
        return false;
    }
}

function deletePhysicalImage(filename) {
    const filePath = path.join(__dirname, '../public/upload', filename); // Đảm bảo đường dẫn chính xác
    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.warn(`[Admin Post Ctrl] File ảnh vật lý không tồn tại: ${filePath}. Có thể đã bị xóa trước đó.`);
            } else {
                console.error(`[Admin Post Ctrl] Lỗi khi xóa file ảnh vật lý ${filePath}:`, err);
            }
        } else {
            console.log(`[Admin Post Ctrl] Đã xóa file ảnh vật lý: ${filePath}`);
        }
    });
}

/**
 * Xử lý nội dung HTML để tải ảnh Base64 và ảnh từ URL bên ngoài về server.
 * Trả về nội dung HTML đã được cập nhật với các URL ảnh trên server.
 */
async function processContentImages(htmlContent, req) {
    if (!htmlContent) return '';

    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const imgElements = document.querySelectorAll('img');

    // Tạo thư mục nếu chưa có
    const uploadDir = path.join(__dirname, '../public/upload');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const img of imgElements) {
        const src = img.getAttribute('src');
        if (!src) continue;

        if (src.startsWith('data:image/')) {
            // Xử lý ảnh Base64
            try {
                const base64Data = src.split(',')[1];
                const mimeType = src.split(',')[0].split(':')[1].split(';')[0];
                const extension = mimeType.split('/')[1] || 'png'; // Default to png if extension not found

                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `${uniqueSuffix}.${extension}`;
                const filepath = path.join(uploadDir, filename);

                fs.writeFileSync(filepath, base64Data, { encoding: 'base64' });

                const newUrl = `${req.protocol}://${req.get('host')}/upload/${filename}`;
                img.setAttribute('src', newUrl);
                console.log(`[Image Process] Base64 image saved and updated to: ${newUrl}`);
            } catch (error) {
                console.error('Lỗi xử lý ảnh Base64:', error);
                // Giữ nguyên src nếu có lỗi để tránh lỗi hiển thị ảnh
            }
        } else if (src.startsWith('http://') || src.startsWith('https://')) {
            // Xử lý ảnh từ URL bên ngoài
            if (!isLocalImageUrl(src)) { // Chỉ tải về nếu chưa phải ảnh local
                try {
                    const response = await axios({
                        url: src,
                        method: 'GET',
                        responseType: 'stream',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Accept': 'image/*',
                        },
                        timeout: 10000 // Thêm timeout cho request
                    });

                    const contentType = response.headers['content-type'];
                    if (contentType && contentType.startsWith('image')) {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                        let extension = path.extname(src);
                        // Nếu extension không hợp lệ hoặc không có, cố gắng lấy từ Content-Type
                        if (!extension || extension.length < 2 || extension.includes('?')) {
                            extension = `.${contentType.split('/')[1].split(';')[0] || 'jpg'}`;
                        }
                        extension = extension.split('?')[0]; // Loại bỏ query params khỏi extension

                        const filename = `${uniqueSuffix}${extension}`;
                        const filepath = path.join(uploadDir, filename);

                        const writer = fs.createWriteStream(filepath);
                        response.data.pipe(writer);

                        await new Promise((resolve, reject) => {
                            writer.on('finish', resolve);
                            writer.on('error', (err) => {
                                console.error('Lỗi khi ghi file ảnh từ URL:', err);
                                reject(err);
                            });
                        });

                        const newUrl = `${req.protocol}://${req.get('host')}/upload/${filename}`;
                        img.setAttribute('src', newUrl);
                        console.log(`[Image Process] External image downloaded and updated to: ${newUrl}`);
                    } else {
                        console.warn(`URL ${src} không phải là ảnh hợp lệ hoặc không có Content-Type phù hợp. Loại bỏ ảnh khỏi nội dung.`);
                        img.remove(); // Xóa thẻ img nếu không phải ảnh hợp lệ
                    }
                } catch (error) {
                    console.error(`Lỗi khi tải ảnh từ URL ${src}:`, error.message);
                    img.remove(); // Xóa thẻ img nếu có lỗi khi tải
                }
            }
        }
    }
    return dom.serialize(); // Trả về HTML đã được cập nhật
}
// --- KẾT THÚC HÀM TRỢ GIÚP ---


/**
 * @route GET /api/admin/posts
 * @desc Lấy tất cả bài viết với phân trang, tìm kiếm và sắp xếp cho Admin.
 * @access Private (Admin Only)
 */
exports.getAllPostsForAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '', authorId = '', topicId = '', sortBy = 'createdAt', sortOrder = '-1' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) {
            query.status = status;
        }
        if (authorId) {
            query.authorId = authorId;
        }
        if (topicId) {
            query.topicId = topicId;
        }

        const sortOptions = {};
        sortOptions[sortBy] = parseInt(sortOrder); // -1 for descending, 1 for ascending

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: sortOptions,
            populate: [
                { path: 'authorId', select: 'fullName email' },
                { path: 'topicId', select: 'name' }
            ],
            lean: true // Return plain JavaScript objects
        };

        const result = await Post.paginate(query, options); // Post.paginate yêu cầu mongoose-paginate-v2

        if (!result || result.docs.length === 0) {
            return res.status(200).json({ message: 'Không tìm thấy bài viết nào phù hợp.', posts: [], totalDocs: 0, totalPages: 0 });
        }

        res.status(200).json({
            posts: result.docs,
            totalPosts: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage
        });

    } catch (err) {
        console.error('Lỗi khi lấy tất cả bài viết cho Admin:', err);
        res.status(500).json({ message: 'Lỗi server nội bộ khi lấy bài viết.', error: err.message });
    }
};

/**
 * @route GET /api/admin/posts/:id
 * @desc Lấy chi tiết một bài viết cụ thể cho Admin.
 * @access Private (Admin Only)
 */
exports.getPostByIdForAdmin = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('authorId', 'fullName email avatar')
            .populate('topicId', 'name description')
            .lean(); // Use .lean() for faster queries if you're not saving changes

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tìm thấy.' });
        }

        // Lấy chi tiết bình luận, like, rating, hình ảnh tương tự như getPostByTopicAndPostIdWithDetails
        // Chỉ để hiển thị đầy đủ thông tin cho admin, không cập nhật DB
        const allCommentsForPost = await Comment.find({ postId: post._id })
            .populate('authorId', 'fullName avatar')
            .populate('parentCommentId', 'authorId content')
            .lean();

        const rootComments = allCommentsForPost.filter(comment => comment.parentCommentId === null);

        const detailedComments = await Promise.all(rootComments.map(async (comment) => {
            const replies = allCommentsForPost.filter(reply =>
                reply.parentCommentId && reply.parentCommentId.equals(comment._id)
            );
            const commentLikes = await Like.find({ targetId: comment._id, targetType: 'comment' }).lean();
            return {
                ...comment,
                likeCount: commentLikes.length,
                replyCount: replies.length,
                replies: replies
            };
        }));

        const ratings = await Rating.find({ postId: post._id }).populate('userId', 'fullName avatar').lean();
        const likes = await Like.find({ targetId: post._id, targetType: 'post' }).populate('userId', 'fullName avatar').lean();
        const images = await Image.find({ refId: post._id, refType: 'post' }).lean();

        const detailedPost = {
            ...post,
            comments: detailedComments,
            ratings: ratings,
            likes: likes,
            images: images,
            // Các trường đếm từ model đã được cập nhật tự động (nếu có logic trigger)
            // hoặc có thể tính toán lại nếu bạn muốn đảm bảo dữ liệu mới nhất
            // commentCount: post.commentCount, // Hoặc tính toán lại: allCommentsForPost.length
            // likeCount: post.likeCount,       // Hoặc tính toán lại: likes.length
            // ratingCount: post.ratingCount // Hoặc tính toán lại: ratings.length
        };

        res.status(200).json(detailedPost);

    } catch (err) {
        console.error('Lỗi khi lấy chi tiết bài viết cho Admin:', err);
        res.status(500).json({ message: 'Lỗi server nội bộ khi lấy chi tiết bài viết.', error: err.message });
    }
};

/**
 * @route POST /api/admin/posts
 * @desc Admin tạo bài viết mới.
 * @access Private (Admin Only)
 */
exports.createPostByAdmin = async (req, res) => {
    try {
        const { authorId, title, content, topicId, tags, status } = req.body;

        // BƯỚC QUAN TRỌNG: Xử lý các ảnh trong nội dung (Base64 hoặc URL bên ngoài)
        // và lưu chúng vào public/upload, sau đó cập nhật src trong HTML
        const processedContent = await processContentImages(content, req);

        const newPost = new Post({
            authorId,
            title,
            content: processedContent, // Sử dụng nội dung đã được xử lý ảnh
            topicId,
            tags: tags || [],
            status: status || 'pending',
            createdAt: Date.now(),
        });

        const savedPost = await newPost.save();

        // Lưu thông tin các ảnh (đã được lưu trữ cục bộ) vào model Image
        const imageUrls = extractImageUrls(savedPost.content);
        const imageDocs = await Promise.all(
            imageUrls.filter(url => isLocalImageUrl(url)).map(url =>
                Image.create({
                    refType: 'post',
                    refId: savedPost._id,
                    url,
                    isMain: false
                })
            )
        );

        // Phát sự kiện Socket.IO
        if (io) {
            const populatedPost = await Post.findById(savedPost._id)
                .populate('authorId', 'fullName avatar')
                .populate('topicId', 'name')
                .lean();
            io.emit('newPostByAdmin', populatedPost);
        }

        res.status(201).json({
            message: 'Bài viết đã được Admin tạo thành công',
            post: savedPost,
            images: imageDocs,
        });
    } catch (error) {
        console.error('Lỗi Admin tạo bài viết:', error);
        res.status(500).json({ message: 'Lỗi server khi Admin tạo bài viết.', error: error.message });
    }
};

/**
 * @route PUT /api/admin/posts/:id
 * @desc Admin cập nhật bài viết (có thể cập nhật bất kỳ bài viết nào).
 * @access Private (Admin Only)
 */
exports.updatePostByAdmin = async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content, topicId, tags, status } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tìm thấy.' });
        }

        const oldContent = post.content || '';

        // BƯỚC QUAN TRỌNG: Xử lý các ảnh mới/cập nhật trong nội dung
        const processedContent = await processContentImages(content, req);

        let updatedFields = { updatedAt: Date.now() };
        if (title !== undefined) updatedFields.title = title;
        if (content !== undefined) updatedFields.content = processedContent; // Cập nhật với nội dung đã xử lý ảnh
        if (topicId !== undefined) updatedFields.topicId = topicId;
        if (tags !== undefined) updatedFields.tags = tags;
        if (status !== undefined) updatedFields.status = status;

        const updatedPost = await Post.findByIdAndUpdate(postId, updatedFields, { new: true, runValidators: true });

        // --- Logic quản lý ảnh vật lý và trong DB sau khi cập nhật bài viết ---
        const oldImageUrls = extractImageUrls(oldContent).filter(url => isLocalImageUrl(url)); // Chỉ lấy ảnh local cũ
        const newImageUrls = extractImageUrls(updatedPost.content).filter(url => isLocalImageUrl(url)); // Chỉ lấy ảnh local mới

        // Xóa ảnh vật lý không còn được sử dụng
        const removedImageFilenames = oldImageUrls
            .filter(url => !newImageUrls.includes(url))
            .map(url => extractFilenameFromUrl(url))
            .filter(Boolean); // Lọc bỏ null/undefined
        await Promise.all(removedImageFilenames.map(filename => deletePhysicalImage(filename)));

        // Cập nhật các bản ghi Image trong DB
        await Image.deleteMany({ refType: 'post', refId: updatedPost._id }); // Xóa tất cả ảnh liên kết cũ
        const imageDocs = await Promise.all(
            newImageUrls.map(url =>
                Image.create({
                    refType: 'post',
                    refId: updatedPost._id,
                    url,
                    isMain: false
                })
            )
        );

        // Phát sự kiện Socket.IO
        if (io) {
            const populatedPost = await Post.findById(updatedPost._id)
                .populate('authorId', 'fullName avatar')
                .populate('topicId', 'name')
                .lean();
            io.emit('updatedPostByAdmin', populatedPost);
        }

        res.status(200).json({
            message: 'Bài viết đã được Admin cập nhật thành công',
            post: updatedPost,
            images: imageDocs,
        });

    } catch (error) {
        console.error('Lỗi Admin cập nhật bài viết:', error);
        res.status(500).json({ message: 'Lỗi server khi Admin cập nhật bài viết.', error: error.message });
    }
};

/**
 * @route DELETE /api/admin/posts/:id
 * @desc Admin xóa bài viết (có thể xóa bất kỳ bài viết nào).
 * @access Private (Admin Only)
 */
exports.deletePostByAdmin = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            console.warn(`[Admin Post Ctrl] Bài viết ${postId} không tìm thấy để xóa.`);
            return res.status(404).json({ message: 'Bài viết không tìm thấy.' });
        }

        // Trích xuất URL ảnh từ nội dung bài viết trước khi xóa
        const imageUrlsToDeletePhysical = extractImageUrls(post.content || '').filter(url => isLocalImageUrl(url));

        // Xóa bài viết khỏi cơ sở dữ liệu
        const deletePostResult = await Post.deleteOne({ _id: postId });
        console.log(`[Admin Post Ctrl] Kết quả xóa bài viết từ DB:`, deletePostResult);

        // Xóa tất cả các bản ghi ảnh liên kết
        const deleteImageResult = await Image.deleteMany({ refType: 'post', refId: postId });
        console.log(`[Admin Post Ctrl] Kết quả xóa ảnh liên kết từ DB:`, deleteImageResult);

        // Xóa các tệp ảnh vật lý
        const removedImageFilenames = imageUrlsToDeletePhysical
            .map(url => extractFilenameFromUrl(url))
            .filter(Boolean);
        await Promise.all(removedImageFilenames.map(filename => deletePhysicalImage(filename)));

        // Xóa các bình luận, lượt thích, đánh giá liên quan đến bài viết này
        await Comment.deleteMany({ postId: postId });
        await Like.deleteMany({ targetId: postId, targetType: 'post' }); // Có thể cần xóa cả like cho comments của post này
        await Rating.deleteMany({ postId: postId });

        // Phát sự kiện Socket.IO
        if (io) {
            io.emit('deletedPostByAdmin', { postId: postId });
        }

        res.status(200).json({ message: 'Bài viết, ảnh và dữ liệu liên quan đã được Admin xóa thành công.' });
        console.log(`[Admin Post Ctrl] Bài viết ${postId} đã được Admin xóa thành công.`);

    } catch (error) {
        console.error('Lỗi Admin xóa bài viết:', error);
        res.status(500).json({ message: 'Lỗi server khi Admin xóa bài viết.', error: error.message });
    }
};

/**
 * @route PUT /api/admin/posts/:id/status
 * @desc Admin cập nhật trạng thái bài viết (duyệt, ẩn, v.v.).
 * @access Private (Admin Only)
 */
exports.updatePostStatus = async (req, res) => {
    try {
        const postId = req.params.id;
        const { status } = req.body;

        if (!status || !['draft', 'pending', 'published', 'archived', 'flagged', 'deleted'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tìm thấy.' });
        }

        post.status = status;
        post.updatedAt = Date.now();
        const updatedPost = await post.save();

        // Phát sự kiện Socket.IO
        if (io) {
            const populatedPost = await Post.findById(updatedPost._id)
                .populate('authorId', 'fullName avatar')
                .populate('topicId', 'name')
                .lean();
            io.emit('updatedPostStatusByAdmin', populatedPost);
        }

        res.status(200).json({ message: 'Trạng thái bài viết đã được cập nhật thành công.', post: updatedPost });

    } catch (error) {
        console.error('Lỗi Admin cập nhật trạng thái bài viết:', error);
        res.status(500).json({ message: 'Lỗi server khi Admin cập nhật trạng thái bài viết.', error: error.message });
    }
};