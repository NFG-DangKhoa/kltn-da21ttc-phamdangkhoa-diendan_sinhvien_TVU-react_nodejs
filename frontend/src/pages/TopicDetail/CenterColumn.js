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
    showReplies, toggleReplies,
    darkMode // Nhận prop darkMode
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
                        boxShadow: darkMode ? '0 2px 8px rgba(255, 255, 255, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)', // Áp dụng shadow theo darkMode
                        cursor: 'pointer',
                    });

                    img.setAttribute('loading', 'lazy');

                    img.onclick = () => goToDetail(post._id);
                    img.onmouseenter = () => {
                        img.style.transform = 'scale(1.015)';
                        img.style.boxShadow = darkMode ? '0 4px 16px rgba(255,255,255,0.2)' : '0 4px 16px rgba(0,0,0,0.2)'; // Shadow khi hover
                    };
                    img.onmouseleave = () => {
                        img.style.transform = 'scale(1)';
                        img.style.boxShadow = darkMode ? '0 2px 8px rgba(255, 255, 255, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)'; // Shadow khi không hover
                    };
                });

                // Áp dụng màu cho các thẻ HTML nội dung khác trong post.content
                const updateContentStyles = () => {
                    const elements = contentDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, strong, em, pre, code, ul, ol, li, a, blockquote');
                    elements.forEach(el => {
                        if (el.tagName === 'A') {
                            el.style.color = darkMode ? '#90caf9' : '#1976d2'; // Màu link
                        } else if (el.tagName === 'BLOCKQUOTE') {
                            el.style.borderLeft = darkMode ? '4px solid #666' : '4px solid #ccc';
                            el.style.color = darkMode ? '#aaa' : '#555';
                        } else if (el.tagName === 'PRE') {
                            el.style.backgroundColor = darkMode ? '#333' : '#f4f4f4';
                            el.style.color = darkMode ? '#eee' : '#333';
                            el.style.border = darkMode ? '1px solid #444' : '1px solid #ddd';
                        } else if (el.tagName === 'CODE') {
                            el.style.backgroundColor = darkMode ? '#444' : '#f0f0f0';
                            el.style.color = darkMode ? '#ffb300' : '#d81b60';
                        } else {
                            el.style.color = darkMode ? '#d0d0d0' : '#333333'; // Màu chữ chung cho nội dung
                        }
                    });
                };
                updateContentStyles();
            }
        });
    }, [detailedPosts, darkMode]); // Thêm darkMode vào dependencies để update styles khi chế độ thay đổi

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
                // Màu nền của toàn bộ cột CenterColumn
                backgroundColor: darkMode ? '#121212' : '#f0f2f5', // Màu nền tổng thể của cột
                color: darkMode ? '#e4e6eb' : '#1c1e21', // Màu chữ mặc định cho cột
                borderRadius: 2,
                width: '45vw', // Giữ nguyên độ rộng
                ml: 8,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                boxShadow: 'none',
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
            }}
        >
            {topic && (
                <>
                    <Typography variant="h6" gutterBottom
                        sx={{ fontSize: '1rem', wordBreak: 'break-word', color: darkMode ? '#e4e6eb' : '#1c1e21' }} // Màu tiêu đề
                    >
                        {topic.name}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom
                        sx={{ fontSize: '0.875rem', color: darkMode ? '#b0b3b8' : 'text.secondary' }} // Màu mô tả
                    >
                        {topic.description || 'Chủ đề không có mô tả'}
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: darkMode ? '#3a3b3c' : '#eee' }} />
                </>
            )}

            {/* PostForm - Truyền darkMode xuống */}
            <PostForm
                user={user}
                newPost={newPost}
                setNewPost={setNewPost}
                handlePostSubmit={handlePostSubmit}
                darkMode={darkMode} // Truyền prop darkMode
            />

            <Typography variant="h6" gutterBottom
                sx={{ fontSize: '1rem', color: darkMode ? '#e4e6eb' : '#1c1e21', mt: 3 }} // Màu tiêu đề
            >
                Bài viết gần đây
            </Typography>
            <Box sx={{ maxWidth: 5000, mx: 'auto', width: '100%' }}>
                {detailedPosts.length > 0 ? (
                    detailedPosts.map((post) => (
                        <Card key={post._id}
                            sx={{
                                mb: 2,
                                p: 1,
                                // Nền của mỗi Card bài viết
                                backgroundColor: darkMode ? '#242526' : '#ffffff', // Xám đậm cho ban đêm, trắng cho ban ngày
                                color: darkMode ? '#e4e6eb' : '#1c1e21', // Màu chữ mặc định trong card
                                boxShadow: darkMode ? '0px 0px 5px rgba(255,255,255,0.1)' : '0px 0px 5px rgba(0,0,0,0.1)',
                                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                            }}
                        >
                            <CardContent sx={{ p: 1 }}>
                                <Typography variant="body2"
                                    sx={{ fontSize: '0.875rem', color: darkMode ? '#b0b3b8' : '#65676b' }} // Màu chữ tác giả
                                >
                                    👤 {post.authorId?.fullName}
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        color: darkMode ? '#e4e6eb' : '#1c1e21', // Màu tiêu đề bài viết
                                        '&:hover': {
                                            color: darkMode ? '#90caf9' : 'primary.main', // Màu hover
                                            textDecoration: 'underline',
                                        }
                                    }}
                                    onClick={() => goToDetail(post._id)}
                                >
                                    {post.title}
                                </Typography>

                                {/* Nội dung bài viết */}
                                <div
                                    ref={(el) => (contentRefs.current[post._id] = el)}
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            post.content.length > 300 && !expandedPosts[post._id]
                                                ? `${post.content.substring(0, 300)}...`
                                                : post.content,
                                    }}
                                    sx={{
                                        fontSize: '0.9rem',
                                        wordBreak: 'break-word',
                                        color: darkMode ? '#d0d0d0' : '#333333', // Màu chữ của nội dung chính
                                        // Các style cho nội dung HTML bên trong bài viết hiển thị (tương tự PostForm)
                                        '& img': {
                                            maxWidth: '100%',
                                            height: 'auto',
                                            display: 'block',
                                            margin: '12px auto',
                                            border: darkMode ? '1px solid #555' : '1px solid #ddd',
                                            borderRadius: '4px',
                                            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease',
                                        },
                                        '& a': { color: darkMode ? '#90caf9' : '#1976d2' },
                                        '& blockquote': {
                                            borderLeft: darkMode ? '4px solid #666' : '4px solid #ccc',
                                            color: darkMode ? '#aaa' : '#555',
                                        },
                                        '& pre': {
                                            backgroundColor: darkMode ? '#333' : '#f4f4f4',
                                            color: darkMode ? '#eee' : '#333',
                                            border: darkMode ? '1px solid #444' : '1px solid #ddd',
                                        },
                                        '& code': {
                                            backgroundColor: darkMode ? '#444' : '#f0f0f0',
                                            color: darkMode ? '#ffb300' : '#d81b60',
                                        },
                                        '& ul, & ol': {
                                            color: darkMode ? '#d0d0d0' : '#333333',
                                        },
                                    }}
                                />

                                {post.content.length > 300 && (
                                    <Button
                                        onClick={() => toggleExpanded(post._id)}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '0.75rem',
                                            color: darkMode ? '#90caf9' : 'primary.main', // Màu nút xem thêm
                                            '&:hover': {
                                                color: darkMode ? '#fff' : 'primary.dark',
                                                backgroundColor: 'transparent',
                                            }
                                        }}
                                    >
                                        {expandedPosts[post._id] ? 'Thu gọn' : 'Xem thêm'}
                                    </Button>
                                )}

                                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                                    <Typography
                                        variant="body2"
                                        sx={{ cursor: 'pointer', fontSize: '0.8rem', color: darkMode ? '#90caf9' : 'primary.main' }}
                                        onClick={() => handleOpenComments(post)}
                                    >
                                        💬 {post.comments?.length}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: '0.8rem', cursor: 'pointer', color: darkMode ? '#90caf9' : 'primary.main' }}
                                        onClick={() => handleOpenLikes(post)}
                                    >
                                        ❤️ {post.likeCount || 0}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: '0.8rem', color: darkMode ? '#b0b3b8' : 'text.secondary' }} // Màu chữ đánh giá
                                        onMouseEnter={() => setOpenLikesDialog(true)}
                                        onMouseLeave={() => setOpenLikesDialog(false)}
                                    >
                                        ⭐ {post.ratingCount || 0} lượt đánh giá
                                    </Typography>

                                    {/* Dialog cho danh sách người đã thích */}
                                    <Dialog
                                        open={openLikesDialog}
                                        onClose={() => setOpenLikesDialog(false)}
                                        fullWidth
                                        maxWidth="xs"
                                        PaperProps={{
                                            sx: {
                                                backgroundColor: darkMode ? '#242526' : '#ffffff', // Nền của Dialog
                                                color: darkMode ? '#e4e6eb' : '#1c1e21', // Màu chữ mặc định cho Dialog
                                                transition: 'background-color 0.4s ease, color 0.4s ease',
                                            }
                                        }}
                                    >
                                        <DialogTitle
                                            sx={{
                                                backgroundColor: darkMode ? '#242526' : '#ffffff',
                                                color: darkMode ? '#e4e6eb' : '#1c1e21',
                                                borderBottom: darkMode ? '1px solid #3a3b3c' : '1px solid #eee',
                                                transition: 'background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease',
                                            }}
                                        >
                                            Danh sách người đã thích
                                            <IconButton
                                                aria-label="close"
                                                onClick={() => setOpenLikesDialog(false)}
                                                sx={{ position: 'absolute', right: 8, top: 8, color: darkMode ? '#e4e6eb' : '#1c1e21' }}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </DialogTitle>
                                        <DialogContent sx={{ backgroundColor: darkMode ? '#242526' : '#ffffff', transition: 'background-color 0.4s ease' }}>
                                            <List>
                                                {likedUsers.map((user, index) => (
                                                    <ListItem key={index}
                                                        sx={{
                                                            '&:hover': { backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5' },
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={`👤 ${user.fullName}`}
                                                            primaryTypographyProps={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }}
                                                        />
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
                    <Typography variant="body2" sx={{ fontSize: '0.9rem', color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                        Chưa có bài viết nào.
                    </Typography>
                )}
            </Box>

            {/* Truyền darkMode vào các Dialog con nếu chúng cũng cần thay đổi màu sắc */}
            <CommentDialog
                open={openComments}
                onClose={handleCloseComments}
                post={selectedPost}
                showReplies={showReplies}
                toggleReplies={toggleReplies}
                darkMode={darkMode} // Truyền prop darkMode
            />
            <LikeDialog
                open={openLikes}
                onClose={handleCloseLikes}
                likedUsers={likedUsers}
                darkMode={darkMode} // Truyền prop darkMode
            />
            <ImageModal selectedImage={selectedImage} onClose={() => setSelectedImage(null)} darkMode={darkMode} /> {/* Truyền prop darkMode */}
        </Box>
    );
};

export default CenterColumn;