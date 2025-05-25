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

    // Sử dụng localStorage để đọc trạng thái darkMode
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode === 'true' ? true : false;
    });

    // Cập nhật style cho body khi darkMode thay đổi
    useEffect(() => {
        document.body.style.backgroundColor = darkMode ? '#121212' : '#f0f2f5';
        document.body.style.color = darkMode ? '#ffffff' : '#1c1e21';
    }, [darkMode]);

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
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                width: '45vw',
                ml: 8,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                // Áp dụng màu nền và màu chữ dựa trên darkMode
                backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9', // Màu nền cho Box chính
                color: darkMode ? '#e0e0e0' : '#333333', // Màu chữ cho Box chính
                transition: 'background-color 0.4s ease, color 0.4s ease',
                mt: 10,
            }}
        >
            {!postDetail ? (
                <Typography color={darkMode ? '#e0e0e0' : 'text.primary'}>Đang tải bài viết...</Typography>
            ) : (
                <Box>
                    {/* Tiêu đề và tác giả */}
                    <Typography variant="subtitle2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                        👤 {postDetail.authorId?.fullName}
                    </Typography>
                    <Typography variant="h5" gutterBottom color={darkMode ? '#ffffff' : 'text.primary'}>
                        {postDetail.title}
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: darkMode ? '#424242' : 'divider' }} />

                    {/* Nội dung: đặt ref để thao tác */}
                    <Typography
                        variant="body1"
                        component="div"
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: darkMode ? '#e0e0e0' : 'text.primary' }}
                        dangerouslySetInnerHTML={{ __html: postDetail.content }}
                        ref={contentRef}
                    />

                    {/* Thống kê */}
                    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Typography
                            variant="body2"
                            sx={{ cursor: 'pointer', color: darkMode ? '#90caf9' : 'primary.main', fontSize: '0.8rem' }}
                            onClick={() => handleOpenComments(postDetail)}
                        >
                            💬 {postDetail.commentCount || postDetail.comments?.length || 0} Bình luận
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ cursor: 'pointer', color: darkMode ? '#ef9a9a' : 'primary.main', fontSize: '0.8rem' }}
                            onClick={() => handleOpenLikes(postDetail)}
                        >
                            ❤️ {postDetail.likeCount || postDetail.likedUsers?.length || 0} Lượt thích
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ fontSize: '0.8rem', mt: 1, color: darkMode ? '#ffb74d' : 'text.primary' }}
                        >
                            ⭐ {postDetail.ratingCount || 0} lượt đánh giá
                        </Typography>
                    </Box>

                    {/* Nút mở Dialog viết bình luận */}
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                            mt: 2,
                            borderColor: darkMode ? '#757575' : 'primary.main',
                            color: darkMode ? '#bbdefb' : 'primary.main',
                            '&:hover': {
                                borderColor: darkMode ? '#9e9e9e' : 'primary.dark',
                                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                        onClick={() => handleOpenComments(postDetail)}
                    >
                        Viết bình luận
                    </Button>

                    {/* Dialog lượt thích */}
                    <Dialog
                        open={openLikes}
                        onClose={handleCloseLikes}
                        fullWidth
                        maxWidth="xs"
                        PaperProps={{
                            sx: {
                                backgroundColor: darkMode ? '#2c2c2c' : '#ffffff',
                                color: darkMode ? '#e0e0e0' : '#1c1e21',
                            }
                        }}
                    >
                        <DialogTitle sx={{ borderBottom: darkMode ? '1px solid #424242' : '1px solid #e0e0e0' }}>
                            Danh sách người đã thích
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseLikes}
                                sx={{ position: 'absolute', right: 8, top: 8, color: darkMode ? '#e0e0e0' : 'inherit' }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <List>
                                {likedUsers.map((user, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={`👤 ${user.fullName}`} sx={{ color: darkMode ? '#e0e0e0' : 'text.primary' }} />
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
                        darkMode={darkMode} // Truyền prop darkMode vào CommentDialog
                    />

                    {/* LikeDialog riêng */}
                    <LikeDialog open={openLikes} onClose={handleCloseLikes} likedUsers={likedUsers} darkMode={darkMode} />

                    {/* Dialog hiển thị ảnh to */}
                    <Dialog
                        open={openImageModal}
                        onClose={handleCloseImageModal}
                        maxWidth="md"
                        fullWidth
                        PaperProps={{
                            sx: {
                                backgroundColor: darkMode ? '#2c2c2c' : '#ffffff',
                                color: darkMode ? '#e0e0e0' : '#1c1e21',
                            }
                        }}
                    >
                        <DialogTitle sx={{ borderBottom: darkMode ? '1px solid #424242' : '1px solid #e0e0e0' }}>
                            Xem ảnh
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseImageModal}
                                sx={{ position: 'absolute', right: 8, top: 8, color: darkMode ? '#e0e0e0' : 'inherit' }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent
                            dividers
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: darkMode ? '#424242' : 'divider',
                            }}
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