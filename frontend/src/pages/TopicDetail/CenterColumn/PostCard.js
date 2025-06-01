// src/components/central/PostCard.js
import React, { useRef, useState, useEffect, useContext, useCallback } from 'react';
import {
    Box, Typography, Button, Divider,
    Card, CardContent,
    Menu, MenuItem, IconButton,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Icon trái tim rỗng
import FavoriteIcon from '@mui/icons-material/Favorite'; // Icon trái tim đầy
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import CommentDialog from './CommentDialog';
import LikeDialog from './LikeDialog';
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
    // selectedPost sẽ luôn là `post` được trả về từ hook
    const [selectedPostForComments, setSelectedPostForComments] = useState(null);
    const [openLikes, setOpenLikes] = useState(false);

    const contentRef = useRef(null);

    const [anchorEl, setAnchorEl] = useState(null);
    const [postToEditOrDelete, setPostToEditOrDelete] = useState(null);

    // Sử dụng custom hook để quản lý tất cả logic tương tác
    const {
        post, // Bài viết đã được cập nhật từ hook (bao gồm comments, likes...)
        comments, // Danh sách bình luận đã được sắp xếp và cập nhật realtime
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleDeletePost, // Hàm xóa bài viết từ hook
        handleLikeToggle, // Hàm toggle like từ hook
    } = usePostInteractions(initialPost, user, setDetailedPosts); // Truyền `initialPost` và `setDetailedPosts` vào hook

    // State cục bộ để kích hoạt việc áp dụng style ảnh lại khi nội dung thay đổi
    const [imageContentKeyLocal, setImageContentKeyLocal] = useState(0);

    // Effect để lắng nghe sự thay đổi của post.content (từ hook) và kích hoạt setImageContentKeyLocal
    useEffect(() => {
        // Chỉ kích hoạt khi post.content thực sự thay đổi sau khi được cập nhật từ hook
        // (ví dụ: khi bài viết được chỉnh sửa và post prop thay đổi)
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
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    boxShadow: darkMode ? '0 2px 8px rgba(255, 255, 255, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                });
                img.setAttribute('loading', 'lazy');
                // Sử dụng goToDetail trực tiếp, đảm bảo post._id là chính xác
                img.onclick = () => goToDetail(post._id);
                img.onmouseenter = () => {
                    img.style.transform = 'scale(1.015)';
                    img.style.boxShadow = darkMode ? '0 4px 16px rgba(255,255,255,0.2)' : '0 4px 16px rgba(0,0,0,0.2)';
                };
                img.onmouseleave = () => {
                    img.style.transform = 'scale(1)';
                    img.style.boxShadow = darkMode ? '0 2px 8px rgba(255, 255, 255, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)';
                };
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
        // selectedPostForComments sẽ luôn là `post` đã được cập nhật từ hook
        setSelectedPostForComments(post);
        setOpenComments(true);
        // Không cần fetchComments ở đây nữa vì comments đã được cập nhật qua Socket.IO trong hook
    }, [post]); // Thêm post vào dependencies

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
                    <Typography variant="body2"
                        sx={{ fontSize: '0.875rem', color: darkMode ? '#b0b3b8' : '#65676b' }}
                    >
                        👤 {post.authorId?.fullName}
                    </Typography>
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
                    ref={contentRef}
                    className="post-content"
                    key={imageContentKeyLocal} // Sử dụng key để ép re-render styles ảnh
                    dangerouslySetInnerHTML={{
                        __html:
                            post.content.length > 300 && !expandedPosts[post._id]
                                ? `${post.content.substring(0, 300)}...`
                                : post.content,
                    }}
                />

                {post.content.length > 300 && (
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

                    <Typography
                        variant="body2"
                        sx={{ fontSize: '0.8rem', color: darkMode ? '#b0b3b8' : 'text.secondary' }}
                    >
                        ⭐ {post.ratingCount || 0} lượt đánh giá
                    </Typography>
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
                        onClick={() => { /* Logic xử lý đánh giá */ }}
                    >
                        Đánh giá
                    </Button>
                </Box>

                {/* Comment Dialog */}
                <CommentDialog
                    open={openComments}
                    onClose={handleCloseComments}
                    post={selectedPostForComments} // Truyền post đã được cập nhật từ hook
                    user={user}
                    comments={comments} // Truyền danh sách bình luận đã được cập nhật realtime từ hook
                />
                {/* Like Dialog */}
                <LikeDialog
                    open={openLikes}
                    onClose={handleCloseLikes}
                    likedUsers={currentLikedUsers}
                    likeCount={currentLikeCount}
                    darkMode={darkMode}
                />
            </CardContent>
        </Card>
    );
};

export default PostCard;