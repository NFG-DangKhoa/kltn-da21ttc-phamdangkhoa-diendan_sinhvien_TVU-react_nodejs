import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, Divider,
    Card, CardContent,
    Dialog, DialogTitle, DialogContent, IconButton,
    List, ListItem, ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CommentDialog from './CommentDialog';
import LikeDialog from './LikeDialog';
import PostForm from './PostForm';
import ImageModal from '../../utils/ImageModal';
import { useNavigate } from 'react-router-dom';

const CenterColumn = ({
    user, topic, topicId,
    newPost, setNewPost,
    handlePostSubmit, detailedPosts,
    showComments, toggleComments,
    showReplies, toggleReplies
}) => {
    const [openLikes, setOpenLikes] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [openComments, setOpenComments] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [openLikesDialog, setOpenLikesDialog] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);

    const contentRefs = useRef({});
    const navigate = useNavigate();

    const toggleExpanded = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const goToDetail = (postId) => {
        navigate(`/posts/detail?topicId=${topicId}&postId=${postId}`);
    };

    useEffect(() => {
        detailedPosts.forEach((post) => {
            const contentDiv = contentRefs.current[post._id];
            if (contentDiv) {
                const imgs = contentDiv.querySelectorAll('img');
                imgs.forEach(img => {
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
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                    });

                    img.setAttribute('loading', 'lazy');

                    img.onclick = () => goToDetail(post._id);
                    img.onmouseenter = () => {
                        img.style.transform = 'scale(1.015)';
                        img.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
                    };
                    img.onmouseleave = () => {
                        img.style.transform = 'scale(1)';
                        img.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    };
                });
            }
        });
    }, [detailedPosts]);

    const handleOpenComments = (post) => {
        setSelectedPost(post);
        setOpenComments(true);
    };

    const handleCloseComments = () => {
        setSelectedPost(null);
        setOpenComments(false);
    };

    const handleOpenLikes = (post) => {
        setLikedUsers(post.likedUsers || []);
        setOpenLikes(true);
    };

    const handleCloseLikes = () => {
        setOpenLikes(false);
    };

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: '#f9f9f9',
                borderRadius: 2,
                width: '45vw',
                ml: 8,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
            }}
        >
            {topic && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', wordBreak: 'break-word' }}>
                        {topic.name}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {topic.description || 'Chủ đề không có mô tả'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                </>
            )}

            <PostForm
                user={user}
                newPost={newPost}
                setNewPost={setNewPost}
                handlePostSubmit={handlePostSubmit}
            />

            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>Bài viết gần đây</Typography>
            <Box sx={{ maxWidth: 5000, mx: 'auto', width: '100%' }}>
                {detailedPosts.length > 0 ? (
                    detailedPosts.map((post) => (
                        <Card key={post._id} sx={{ mb: 2, p: 1 }}>
                            <CardContent sx={{ p: 1 }}>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                    👤 {post.authorId?.fullName}
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                                    onClick={() => goToDetail(post._id)}
                                >
                                    {post.title}
                                </Typography>

                                <div
                                    ref={(el) => (contentRefs.current[post._id] = el)}
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            post.content.length > 300 && !expandedPosts[post._id]
                                                ? `${post.content.substring(0, 300)}...`
                                                : post.content,
                                    }}
                                    style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}
                                />

                                {post.content.length > 300 && (
                                    <Button
                                        onClick={() => toggleExpanded(post._id)}
                                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                    >
                                        {expandedPosts[post._id] ? 'Thu gọn' : 'Xem thêm'}
                                    </Button>
                                )}

                                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                                    <Typography
                                        variant="body2"
                                        sx={{ cursor: 'pointer', color: 'primary.main', fontSize: '0.8rem' }}
                                        onClick={() => handleOpenComments(post)}
                                    >
                                        💬 {post.comments?.length}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: '0.8rem', color: 'primary.main', cursor: 'pointer' }}
                                        onClick={() => handleOpenLikes(post)}
                                    >
                                        ❤️ {post.likeCount || 0}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: '0.8rem' }}
                                        onMouseEnter={() => setOpenLikesDialog(true)}
                                        onMouseLeave={() => setOpenLikesDialog(false)}
                                    >
                                        ⭐ {post.ratingCount || 0} lượt đánh giá
                                    </Typography>

                                    <Dialog
                                        open={openLikesDialog}
                                        onClose={() => setOpenLikesDialog(false)}
                                        fullWidth
                                        maxWidth="xs"
                                    >
                                        <DialogTitle>
                                            Danh sách người đã thích
                                            <IconButton
                                                aria-label="close"
                                                onClick={() => setOpenLikesDialog(false)}
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
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                        Chưa có bài viết nào.
                    </Typography>
                )}
            </Box>

            <CommentDialog
                open={openComments}
                onClose={handleCloseComments}
                post={selectedPost}
                showReplies={showReplies}
                toggleReplies={toggleReplies}
            />
            <LikeDialog open={openLikes} onClose={handleCloseLikes} likedUsers={likedUsers} />
            <ImageModal selectedImage={selectedImage} onClose={() => setSelectedImage(null)} />
        </Box>
    );
};

export default CenterColumn;
