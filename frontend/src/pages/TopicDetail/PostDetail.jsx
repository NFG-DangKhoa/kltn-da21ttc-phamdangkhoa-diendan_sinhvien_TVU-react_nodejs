import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    IconButton, Divider, useTheme, Card, CardContent, CardMedia,
    Menu, MenuItem, CircularProgress, Rating // Import Rating from MUI
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star'; // NEW: Import StarIcon for average rating display
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';

import CommentDialog from './CenterColumn/CommentDialog';
import LikeDialog from './CenterColumn/LikeDialog';
import RatingDialog from './CenterColumn/RatingDialog'; // NEW: Import RatingDialog
import PostForm from './CenterColumn/PostForm';
import { ThemeContext } from '../../context/ThemeContext';
import usePostDetail from './usePostDetail';
import { AuthContext } from '../../context/AuthContext';

// Dữ liệu giả định cho các bài viết tương tự
const dummyRelatedPosts = [
    {
        id: 'related-1',
        title: 'Tối ưu hóa hình ảnh cho Web',
        thumbnail: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=Image+1',
        link: '/post-detail?topicId=123&postId=related-1'
    },
    {
        id: 'related-2',
        title: 'Hiểu về CSS Grid Layout',
        thumbnail: 'https://via.placeholder.com/150/33A1FF/FFFFFF?text=Image+2',
        link: '/post-detail?topicId=123&postId=related-2'
    },
    {
        id: 'related-3',
        title: 'Giới thiệu về WebAssembly',
        thumbnail: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Image+3',
        link: '/post-detail?topicId=123&postId=related-3'
    },
    {
        id: 'related-4',
        title: 'Bảo mật ứng dụng Node.js',
        thumbnail: 'https://via.placeholder.com/150/FF33E0/FFFFFF?text=Image+4',
        link: '/post-detail?topicId=123&postId=related-4'
    },
    {
        id: 'related-5',
        title: 'Sử dụng GraphQL với React',
        thumbnail: 'https://via.placeholder.com/150/E0FF33/FFFFFF?text=Image+5',
        link: '/post-detail?topicId=123&postId=related-5'
    },
    {
        id: 'related-6',
        title: 'Xây dựng PWA đầu tiên',
        thumbnail: 'https://via.placeholder.com/150/5733FF/FFFFFF?text=Image+6',
        link: '/post-detail?topicId=123&postId=related-6'
    },
];

