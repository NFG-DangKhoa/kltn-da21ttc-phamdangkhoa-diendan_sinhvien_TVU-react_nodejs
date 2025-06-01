import React, { useEffect, useState, useRef, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    IconButton, List, ListItem, ListItemText, Divider, useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// Import the missing icons
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import CommentDialog from './CenterColumn/CommentDialog';
import LikeDialog from './CenterColumn/LikeDialog';
import { ThemeContext } from '../../context/ThemeContext';
import usePostDetail from './usePostDetail'; // Import the new hook
import { AuthContext } from '../../context/AuthContext'; // Assuming you have an AuthContext for user info

const PostDetail = () => {
    const [searchParams] = useSearchParams();
    const topicId = searchParams.get('topicId');
    const postId = searchParams.get('postId');

    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const { user } = useContext(AuthContext); // Get current user from AuthContext

    // Use the custom hook for post details and interactions
    const {
        postDetail,
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleLikeToggle,
    } = usePostDetail(topicId, postId, user); // Pass user to the hook

    const [openLikes, setOpenLikes] = useState(false);
    const [openComments, setOpenComments] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // Keep for CommentDialog

    const [openImageModal, setOpenImageModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    const contentRef = useRef(null);

    // State for showing replies (moved here, or could be in a more granular comment hook)
    const [showReplies, setShowReplies] = useState({});
    const toggleReplies = (commentId) => {
        setShowReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    // Apply styles and click handlers for images in content
    useEffect(() => {
        if (!postDetail) return;

        const contentElement = contentRef.current;
        if (!contentElement) return;

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

        // Apply general content styles based on theme
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
    }, [postDetail, mode]); // Dependency array: re-run when postDetail or mode changes

    const handleOpenLikes = () => {
        setOpenLikes(true);
    };

    const handleCloseLikes = () => {
        setOpenLikes(false);
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
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                transition: theme.transitions.create(['background-color', 'color'], {
                    duration: theme.transitions.duration.standard,
                }),
                mt: 10,
            }}
        >
            {!postDetail ? (
                <Typography color={theme.palette.text.primary}>Đang tải bài viết...</Typography>
            ) : (
                <Box>
                    {/* Title and Author */}
                    <Typography variant="subtitle2" color={theme.palette.text.secondary}>
                        👤 {postDetail.authorId?.fullName}
                    </Typography>
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

                        <Typography
                            variant="body2"
                            sx={{ fontSize: '0.8rem', mt: 1, color: theme.palette.text.secondary }}
                        >
                            ⭐ {postDetail.ratingCount || 0} lượt đánh giá
                        </Typography>
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

                    {/* Like/Comment/Rating buttons, similar to PostCard */}
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
                            onClick={() => { /* Logic for rating */ }}
                        >
                            Đánh giá
                        </Button>
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
                        post={selectedPost}
                        user={user} // Pass user to CommentDialog
                        showReplies={showReplies}
                        toggleReplies={toggleReplies}
                        mode={mode}
                    />

                    {/* Like Dialog */}
                    <LikeDialog
                        open={openLikes}
                        onClose={handleCloseLikes}
                        likedUsers={currentLikedUsers} // Use currentLikedUsers from hook
                        likeCount={currentLikeCount} // Pass currentLikeCount to LikeDialog
                        mode={mode}
                    />
                </Box>
            )}
        </Box>
    );
};

export default PostDetail;