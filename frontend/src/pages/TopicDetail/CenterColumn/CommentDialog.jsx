import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Button,
    TextField, Avatar, Collapse, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import CancelIcon from '@mui/icons-material/Cancel';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { ThemeContext } from '../../../context/ThemeContext';
import socket from '../../../socket'; // Sử dụng socket chung

const CommentDialog = ({ open, onClose, post, user, onCommentActionSuccess }) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    const [displayedComments, setDisplayedComments] = useState([]);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [showRepliesMap, setShowRepliesMap] = useState({});
    const [likingComments, setLikingComments] = useState(new Set()); // Track comments being liked
    const [expandedComments, setExpandedComments] = useState(new Set()); // Track expanded nested comments

    // Sử dụng useRef để kiểm soát việc khởi tạo ban đầu của comments
    const initialCommentsLoaded = useRef(false);

    // --- SỬA ĐOẠN NÀY ---
    useEffect(() => {
        if (open && post && !initialCommentsLoaded.current) {
            // Gọi API để lấy toàn bộ cây bình luận mới nhất
            axios.get(`http://localhost:5000/api/comments/post/${post._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(res => {
                    // Sắp xếp bình luận gốc theo thời gian tạo giảm dần
                    const sortedRootComments = [...(res.data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setDisplayedComments(sortedRootComments);
                    setNewCommentContent('');
                    setReplyingTo(null);
                    setShowRepliesMap({});
                    initialCommentsLoaded.current = true;
                })
                .catch(err => {
                    setDisplayedComments([]);
                    initialCommentsLoaded.current = true;
                });
        } else if (!open) {
            setDisplayedComments([]);
            setNewCommentContent('');
            setReplyingTo(null);
            setShowRepliesMap({});
            initialCommentsLoaded.current = false;
        }
    }, [open, post]);

    // Scroll to specific comment when dialog opens with hash
    useEffect(() => {
        if (open && displayedComments.length > 0) {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#comment-')) {
                // Wait for dialog content to render
                setTimeout(() => {
                    const element = document.querySelector(hash);
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                        // Highlight the comment briefly
                        element.style.backgroundColor = '#1976d2' + '20';
                        setTimeout(() => {
                            element.style.backgroundColor = '';
                        }, 3000);
                    }
                }, 500);
            }
        }
    }, [open, displayedComments]);
    // --- HẾT SỬA ĐOẠN NÀY ---

    // Socket.IO event listeners
    useEffect(() => {
        // Chỉ lắng nghe khi có postId và dialog đang mở
        // Hoặc khi initialCommentsLoaded.current đã là true (đảm bảo comments đã được khởi tạo)
        if (!post?._id || !open) return;

        console.log(`Joining post room: ${post._id}`);
        socket.emit('joinPostRoom', post._id);

        const handleNewComment = (newComment) => {
            if (newComment.postId === post._id) {
                console.log("New comment received via Socket.IO:", newComment);
                setDisplayedComments(prevComments => {
                    if (newComment.parentCommentId) {
                        // Recursive function to find and update parent comment at any level
                        const updateNestedComments = (comments) => {
                            return comments.map(comment => {
                                if (comment._id === newComment.parentCommentId) {
                                    const updatedReplies = Array.isArray(comment.replies) ? [...comment.replies, newComment] : [newComment];
                                    return {
                                        ...comment,
                                        replies: updatedReplies,
                                        replyCount: (comment.replyCount || 0) + 1
                                    };
                                }
                                if (comment.replies && comment.replies.length > 0) {
                                    return {
                                        ...comment,
                                        replies: updateNestedComments(comment.replies)
                                    };
                                }
                                return comment;
                            });
                        };
                        return updateNestedComments(prevComments);
                    } else {
                        // Nếu là bình luận gốc, thêm vào đầu danh sách comments
                        return [newComment, ...prevComments];
                    }
                });

                // Tự động mở replies sau khi nhận được phản hồi mới
                if (newComment.parentCommentId) {
                    setShowRepliesMap(prev => ({ ...prev, [newComment.parentCommentId]: true }));
                    setExpandedComments(prev => new Set([...prev, newComment.parentCommentId]));
                }

                // Kích hoạt callback để cập nhật commentCount của post ở PostCard
                if (onCommentActionSuccess) {
                    onCommentActionSuccess();
                }
            }
        };

        const handleDeletedComment = ({ commentId, postId, parentCommentId }) => {
            if (postId === post._id) {
                console.log("Deleted comment received via Socket.IO:", commentId, parentCommentId);
                setDisplayedComments(prevComments => {
                    if (parentCommentId) {
                        // Recursive function to find and delete nested comment
                        const deleteNestedComment = (comments) => {
                            return comments.map(comment => {
                                if (comment._id === parentCommentId && comment.replies) {
                                    const filteredReplies = comment.replies.filter(reply => reply._id !== commentId);
                                    return {
                                        ...comment,
                                        replies: filteredReplies,
                                        replyCount: Math.max(0, (comment.replyCount || 0) - 1)
                                    };
                                }
                                if (comment.replies && comment.replies.length > 0) {
                                    return {
                                        ...comment,
                                        replies: deleteNestedComment(comment.replies)
                                    };
                                }
                                return comment;
                            });
                        };
                        return deleteNestedComment(prevComments);
                    } else {
                        // Xóa bình luận gốc
                        return prevComments.filter(comment => comment._id !== commentId);
                    }
                });

                // Kích hoạt callback để cập nhật commentCount của post ở PostCard
                if (onCommentActionSuccess) {
                    onCommentActionSuccess();
                }
            }
        };

        const handleUpdatedComment = (updatedComment) => {
            if (updatedComment.postId === post._id) {
                console.log("Updated comment received via Socket.IO:", updatedComment);
                setDisplayedComments(prevComments => {
                    const updateNestedComment = (comments) => {
                        return comments.map(comment => {
                            if (comment._id === updatedComment._id) {
                                return updatedComment;
                            }
                            if (comment.replies && comment.replies.length > 0) {
                                return {
                                    ...comment,
                                    replies: updateNestedComment(comment.replies)
                                };
                            }
                            return comment;
                        });
                    };
                    return updateNestedComment(prevComments);
                });
            }
        };

        const handleCommentLikeUpdated = ({ commentId, likeCount, isLiked, userId }) => {
            // Only update if it's for the current post and not the current user's action
            if (post._id && userId !== user?._id) {
                console.log("Comment like updated via Socket.IO:", { commentId, likeCount, isLiked });
                setDisplayedComments(prevComments => {
                    const updateCommentLike = (comments) => {
                        return comments.map(comment => {
                            if (comment._id === commentId) {
                                return {
                                    ...comment,
                                    likeCount: likeCount
                                };
                            }
                            if (comment.replies && comment.replies.length > 0) {
                                return {
                                    ...comment,
                                    replies: updateCommentLike(comment.replies)
                                };
                            }
                            return comment;
                        });
                    };
                    return updateCommentLike(prevComments);
                });
            }
        };

        socket.on('newComment', handleNewComment);
        socket.on('deletedComment', handleDeletedComment);
        socket.on('updatedComment', handleUpdatedComment);
        socket.on('commentLikeUpdated', handleCommentLikeUpdated);

        // Cleanup function
        return () => {
            console.log(`Leaving post room: ${post._id}`);
            socket.emit('leavePostRoom', post._id); // Rời phòng khi dialog đóng
            socket.off('newComment', handleNewComment);
            socket.off('deletedComment', handleDeletedComment);
            socket.off('updatedComment', handleUpdatedComment);
            socket.off('commentLikeUpdated', handleCommentLikeUpdated);
        };
    }, [open, post?._id, onCommentActionSuccess]); // Thêm post?._id vào dependency array

    const handleAddComment = async () => {
        if (!newCommentContent.trim()) {
            alert('Nội dung bình luận không được để trống.');
            return;
        }
        if (!user) {
            alert('Bạn cần đăng nhập để bình luận.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = {
                content: newCommentContent,
                postId: post?._id,
                parentCommentId: replyingTo ? replyingTo._id : null,
            };

            await axios.post('http://localhost:5000/api/comments', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setNewCommentContent('');
            setReplyingTo(null);

        } catch (error) {
            console.error('Lỗi khi thêm bình luận:', error);
            alert('Không thể gửi bình luận. Vui lòng thử lại.');
        }
    };

    // Handle like/unlike comment
    const handleLikeComment = async (commentId) => {
        if (!user) {
            alert('Bạn cần đăng nhập để thích bình luận.');
            return;
        }

        if (likingComments.has(commentId)) {
            return; // Prevent double-clicking
        }

        setLikingComments(prev => new Set([...prev, commentId]));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/comments/${commentId}/like`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Update comment like status locally
            const updateCommentLike = (comments) => {
                return comments.map(comment => {
                    if (comment._id === commentId) {
                        return {
                            ...comment,
                            isLiked: response.data.isLiked,
                            likeCount: response.data.likeCount
                        };
                    }
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: updateCommentLike(comment.replies)
                        };
                    }
                    return comment;
                });
            };

            setDisplayedComments(prevComments => updateCommentLike(prevComments));

        } catch (error) {
            console.error('Lỗi khi like bình luận:', error);
            alert('Không thể thích bình luận. Vui lòng thử lại.');
        } finally {
            setLikingComments(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
        }
    };

    const handleDeleteComment = async (commentId, parentId) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { // Gửi parentId trong body nếu cần thiết cho backend
                    postId: post._id,
                    parentCommentId: parentId // Thêm parentId để server biết đây là reply hay comment gốc
                }
            });
            alert('Bình luận đã được xóa thành công!');

        } catch (error) {
            console.error('Lỗi khi xóa bình luận:', error);
            alert('Không thể xóa bình luận. Vui lòng thử lại.');
        }
    };

    const toggleReplies = useCallback((commentId) => {
        setShowRepliesMap(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    }, []);

    const toggleExpandComment = useCallback((commentId) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    }, []);

    // Component để hiển thị từng bình luận/phản hồi với multi-level support
    const CommentItem = ({ comment, level = 0 }) => {
        const isReply = level > 0;
        const maxLevel = 6; // Maximum nesting level for UI
        const displayLevel = Math.min(level, maxLevel);
        const hasReplies = comment.replies && comment.replies.length > 0;
        const isExpanded = expandedComments.has(comment._id);

        return (
            <Box
                id={`comment-${comment._id}`} // Add id for anchor scrolling
                mt={isReply ? 1 : 2}
                pl={displayLevel * 1.5 + 0.5}
                sx={{
                    borderLeft: darkMode
                        ? `${Math.max(1, 3 - displayLevel)}px solid ${displayLevel > 3 ? '#555' : '#777'}`
                        : `${Math.max(1, 3 - displayLevel)}px solid ${displayLevel > 3 ? '#ddd' : '#ccc'}`,
                    p: 1.5,
                    backgroundColor: darkMode
                        ? (displayLevel % 2 === 0 ? '#2d2d2d' : '#333333')
                        : (displayLevel % 2 === 0 ? '#f9f9f9' : '#f5f5f5'),
                    borderRadius: 1,
                    ml: displayLevel > maxLevel ? 1 : 0,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                        backgroundColor: darkMode
                            ? (displayLevel % 2 === 0 ? '#353535' : '#3a3a3a')
                            : (displayLevel % 2 === 0 ? '#f0f0f0' : '#ebebeb'),
                    }
                }}
            >
                <Box display="flex" alignItems="center" mb={1}>
                    <Avatar
                        src={comment.authorId?.avatarUrl || 'default_avatar.png'}
                        sx={{
                            width: Math.max(20, 28 - displayLevel * 2),
                            height: Math.max(20, 28 - displayLevel * 2),
                            mr: 1
                        }}
                    />
                    <Box flexGrow={1}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontSize: Math.max(0.7, 0.9 - displayLevel * 0.05) + 'rem',
                                fontWeight: 'bold',
                                color: darkMode ? '#e4e6eb' : 'text.primary',
                                lineHeight: 1.2
                            }}
                        >
                            {comment.authorId?.fullName || comment.authorId?.username}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: darkMode ? '#b0b3b8' : 'text.secondary',
                                fontSize: Math.max(0.6, 0.75 - displayLevel * 0.05) + 'rem'
                            }}
                        >
                            {new Date(comment.createdAt).toLocaleString()}
                            {level > 0 && (
                                <span style={{ marginLeft: '8px' }}>
                                    • Cấp {level}
                                </span>
                            )}
                        </Typography>
                    </Box>
                    {user?._id === comment.authorId?._id && (
                        <IconButton
                            size="small"
                            onClick={() => handleDeleteComment(comment._id, comment.parentCommentId)}
                            sx={{
                                color: darkMode ? '#b0b3b8' : 'text.secondary',
                                '&:hover': {
                                    color: '#f44336',
                                    backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5'
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: Math.max(0.7, 0.85 - displayLevel * 0.03) + 'rem',
                        color: darkMode ? '#d0d0d0' : 'text.primary',
                        ml: Math.max(20, 28 - displayLevel * 2) / 4 + 1,
                        lineHeight: 1.4,
                        wordBreak: 'break-word'
                    }}
                >
                    {comment.content}
                </Typography>

                {/* Action buttons: Like and Reply */}
                <Box
                    display="flex"
                    alignItems="center"
                    mt={1}
                    gap={0.5}
                    ml={Math.max(20, 28 - displayLevel * 2) / 4 + 1}
                >
                    {/* Like button */}
                    <Button
                        size="small"
                        startIcon={comment.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        onClick={() => handleLikeComment(comment._id)}
                        disabled={likingComments.has(comment._id)}
                        sx={{
                            textTransform: 'none',
                            fontSize: Math.max(0.6, 0.7 - displayLevel * 0.02) + 'rem',
                            color: comment.isLiked
                                ? '#e91e63'
                                : (darkMode ? '#90caf9' : 'primary.main'),
                            minWidth: 'auto',
                            px: 0.5,
                            py: 0.25,
                            '&:hover': {
                                backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5',
                                color: '#e91e63',
                            },
                            '&:disabled': {
                                opacity: 0.6
                            }
                        }}
                    >
                        {comment.likeCount || 0}
                    </Button>

                    {/* Avatars of users who liked this comment */}
                    {comment.likedUsers && comment.likedUsers.length > 0 && (
                        <Box display="flex" alignItems="center" ml={0.5}>
                            {comment.likedUsers.slice(0, 5).map(user => (
                                <Avatar
                                    key={user._id}
                                    src={user.avatar}
                                    alt={user.fullName || user.username}
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        ml: -0.5,
                                        border: '2px solid #fff',
                                        boxShadow: 1
                                    }}
                                />
                            ))}
                            {comment.likedUsers.length > 5 && (
                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                    +{comment.likedUsers.length - 5}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Reply button - allow replies at any level */}
                    <Button
                        size="small"
                        startIcon={<ReplyIcon />}
                        onClick={() => setReplyingTo(comment)}
                        sx={{
                            textTransform: 'none',
                            fontSize: Math.max(0.6, 0.7 - displayLevel * 0.02) + 'rem',
                            color: darkMode ? '#90caf9' : 'primary.main',
                            minWidth: 'auto',
                            px: 0.5,
                            py: 0.25,
                            '&:hover': {
                                backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5',
                                textDecoration: 'underline',
                            }
                        }}
                    >
                        Trả lời
                    </Button>

                    {/* Show replies toggle for nested comments */}
                    {hasReplies && level > 0 && (
                        <Button
                            size="small"
                            startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => toggleExpandComment(comment._id)}
                            sx={{
                                textTransform: 'none',
                                fontSize: Math.max(0.6, 0.7 - displayLevel * 0.02) + 'rem',
                                color: darkMode ? '#90caf9' : 'primary.main',
                                minWidth: 'auto',
                                px: 0.5,
                                py: 0.25,
                                '&:hover': {
                                    backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5',
                                }
                            }}
                        >
                            {comment.replies.length} phản hồi
                        </Button>
                    )}
                </Box>

                {/* Hiển thị nút "Xem/Ẩn" nếu có replies - chỉ cho root comments */}
                {level === 0 && hasReplies && (
                    <Button
                        size="small"
                        startIcon={showRepliesMap[comment._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => toggleReplies(comment._id)}
                        sx={{
                            textTransform: 'none',
                            mt: 0.5,
                            ml: Math.max(20, 28 - displayLevel * 2) / 4 + 1,
                            fontSize: '0.7rem',
                            color: darkMode ? '#90caf9' : 'primary.main',
                            '&:hover': {
                                backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5',
                                textDecoration: 'underline',
                            }
                        }}
                    >
                        {showRepliesMap[comment._id] ? 'Ẩn' : 'Xem'} {comment.replies.length} trả lời
                    </Button>
                )}

                {/* Hiển thị replies con với recursive rendering */}
                {hasReplies && (
                    <Collapse in={level === 0 ? showRepliesMap[comment._id] : (level > 0 ? isExpanded : true)}>
                        <Box sx={{ mt: 1 }}>
                            {comment.replies.map((reply) => (
                                <CommentItem key={reply._id} comment={reply} level={level + 1} />
                            ))}
                        </Box>
                    </Collapse>
                )}
            </Box>
        );
    };

    if (!post) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: darkMode ? '#242526' : '#ffffff',
                    color: darkMode ? '#e4e6eb' : '#1c1e21',
                    boxShadow: darkMode ? '0px 0px 10px rgba(255,255,255,0.2)' : '0px 0px 10px rgba(0,0,0,0.2)',
                    transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                }
            }}
        >
            <DialogTitle sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21', pr: 6 }}>
                Bình luận cho bài: {post?.title}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: darkMode ? '#b0b3b8' : (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor: darkMode ? '#3a3b3c' : '#eee', pb: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                        src={user?.avatarUrl || 'default_avatar.png'} // Đảm bảo dùng avatarUrl
                        sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder={replyingTo ? `Trả lời ${replyingTo.authorId?.fullName || replyingTo.authorId?.username}...` : "Viết bình luận của bạn..."}
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { // Gửi khi nhấn Enter, không gửi khi Shift+Enter
                                e.preventDefault();
                                handleAddComment();
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: darkMode ? '#3a3b3c' : '#f0f2f5',
                                color: darkMode ? '#e4e6eb' : '#1c1e21',
                                '& fieldset': { borderColor: 'transparent' },
                                '&:hover fieldset': { borderColor: darkMode ? '#555' : '#ccc' },
                                '&.Mui-focused fieldset': { borderColor: darkMode ? '#90caf9' : 'primary.main' },
                            },
                            '& .MuiInputBase-input': {
                                color: darkMode ? '#e4e6eb' : '#1c1e21',
                            },
                        }}
                    />
                    <IconButton onClick={handleAddComment} color="primary" disabled={!newCommentContent.trim()}>
                        <SendIcon />
                    </IconButton>
                </Box>

                {replyingTo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, backgroundColor: darkMode ? '#333' : '#f0f0f0', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1, color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                            Đang trả lời: **{replyingTo.authorId?.fullName || replyingTo.authorId?.username}** - "{replyingTo.content.substring(0, Math.min(replyingTo.content.length, 30))}..."
                        </Typography>
                        <IconButton size="small" onClick={() => setReplyingTo(null)}>
                            <CancelIcon sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }} />
                        </IconButton>
                    </Box>
                )}

                {displayedComments.length === 0 ? (
                    <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                        Chưa có bình luận nào.
                    </Typography>
                ) : (
                    displayedComments.map((comment) => (
                        <CommentItem key={comment._id} comment={comment} level={0} />
                    ))
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CommentDialog;