const PostDetail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const topicId = searchParams.get('topicId');
    const postId = searchParams.get('postId');

    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const { user } = useContext(AuthContext);

    // State cho việc chỉnh sửa bài viết
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [currentEditingPost, setCurrentEditingPost] = useState(null);

    // NEW: State for Rating Dialog
    const [openRatingDialog, setOpenRatingDialog] = useState(false);

    const {
        postDetail,
        setPostDetail,
        comments, // Expose comments for CommentDialog
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleLikeToggle,
        handleDeletePost,
        averageRating,    // NEW: Get averageRating from hook
        totalRatings,     // NEW: Get totalRatings from hook
        userRating,       // NEW: Get userRating from hook
        allRatings,       // NEW: Get allRatings from hook
        handleRatePost,   // NEW: Get handleRatePost from hook
        // loading, // Giữ loading và error nếu bạn muốn hiển thị trạng thái tải cho PostDetail
        // error
    } = usePostDetail(topicId, postId, user);

    const [openLikes, setOpenLikes] = useState(false);
    const [openComments, setOpenComments] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // Used for CommentDialog

    const [openImageModal, setOpenImageModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    const contentRef = useRef(null);

    const [showReplies, setShowReplies] = useState({});

    const [anchorEl, setAnchorEl] = useState(null);
    const [postToEditOrDelete, setPostToEditOrDelete] = useState(null);

    // Xử lý mở Menu cho chỉnh sửa/xóa
    const handleClickMenu = useCallback((event) => {
        setAnchorEl(event.currentTarget);
        setPostToEditOrDelete(postDetail);
    }, [postDetail]);

    // Xử lý đóng Menu
    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
        setPostToEditOrDelete(null);
    }, []);

    // Xử lý xóa bài viết
    const handleDeleteClick = useCallback(async () => {
        if (!postToEditOrDelete) return;
        const success = await handleDeletePost(postToEditOrDelete._id);
        if (success) {
            handleCloseMenu();
            navigate(-1); // Di chuyển người dùng trở lại trang trước sau khi xóa
        }
    }, [postToEditOrDelete, handleDeletePost, handleCloseMenu, navigate]);

    // Hàm để mở Dialog chỉnh sửa bài viết
    const handleEditPost = useCallback(() => {
        handleCloseMenu();
        if (postDetail) {
            setCurrentEditingPost(postDetail);
            setIsEditingPost(true);
        }
    }, [handleCloseMenu, postDetail]);

    // Hàm để xử lý khi PostForm gửi dữ liệu cập nhật
    const handleUpdatePostSubmit = async (updatedPostData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/posts/${currentEditingPost._id}`, updatedPostData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // PostForm's submission usually triggers a `updatedPost` socket event
            // which `usePostDetail` already listens to. So no explicit setPostDetail here.
            alert('Bài viết đã được cập nhật thành công!');
            setIsEditingPost(false);
            setCurrentEditingPost(null);
        } catch (error) {
            console.error('Lỗi khi cập nhật bài viết:', error);
            alert('Không thể cập nhật bài viết. Vui lòng thử lại.');
        }
    };

    // Hàm để đóng Dialog chỉnh sửa bài viết
    const handleCloseEditMode = useCallback(() => {
        setIsEditingPost(false);
        setCurrentEditingPost(null);
    }, []);

    const toggleReplies = (commentId) => {
        setShowReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    // useEffect để xử lý style cho nội dung bài viết và hình ảnh
    useEffect(() => {
        if (!postDetail || !contentRef.current) return;

        const contentElement = contentRef.current;
        const images = contentElement.querySelectorAll('img');

        images.forEach(img => {
            Object.assign(img.style, {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '10px',
                marginTop: '10px',
                marginBottom: '10px',
                display: 'block',
                objectFit: 'cover',
                imageRendering: 'auto',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                boxShadow: mode === 'dark' ? '0 2px 8px rgba(255, 255, 255, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
            });
            img.setAttribute('loading', 'lazy');
            img.onclick = () => {
                setModalImageSrc(img.src);
                setOpenImageModal(true);
            };
            img.onmouseenter = () => {
                img.style.transform = 'scale(1.015)';
                img.style.boxShadow = mode === 'dark' ? '0 4px 16px rgba(255,255,255,0.2)' : '0 4px 16px rgba(0,0,0,0.2)';
            };
            img.onmouseleave = () => {
                img.style.transform = 'scale(1)';
                img.style.boxShadow = mode === 'dark' ? '0 2px 8px rgba(255, 255, 255, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)';
            };
        });

        const updateContentStyles = () => {
            const elements = contentElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, strong, em, pre, code, ul, ol, li, a, blockquote');
            elements.forEach(el => {
                if (el.tagName === 'A') {
                    el.style.color = mode === 'dark' ? '#90caf9' : '#1976d2';
                } else if (el.tagName === 'BLOCKQUOTE') {
                    el.style.borderLeft = mode === 'dark' ? '4px solid #666' : '4px solid #ccc';
                    el.style.color = mode === 'dark' ? '#aaa' : '#555';
                } else if (el.tagName === 'PRE') {
                    el.style.backgroundColor = mode === 'dark' ? '#333' : '#f4f4f4';
                    el.style.color = mode === 'dark' ? '#eee' : '#333';
                    el.style.border = mode === 'dark' ? '1px solid #444' : '1px solid #ddd';
                } else if (el.tagName === 'CODE') {
                    el.style.backgroundColor = mode === 'dark' ? '#444' : '#f0f0f0';
                    el.style.color = mode === 'dark' ? '#ffb300' : '#d81b60';
                } else {
                    el.style.color = mode === 'dark' ? '#d0d0d0' : '#333333';
                }
            });
        };
        updateContentStyles();

        return () => {
            images.forEach(img => {
                img.onclick = null;
                img.onmouseenter = null;
                img.onmouseleave = null;
            });
        };
    }, [postDetail, mode]);

    const handleOpenLikes = useCallback(() => {
        setOpenLikes(true);
    }, []);

    const handleCloseLikes = useCallback(() => {
        setOpenLikes(false);
    }, []);

    const handleOpenComments = useCallback((post) => {
        setSelectedPost(post);
        setOpenComments(true);
    }, []);

    const handleCloseComments = useCallback(() => {
        setOpenComments(false);
        setSelectedPost(null);
    }, []);

    const handleCloseImageModal = useCallback(() => {
        setOpenImageModal(false);
        setModalImageSrc('');
    }, []);

    // NEW: Hàm mở Dialog đánh giá
    const handleOpenRating = useCallback(() => {
        if (!user || !user._id) {
            alert('Bạn cần đăng nhập để đánh giá bài viết.');
            return;
        }
        setOpenRatingDialog(true);
    }, [user]);

    // NEW: Hàm đóng Dialog đánh giá
    const handleCloseRating = useCallback(() => {
        setOpenRatingDialog(false);
    }, []);

    // NEW: Hàm xử lý gửi đánh giá, sẽ được truyền xuống RatingDialog
    const handleRatingSubmit = useCallback(async (postId, userId, rating) => {
        console.log("Attempting to submit rating from PostDetail for postId:", postId, "with rating:", rating);
        try {
            await handleRatePost(postId, userId, rating);
            console.log("Rating submitted successfully from PostDetail for postId:", postId);
            // Rating states will be updated via Socket.IO, no explicit update here
        } catch (error) {
            console.error("Error submitting rating from PostDetail (caught by PostDetail):", error);
            throw error; // Rethrow to RatingDialog for its error handling
        }
    }, [handleRatePost]);


    // Simplified loading and error state from usePostDetail.
    // If postDetail is null, it means either loading or error occurred.
    // You might want to pass 'loading' and 'error' states explicitly from usePostDetail
    // if you need more granular control over these messages.
    if (!postDetail && (topicId && postId)) { // If postDetail is null, but IDs are present, it's loading or error
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 64px)',
                width: '65vw',
                ml: 8,
                mt: 10,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: 2
            }}>
                <CircularProgress color="inherit" />
                <Typography sx={{ ml: 2, mt: 2, color: theme.palette.text.primary }}>Đang tải bài viết...</Typography>
            </Box>
        );
    }

    if (!postDetail) { // If postDetail is still null after potential loading, means not found or general error
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 64px)',
                width: '65vw',
                ml: 8,
                mt: 10,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: 2
            }}>
                <Typography variant="h6">Không tìm thấy bài viết hoặc có lỗi xảy ra.</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                width: '65vw',
                ml: 8,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                transition: theme.transitions.create(['background-color', 'color'], {
                    duration: theme.transitions.duration.standard,
                }),
                mt: 10,
            }}
        >
            <Box>
                {/* Title and Author */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color={theme.palette.text.secondary}>
                        � {postDetail.authorId?.fullName}
                    </Typography>
                    {user && user._id === postDetail.authorId?._id && (
                        <>
                            <IconButton
                                aria-label="more"
                                aria-controls="long-menu"
                                aria-haspopup="true"
                                onClick={handleClickMenu}
                                sx={{ color: mode === 'dark' ? '#e4e6eb' : '#1c1e21' }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                id="long-menu"
                                anchorEl={anchorEl}
                                // Chỉ hiển thị menu khi postToEditOrDelete trùng với postDetail hiện tại
                                open={Boolean(anchorEl) && postToEditOrDelete?._id === postDetail._id}
                                onClose={handleCloseMenu}
                                PaperProps={{
                                    style: {
                                        maxHeight: 48 * 4.5,
                                        width: '20ch',
                                        backgroundColor: mode === 'dark' ? '#3a3b3c' : '#ffffff',
                                        color: mode === 'dark' ? '#e4e6eb' : '#1c1e21',
                                    },
                                }}
                            >
                                <MenuItem onClick={handleEditPost} sx={{
                                    '&:hover': { backgroundColor: mode === 'dark' ? '#555' : '#f0f0f0' }
                                }}>
                                    Chỉnh sửa
                                </MenuItem>
                                <MenuItem onClick={handleDeleteClick} sx={{
                                    color: 'red',
                                    '&:hover': { backgroundColor: mode === 'dark' ? '#555' : '#f0f0f0' }
                                }}>
                                    Xóa
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>

                <Typography variant="h5" gutterBottom color={theme.palette.text.primary}>
                    {postDetail.title}
                </Typography>
                <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

                {/* Content */}
                <Typography
                    variant="body1"
                    component="div"
                    sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: theme.palette.text.primary,
                    }}
                    dangerouslySetInnerHTML={{ __html: postDetail.content }}
                    ref={contentRef}
                />

                {/* Stats */}
                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Typography
                        variant="body2"
                        sx={{ cursor: 'pointer', color: theme.palette.primary.main, fontSize: '0.8rem' }}
                        onClick={() => handleOpenComments(postDetail)}
                    >
                        💬 {currentCommentCount} Bình luận
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ cursor: 'pointer', color: theme.palette.secondary.main, fontSize: '0.8rem' }}
                        onClick={handleOpenLikes}
                    >
                        ❤️ {currentLikeCount} Lượt thích
                    </Typography>

                    {/* NEW: Hiển thị điểm đánh giá trung bình và tổng số lượt đánh giá */}
                    <Box display="flex" alignItems="center">
                        <StarIcon sx={{ fontSize: '1rem', color: '#ffb400', mr: 0.5 }} />
                        <Typography
                            variant="body2"
                            sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}
                        >
                            {averageRating.toFixed(1)} ({totalRatings} lượt đánh giá)
                        </Typography>
                    </Box>
                </Box>

                {/* Button to open comment dialog */}
                <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                        mt: 2,
                        borderColor: theme.palette.divider,
                        color: theme.palette.primary.main,
                        '&:hover': {
                            borderColor: theme.palette.primary.dark,
                            backgroundColor: theme.palette.action.hover,
                        },
                    }}
                    onClick={() => handleOpenComments(postDetail)}
                >
                    Viết bình luận
                </Button>

                {/* Like/Comment/Rating buttons */}
                <Divider sx={{ my: 1, borderColor: theme.palette.divider }} />
                <Box display="flex" justifyContent="space-around" mt={1}>
                    <Button
                        startIcon={
                            isLikedByUser ? (
                                <FavoriteIcon sx={{ color: 'red' }} />
                            ) : (
                                <FavoriteBorderIcon sx={{ color: theme.palette.text.primary }} />
                            )
                        }
                        sx={{ color: theme.palette.text.primary, textTransform: 'none' }}
                        onClick={handleLikeToggle}
                    >
                        Thích
                    </Button>
                    <Button
                        startIcon={<ChatBubbleOutlineIcon sx={{ color: theme.palette.text.primary }} />}
                        sx={{ color: theme.palette.text.primary, textTransform: 'none' }}
                        onClick={() => handleOpenComments(postDetail)}
                    >
                        Bình luận
                    </Button>
                    <Button
                        startIcon={<StarBorderIcon sx={{ color: theme.palette.text.primary }} />}
                        sx={{ color: theme.palette.text.primary, textTransform: 'none' }}
                        onClick={handleOpenRating} // NEW: Gán hàm mở dialog đánh giá
                    >
                        Đánh giá
                    </Button>
                </Box>

                {/* Các bài viết tương tự */}
                <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                    Các bài viết tương tự
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: 2,
                        pb: 1,
                        '&::-webkit-scrollbar': {
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'transparent',
                        },
                    }}
                >
                    {dummyRelatedPosts.map((relatedPost) => (
                        <Card
                            key={relatedPost.id}
                            sx={{
                                minWidth: 180,
                                maxWidth: 180,
                                boxShadow: 2,
                                borderRadius: 2,
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                                cursor: 'pointer',
                                flexShrink: 0,
                                bgcolor: theme.palette.background.default,
                                color: theme.palette.text.primary,
                            }}
                            onClick={() => window.location.href = relatedPost.link}
                        >
                            <CardMedia
                                component="img"
                                height="100"
                                image={relatedPost.thumbnail}
                                alt={relatedPost.title}
                                sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                            />
                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                <Typography
                                    variant="subtitle2"
                                    component="div"
                                    noWrap
                                    sx={{
                                        fontWeight: 'medium',
                                        color: theme.palette.text.primary,
                                        '&:hover': {
                                            color: theme.palette.primary.main,
                                        }
                                    }}
                                >
                                    {relatedPost.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Image Modal */}
                <Dialog
                    open={openImageModal}
                    onClose={handleCloseImageModal}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            transition: theme.transitions.create(['background-color', 'color'], {
                                duration: theme.transitions.duration.standard,
                            }),
                        }
                    }}
                >
                    <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        Xem ảnh
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseImageModal}
                            sx={{ position: 'absolute', right: 8, top: 8, color: theme.palette.action.active }}
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
                            borderColor: theme.palette.divider,
                        }}
                    >
                        <img
                            src={modalImageSrc}
                            alt="Zoomed"
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
                        />
                    </DialogContent>
                </Dialog>

                {/* Comment Dialog */}
                <CommentDialog
                    open={openComments}
                    onClose={handleCloseComments}
                    post={postDetail} // Changed from selectedPost to postDetail
                    user={user}
                    comments={comments} // Pass comments from usePostDetail
                    showReplies={showReplies}
                    toggleReplies={toggleReplies}
                    mode={mode}
                />

                {/* Like Dialog */}
                <LikeDialog
                    open={openLikes}
                    onClose={handleCloseLikes}
                    likedUsers={currentLikedUsers}
                    likeCount={currentLikeCount}
                    darkMode={mode === 'dark'}
                />

                {/* Edit Post Dialog */}
                {isEditingPost && currentEditingPost && (
                    <Dialog
                        open={isEditingPost}
                        onClose={handleCloseEditMode}
                        fullWidth
                        maxWidth="md"
                        PaperProps={{
                            sx: {
                                backgroundColor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                boxShadow: theme.shadows[5],
                                transition: theme.transitions.create(['background-color', 'color', 'box-shadow'], {
                                    duration: theme.transitions.duration.standard,
                                }),
                            }
                        }}
                    >
                        <DialogTitle sx={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: theme.palette.text.primary
                        }}>
                            Chỉnh sửa bài viết
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseEditMode}
                                sx={{ color: theme.palette.action.active }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ p: 2 }}>
                            <PostForm
                                user={user}
                                newPost={currentEditingPost}
                                setNewPost={setCurrentEditingPost}
                                handlePostSubmit={handleUpdatePostSubmit}
                                isEditMode={true}
                            />
                        </DialogContent>
                    </Dialog>
                )}

                {/* NEW: Rating Dialog */}
                {postDetail && user && ( // Render only if postDetail and user are available
                    <RatingDialog
                        open={openRatingDialog}
                        onClose={handleCloseRating}
                        postId={postDetail._id}
                        userId={user._id}
                        currentRating={userRating}
                        onRatePost={handleRatingSubmit}
                        totalRatings={totalRatings}
                        allRatings={allRatings}
                    />
                )}
            </Box>
        </Box>
    );
};

export default PostDetail;
