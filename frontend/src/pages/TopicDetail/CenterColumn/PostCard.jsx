import React, { useRef, useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Box, Typography, Button, Divider,
    Card, CardContent,
    Menu, MenuItem, IconButton, Avatar,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Icon trái tim rỗng
import FavoriteIcon from '@mui/icons-material/Favorite'; // Icon trái tim đầy
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star'; // Icon sao đầy

import CommentDialog from './CommentDialog';
import LikeDialog from './LikeDialog';
import RatingDialog from './RatingDialog'; // Import RatingDialog
import { ThemeContext } from '../../../context/ThemeContext';
import usePostInteractions from './usePostInteractions'; // Import custom hook

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
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Link to={`/profile/${post.authorId._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={post.authorId.avatarUrl}
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        fontSize: '0.75rem',
                                        background: post.authorId?.role === 'admin'
                                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                            : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    }}
                                >
                                    {!post.authorId.avatarUrl && post.authorId.fullName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                {post.authorId.isOnline && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: '#4CAF50',
                                            border: `2px solid ${darkMode ? '#242526' : '#ffffff'}`,
                                            zIndex: 1,
                                        }}
                                    />
                                )}
                            </Box>
                            <Typography variant="body2"
                                sx={{
                                    fontSize: '0.8rem',
                                    color: darkMode ? '#b0b3b8' : '#65676b',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                {post.authorId.fullName}
                            </Typography>
                        </Box>
                    </Link>
                    {user && user._id === post.authorId?._id && (
                        <>
                            <IconButton
                                aria-label="more"
                                aria-controls="long-menu"
                                aria-haspopup="true"
                                onClick={handleClick}
                                sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                id="long-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && postToEditOrDelete?._id === post._id}
                                onClose={handleCloseMenu}
                                PaperProps={{
                                    style: {
                                        maxHeight: 48 * 4.5,
                                        width: '20ch',
                                        backgroundColor: darkMode ? '#3a3b3c' : '#ffffff',
                                        color: darkMode ? '#e4e6eb' : '#1c1e21',
                                    },
                                }}
                            >
                                <MenuItem onClick={handleEditPost} sx={{
                                    '&:hover': { backgroundColor: darkMode ? '#555' : '#f0f0f0' }
                                }}>
                                    Chỉnh sửa
                                </MenuItem>
                                <MenuItem onClick={handleDeleteClick} sx={{
                                    color: 'red',
                                    '&:hover': { backgroundColor: darkMode ? '#555' : '#f0f0f0' }
                                }}>
                                    Xóa
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>

                <Typography
                    variant="subtitle1"
                    sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: darkMode ? '#e4e6eb' : '#1c1e21',
                        '&:hover': {
                            color: darkMode ? '#90caf9' : 'primary.main',
                            textDecoration: 'underline',
                        }
                    }}
                    onClick={() => goToDetail(post._id)}
                >
                    {post.title}
                </Typography>

                <div
                    ref={(el) => {
                        // Set contentRef
                        contentRef.current = el;

                        if (el) {
                            // Debug DOM structure after render
                            setTimeout(() => {
                                console.log('🖼️ PostCard content loaded for post:', post.title);
                                console.log('📝 Content preview:', post.content.substring(0, 200));
                                console.log('🔍 Has images in content:', post.content.includes('<img'));
                                console.log('🔗 Image URLs in content:', post.content.match(/<img[^>]+src=["']([^"']+)["']/g));

                                // Check actual DOM
                                const images = el.querySelectorAll('img');
                                console.log('🎯 Images found in DOM:', images.length);
                                images.forEach((img, index) => {
                                    const computedStyle = window.getComputedStyle(img);

                                    // Log detailed image info
                                    console.log(`📸 Image ${index + 1} SRC:`, img.src);
                                    console.log(`📸 Image ${index + 1} DIMENSIONS:`, `${img.width}x${img.height} (natural: ${img.naturalWidth}x${img.naturalHeight})`);
                                    console.log(`📸 Image ${index + 1} DISPLAY:`, computedStyle.display);
                                    console.log(`📸 Image ${index + 1} VISIBILITY:`, computedStyle.visibility);
                                    console.log(`📸 Image ${index + 1} OPACITY:`, computedStyle.opacity);
                                    console.log(`📸 Image ${index + 1} BORDER:`, computedStyle.border);
                                    console.log(`📸 Image ${index + 1} BACKGROUND:`, computedStyle.backgroundColor);
                                    console.log(`📸 Image ${index + 1} COMPLETE:`, img.complete);

                                    // Log element position and size
                                    const rect = img.getBoundingClientRect();
                                    console.log(`📐 Image ${index + 1} POSITION:`, `top: ${rect.top}, left: ${rect.left}`);
                                    console.log(`📐 Image ${index + 1} SIZE:`, `${rect.width}x${rect.height}`);
                                    console.log(`📐 Image ${index + 1} VISIBLE:`, rect.width > 0 && rect.height > 0);

                                    // Check if image is actually loaded
                                    if (img.complete && img.naturalWidth > 0) {
                                        console.log(`✅ Image ${index + 1} is loaded and has content`);
                                    } else {
                                        console.log(`❌ Image ${index + 1} is not loaded or has no content`);
                                    }
                                });

                                // Check if images are loading
                                images.forEach((img, index) => {
                                    img.onload = () => console.log(`✅ Image ${index + 1} loaded successfully`);
                                    img.onerror = () => console.log(`❌ Image ${index + 1} failed to load:`, img.src);
                                });
                            }, 100);
                        }
                    }}
                    className="post-content"
                    key={imageContentKeyLocal} // Sử dụng key để ép re-render styles ảnh
                    dangerouslySetInnerHTML={{
                        __html: (() => {
                            // Hiển thị preview ngắn (150 ký tự) cho trang xem nhanh
                            let content = post.content.length > 150 && !expandedPosts[post._id]
                                ? `${post.content.substring(0, 150)}...`
                                : post.content;

                            // Fix URLs: replace localhost:5173 with localhost:5000
                            content = content.replace(/http:\/\/localhost:5173\/upload\//g, 'http://localhost:5000/upload/');
                            // Also fix relative URLs to absolute
                            content = content.replace(/src="\/upload\//g, 'src="http://localhost:5000/upload/');

                            // Debug: Check if content has images
                            if (content.includes('<img')) {
                                console.log('🖼️ PostCard content has images:', post.title);
                                console.log('🔗 Image URLs found:', content.match(/<img[^>]+src=["']([^"']+)["']/g));
                            }

                            return content;
                        })(),
                    }}
                />

                {post.content.length > 150 && (
                    <Button
                        onClick={() => toggleExpanded(post._id)}
                        sx={{
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            color: darkMode ? '#90caf9' : 'primary.main',
                            '&:hover': {
                                color: darkMode ? '#fff' : 'primary.dark',
                                backgroundColor: 'transparent',
                            }
                        }}
                    >
                        {expandedPosts[post._id] ? 'Thu gọn' : 'Xem thêm'}
                    </Button>
                )}

                {/* Nút "Xem chi tiết" để đi đến PostDetail */}
                <Button
                    onClick={() => goToDetail(post._id)}
                    variant="outlined"
                    size="small"
                    sx={{
                        mt: 1,
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        borderColor: darkMode ? '#90caf9' : 'primary.main',
                        color: darkMode ? '#90caf9' : 'primary.main',
                        '&:hover': {
                            backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                            borderColor: darkMode ? '#fff' : 'primary.dark',
                        }
                    }}
                >
                    Xem chi tiết
                </Button>

                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Typography
                        variant="body2"
                        sx={{ cursor: 'pointer', fontSize: '0.8rem', color: darkMode ? '#90caf9' : 'primary.main' }}
                        onClick={handleOpenComments}
                    >
                        💬 {currentCommentCount}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ fontSize: '0.8rem', cursor: 'pointer', color: darkMode ? '#90caf9' : 'primary.main' }}
                        onClick={handleOpenLikes}
                    >
                        ❤️ {currentLikeCount}
                    </Typography>

                    {/* Hiển thị điểm trung bình và tổng số lượt đánh giá */}
                    <Box display="flex" alignItems="center">
                        <StarIcon sx={{ fontSize: '1rem', color: '#ffb400', mr: 0.5 }} />
                        <Typography
                            variant="body2"
                            sx={{ fontSize: '0.8rem', color: darkMode ? '#b0b3b8' : 'text.secondary' }}
                        >
                            {averageRating.toFixed(1)} ({totalRatings} lượt đánh giá)
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1, borderColor: darkMode ? '#3a3b3c' : '#eee' }} />
                <Box display="flex" justifyContent="space-around" mt={1}>
                    <Button
                        startIcon={
                            isLikedByUser ? (
                                <FavoriteIcon sx={{ color: 'red' }} />
                            ) : (
                                <FavoriteBorderIcon sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }} />
                            )
                        }
                        sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21', textTransform: 'none' }}
                        onClick={handleLikeToggle}
                    >
                        Thích
                    </Button>
                    <Button
                        startIcon={<ChatBubbleOutlineIcon />}
                        sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21', textTransform: 'none' }}
                        onClick={handleOpenComments}
                    >
                        Bình luận
                    </Button>
                    <Button
                        startIcon={<StarBorderIcon />}
                        sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21', textTransform: 'none' }}
                        onClick={handleOpenRating} // Gọi hàm mở dialog đánh giá
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
