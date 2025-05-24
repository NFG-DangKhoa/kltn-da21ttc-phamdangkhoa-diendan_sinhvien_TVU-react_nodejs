import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    IconButton, List, ListItem, ListItemText, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CommentDialog from './CommentDialog';
import LikeDialog from './LikeDialog';

const PostDetail = () => {
    const [searchParams] = useSearchParams();
    const topicId = searchParams.get('topicId');
    const postId = searchParams.get('postId');

    const [postDetail, setPostDetail] = useState(null);
    const [openLikes, setOpenLikes] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [openComments, setOpenComments] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    // Mới: dialog hiển thị ảnh to
    const [openImageModal, setOpenImageModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    // Thêm ref cho vùng nội dung để thao tác DOM
    const contentRef = useRef(null);

    // Quản lý hiện trả lời bình luận (giữ nguyên)
    const [showReplies, setShowReplies] = useState({});
    const toggleReplies = (commentId) => {
        setShowReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    useEffect(() => {
        if (topicId && postId) {
            const fetchPostDetail = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/posts/topic/${topicId}/post/${postId}`);

                    setPostDetail(response.data);
                } catch (err) {
                    console.error('Lỗi khi tải chi tiết bài viết:', err);
                }
            };
            fetchPostDetail();
        }
    }, [topicId, postId]);

    // Sau khi postDetail thay đổi, thêm sự kiện click cho tất cả ảnh trong nội dung
    useEffect(() => {
        if (!postDetail) return;

        const contentElement = contentRef.current;
        if (!contentElement) return;

        const images = contentElement.querySelectorAll('img');
        // Thêm sự kiện click cho từng ảnh
        images.forEach(img => {
            img.style.cursor = 'pointer'; // Thêm con trỏ pointer khi hover ảnh
            img.onclick = () => {
                setModalImageSrc(img.src);
                setOpenImageModal(true);
            };
        });

        // Cleanup khi component unmount hoặc nội dung thay đổi
        return () => {
            images.forEach(img => {
                img.onclick = null;
            });
        };
    }, [postDetail]);

    const handleOpenLikes = (post) => {
        setLikedUsers(post.likedUsers || []);
        setOpenLikes(true);
    };

    const handleCloseLikes = () => {
        setOpenLikes(false);
        setLikedUsers([]);
    };

    const handleOpenComments = (post) => {
        setSelectedPost(post);
        setOpenComments(true);
    };

    const handleCloseComments = () => {
        setOpenComments(false);
        setSelectedPost(null);
    };

    const handleCloseImageModal = () => {
        setOpenImageModal(false);
        setModalImageSrc('');
    };

    return (
        <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, width: '45vw', ml: 8, height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
            {!postDetail ? (
                <Typography>Đang tải bài viết...</Typography>
            ) : (
                <Box>
                    {/* Tiêu đề và tác giả */}
                    <Typography variant="subtitle2" color="text.secondary">👤 {postDetail.authorId?.fullName}</Typography>
                    <Typography variant="h5" gutterBottom>{postDetail.title}</Typography>
                    <Divider sx={{ my: 2 }} />

                    {/* Nội dung: đặt ref để thao tác */}
                    <Typography
                        variant="body1"
                        component="div"
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                        dangerouslySetInnerHTML={{ __html: postDetail.content }}
                        ref={contentRef}
                    />

                    {/* Thống kê */}
                    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Typography
                            variant="body2"
                            sx={{ cursor: 'pointer', color: 'primary.main', fontSize: '0.8rem' }}
                            onClick={() => handleOpenComments(postDetail)}
                        >
                            💬 {postDetail.commentCount || postDetail.comments?.length || 0} Bình luận
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ cursor: 'pointer', color: 'primary.main', fontSize: '0.8rem' }}
                            onClick={() => handleOpenLikes(postDetail)}
                        >
                            ❤️ {postDetail.likeCount || postDetail.likedUsers?.length || 0} Lượt thích
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ fontSize: '0.8rem', mt: 1 }}
                        >
                            ⭐ {postDetail.ratingCount || 0} lượt đánh giá
                        </Typography>
                    </Box>

                    {/* Nút mở Dialog viết bình luận */}
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => handleOpenComments(postDetail)}
                    >
                        Viết bình luận
                    </Button>

                    {/* Dialog lượt thích */}
                    <Dialog open={openLikes} onClose={handleCloseLikes} fullWidth maxWidth="xs">
                        <DialogTitle>
                            Danh sách người đã thích
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseLikes}
                                sx={{ position: 'absolute', right: 8, top: 8 }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <List>
                                {likedUsers.map((user, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={`👤 ${user.fullName}`} />
                                    </ListItem>
                                ))}
                            </List>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog bình luận */}
                    <CommentDialog
                        open={openComments}
                        onClose={handleCloseComments}
                        post={selectedPost}
                        showReplies={showReplies}
                        toggleReplies={toggleReplies}
                    />

                    {/* LikeDialog riêng */}
                    <LikeDialog open={openLikes} onClose={handleCloseLikes} likedUsers={likedUsers} />

                    {/* Dialog hiển thị ảnh to */}
                    <Dialog open={openImageModal} onClose={handleCloseImageModal} maxWidth="md" fullWidth>
                        <DialogTitle>
                            Xem ảnh
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseImageModal}
                                sx={{ position: 'absolute', right: 8, top: 8 }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent
                            dividers
                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <img
                                src={modalImageSrc}
                                alt="Zoomed"
                                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
                            />
                        </DialogContent>
                    </Dialog>
                </Box>
            )}
        </Box>
    );
};

export default PostDetail;