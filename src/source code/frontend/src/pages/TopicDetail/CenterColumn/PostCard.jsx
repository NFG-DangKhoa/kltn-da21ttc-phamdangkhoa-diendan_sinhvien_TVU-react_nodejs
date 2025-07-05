import React, { useRef, useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Box, Typography, Button, Divider,
    Card, CardContent,
    Menu, MenuItem, IconButton, Avatar, Tooltip, Rating
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Icon trái tim rỗng
import FavoriteIcon from '@mui/icons-material/Favorite'; // Icon trái tim đầy
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star'; // Icon sao đầy
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';


import CommentDialog from './CommentDialog';
import LikeDialog from './LikeDialog';
import RatingDialog from './RatingDialog'; // Import RatingDialog
import { ThemeContext } from '../../../context/ThemeContext';
import usePostInteractions from './usePostInteractions'; // Import custom hook

// Helper function to construct full URL for images
const constructUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

const PostCard = ({
    post: initialPost, // Đổi tên prop đầu vào để tránh xung đột với state nội bộ
    user,
    toggleExpanded,
    expandedPosts,
    goToDetail,
    setDetailedPosts, // Passed down to usePostInteractions for deletion
    handleEditPostFromCenterColumn,
}) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    const [openComments, setOpenComments] = useState(false);
    const [selectedPostForComments, setSelectedPostForComments] = useState(null);
    const [openLikes, setOpenLikes] = useState(false);
    const [openRatingDialog, setOpenRatingDialog] = useState(false); // State cho RatingDialog

    const contentRef = useRef(null);

    const [anchorEl, setAnchorEl] = useState(null);
    const [postToEditOrDelete, setPostToEditOrDelete] = useState(null);

    // Sử dụng custom hook để quản lý tất cả logic tương tác
    const {
        post, // Bài viết đã được cập nhật từ hook (bao gồm comments, likes, ratings...)
        comments, // Danh sách bình luận đã được sắp xếp và cập nhật realtime
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleDeletePost, // Hàm xóa bài viết từ hook
        handleLikeToggle, // Hàm toggle like từ hook
        averageRating, // Điểm trung bình từ hook
        totalRatings, // Tổng số lượt đánh giá từ hook
        userRating, // Điểm đánh giá của người dùng hiện tại từ hook
        allRatings, // NEW: Danh sách tất cả các đánh giá chi tiết từ hook
        handleRatePost, // Hàm gửi đánh giá từ hook
    } = usePostInteractions(initialPost, user, setDetailedPosts); // Truyền `initialPost` và `setDetailedPosts` vào hook



    // State cục bộ để kích hoạt việc áp dụng style ảnh lại khi nội dung thay đổi
    const [imageContentKeyLocal, setImageContentKeyLocal] = useState(0);

    // Effect để lắng nghe sự thay đổi của post.content (từ hook) và kích hoạt setImageContentKeyLocal
    useEffect(() => {
        setImageContentKeyLocal(prevKey => prevKey + 1);
    }, [post.content]);


    // DI CHUYỂN LOGIC ÁP DỤNG STYLE VÀ XỬ LÝ HÌNH ẢNH VÀO TRONG useEffect
    useEffect(() => {
        const contentDiv = contentRef.current;
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
                    boxShadow: darkMode ? '0 2px 8px rgba(255, 255, 255, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                });
                img.setAttribute('loading', 'lazy');
                img.onclick = () => goToDetail(post._id);
            });

            const updateContentStyles = () => {
                const elements = contentDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, strong, em, pre, code, ul, ol, li, a, blockquote');
                elements.forEach(el => {
                    if (el.tagName === 'A') {
                        el.style.color = darkMode ? '#90caf9' : '#1976d2';
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
                        el.style.color = darkMode ? '#d0d0d0' : '#333333';
                    }
                });
            };
            updateContentStyles();
        }
    }, [post, darkMode, goToDetail, imageContentKeyLocal]); // Dependency array bao gồm post và imageContentKeyLocal

    const handleClick = useCallback((event) => {
        setAnchorEl(event.currentTarget);
        setPostToEditOrDelete(post); // Sử dụng post đã được cập nhật từ hook
    }, [post]);

    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
        setPostToEditOrDelete(null);
    }, []);

    const handleDeleteClick = useCallback(async () => {
        if (!postToEditOrDelete) return;
        const success = await handleDeletePost(postToEditOrDelete._id); // Gọi hàm xóa từ hook
        if (success) {
            handleCloseMenu();
        }
    }, [postToEditOrDelete, handleDeletePost, handleCloseMenu]); // Thêm handleDeletePost vào dependencies

    const handleEditPost = useCallback(() => {
        handleCloseMenu();
        if (handleEditPostFromCenterColumn) {
            handleEditPostFromCenterColumn(post); // Sử dụng post đã được cập nhật
        }
    }, [handleCloseMenu, handleEditPostFromCenterColumn, post]);

    const handleOpenComments = useCallback(() => {
        setSelectedPostForComments(post);
        setOpenComments(true);
    }, [post]);

    const handleCloseComments = useCallback(() => {
        setSelectedPostForComments(null);
        setOpenComments(false);
    }, []);

    const handleOpenLikes = useCallback(() => {
        setOpenLikes(true);
    }, []);

    const handleCloseLikes = useCallback(() => {
        setOpenLikes(false);
    }, []);

    // Hàm mở dialog đánh giá
    const handleOpenRating = useCallback(() => {
        if (!user || !user._id) {
            alert('Bạn cần đăng nhập để đánh giá bài viết.');
            return;
        }
        setOpenRatingDialog(true);
    }, [user]);

    // Hàm đóng dialog đánh giá
    const handleCloseRating = useCallback(() => {
        setOpenRatingDialog(false);
    }, []);

    // Hàm xử lý gửi đánh giá, sẽ được truyền xuống RatingDialog
    const handleRatingSubmit = useCallback(async (postId, userId, rating) => {
        console.log("Attempting to submit rating for postId:", postId, "with rating:", rating);
        try {
            await handleRatePost(postId, userId, rating);
            console.log("Rating submitted successfully for postId:", postId);
        } catch (error) {
            console.error("Error submitting rating from PostCard (caught by PostCard):", error);
            throw error; // Ném lại lỗi để RatingDialog có thể xử lý
        }
    }, [handleRatePost]);


    return (
        <Card
            sx={{
                mb: 2,
                p: 1,
                backgroundColor: darkMode ? '#242526' : '#ffffff',
                color: darkMode ? '#e4e6eb' : '#1c1e21',
                boxShadow: darkMode ? '0px 0px 5px rgba(255,255,255,0.1)' : '0px 0px 5px rgba(0,0,0,0.1)',
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
            }}
        >
            <CardContent sx={{ p: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Link to={`/profile/${post.authorId._id}`} style={{ textDecoration: 'none' }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={post.authorId?.avatarUrl ? constructUrl(post.authorId.avatarUrl) : undefined}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        border: `2px solid ${post.authorId?.role === 'admin' ? '#ef4444' : '#3b82f6'}`,
                                    }}
                                >
                                    {post.authorId && !post.authorId.avatarUrl && post.authorId.fullName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                {post.authorId.isOnline && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 2,
                                            right: 2,
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            backgroundColor: '#4CAF50',
                                            border: `2px solid ${darkMode ? '#242526' : '#ffffff'}`,
                                        }}
                                    />
                                )}
                            </Box>
                        </Link>
                        <Box>
                            <Link to={`/profile/${post.authorId._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#050505', '&:hover': { textDecoration: 'underline' } }}>
                                    {post.authorId.fullName}
                                </Typography>
                            </Link>
                            <Tooltip title={new Date(post.createdAt).toLocaleString()}>
                                <Typography variant="caption" sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>
                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Box>
                    {user && user._id === post.authorId?._id && (
                        <>
                            <IconButton
                                aria-label="more"
                                onClick={handleClick}
                                sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && postToEditOrDelete?._id === post._id}
                                onClose={handleCloseMenu}
                                PaperProps={{
                                    sx: {
                                        backgroundColor: darkMode ? '#3a3b3c' : '#ffffff',
                                        color: darkMode ? '#e4e6eb' : '#1c1e21',
                                    },
                                }}
                            >
                                <MenuItem onClick={handleEditPost}>Chỉnh sửa</MenuItem>
                                <MenuItem onClick={handleDeleteClick} sx={{ color: 'red' }}>Xóa</MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>

                <Typography
                    variant="h6"
                    sx={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        my: 1.5,
                        color: darkMode ? '#e4e6eb' : '#1c1e21',
                        '&:hover': {
                            textDecoration: 'underline',
                        }
                    }}
                    onClick={() => goToDetail(post._id)}
                >
                    {post.title}
                </Typography>

                <div
                    ref={contentRef}
                    className="post-content"
                    key={imageContentKeyLocal}
                    style={{ cursor: 'pointer' }}
                    onClick={() => goToDetail(post._id)}
                    dangerouslySetInnerHTML={{
                        __html: (() => {
                            let content = post.content;
                            if (post.content.length > 350 && !expandedPosts[post._id]) {
                                content = `${post.content.substring(0, 350)}...`;
                            }
                            content = content.replace(/http:\/\/localhost:5173\/upload\//g, 'http://localhost:5000/upload/');
                            content = content.replace(/src="\/upload\//g, 'src="http://localhost:5000/upload/');
                            return content;
                        })(),
                    }}
                />

                {post.content.length > 350 && (
                    <Button
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn sự kiện click lan ra div cha
                            toggleExpanded(post._id);
                        }}
                        sx={{ textTransform: 'none', color: darkMode ? '#90caf9' : 'primary.main', p: 0, mt: 1 }}
                    >
                        {expandedPosts[post._id] ? 'Thu gọn' : 'Xem thêm'}
                    </Button>
                )}

                <Box mt={1.5} display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer' }} onClick={handleOpenLikes}>
                        <FavoriteIcon sx={{ color: 'red', fontSize: '1rem' }} />
                        <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>
                            {currentLikeCount}
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : '#65676b', cursor: 'pointer' }} onClick={handleOpenComments}>
                            {currentCommentCount} bình luận
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer' }} onClick={handleOpenRating}>
                            <Rating
                                name="read-only"
                                value={averageRating}
                                precision={0.5}
                                readOnly
                                size="small"
                                emptyIcon={<StarBorderIcon sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)' }} />}
                            />
                            <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>
                                ({totalRatings})
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 1, borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' }} />
                <Box display="flex" justifyContent="space-around">
                    <Button
                        fullWidth
                        startIcon={isLikedByUser ? <FavoriteIcon sx={{ color: 'red' }} /> : <FavoriteBorderIcon />}
                        sx={{
                            color: isLikedByUser ? 'red' : (darkMode ? '#b0b3b8' : '#65676b'),
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
                        }}
                        onClick={handleLikeToggle}
                    >
                        Thích
                    </Button>
                    <Button
                        fullWidth
                        startIcon={<ChatBubbleOutlineIcon />}
                        sx={{
                            color: darkMode ? '#b0b3b8' : '#65676b',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
                        }}
                        onClick={handleOpenComments}
                    >
                        Bình luận
                    </Button>
                    <Button
                        fullWidth
                        startIcon={<StarBorderIcon />}
                        sx={{
                            color: darkMode ? '#b0b3b8' : '#65676b',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
                        }}
                        onClick={handleOpenRating}
                    >
                        Đánh giá
                    </Button>
                </Box>

                {/* Comment Dialog */}
                <CommentDialog
                    open={openComments}
                    onClose={handleCloseComments}
                    post={selectedPostForComments}
                    user={user}
                    comments={comments}
                />
                {/* Like Dialog */}
                <LikeDialog
                    open={openLikes}
                    onClose={handleCloseLikes}
                    likedUsers={currentLikedUsers}
                    likeCount={currentLikeCount}
                    darkMode={darkMode}
                />
                {/* Rating Dialog */}
                {post && user && ( // Chỉ render khi có đủ post và user
                    <RatingDialog
                        open={openRatingDialog}
                        onClose={handleCloseRating}
                        postId={post._id}
                        userId={user._id}
                        currentRating={userRating}
                        onRatePost={handleRatingSubmit}
                        totalRatings={totalRatings} // NEW: Truyền tổng số lượt đánh giá
                        allRatings={allRatings} // NEW: Truyền danh sách chi tiết các đánh giá
                        averageRating={averageRating} // NEW: Truyền điểm trung bình
                    />
                )}
            </CardContent>
        </Card>
    );
};

export default PostCard;
