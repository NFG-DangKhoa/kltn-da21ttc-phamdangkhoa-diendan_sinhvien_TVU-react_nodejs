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
import { List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const constructUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `http://localhost:5000${path}`;
};

const LikerDialog = ({ open, onClose, likers, darkMode }) => {
    const navigate = useNavigate();

    const handleUserClick = (userId) => {
        onClose();
        navigate(`/profile/${userId}`);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { backgroundColor: darkMode ? '#242526' : '#ffffff', color: darkMode ? '#e4e6eb' : '#1c1e21' } }}>
            <DialogTitle>
                Người đã thích
                <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <List>
                    {likers.map((liker) => (
                        <ListItem key={liker._id} button onClick={() => handleUserClick(liker._id)}>
                            <ListItemAvatar>
                                <Avatar src={liker.avatarUrl && !liker.isAvatarBlocked ? constructUrl(liker.avatarUrl) : undefined}>
                                    {liker.fullName?.charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={liker.fullName} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
};

const CommentDialog = ({ open, onClose, post, user, onCommentActionSuccess }) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    const [displayedComments, setDisplayedComments] = useState([]);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [showRepliesMap, setShowRepliesMap] = useState({});
    const [likingComments, setLikingComments] = useState(new Set());
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [likerDialogOpen, setLikerDialogOpen] = useState(false);
    const [currentLikers, setCurrentLikers] = useState([]);

    const initialCommentsLoaded = useRef(false);

    useEffect(() => {
        if (open && post && !initialCommentsLoaded.current) {
            axios.get(`http://localhost:5000/api/comments/post/${post._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then(res => {
                    const sortedRootComments = [...(res.data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setDisplayedComments(sortedRootComments);
                    initialCommentsLoaded.current = true;
                })
                .catch(err => {
                    console.error("Error fetching comments:", err);
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

    useEffect(() => {
        if (!open || !post?._id) {
            return;
        }

        // Define handlers inside the effect
        const handleNewComment = (newComment) => {
            if (newComment.postId !== post._id) return;

            setDisplayedComments(prevComments => {
                // Avoid adding duplicates
                const isAlreadyDisplayed = prevComments.some(c => c._id === newComment._id);
                if (isAlreadyDisplayed) return prevComments;

                if (newComment.parentCommentId) {
                    const updateNestedComments = (comments) => comments.map(comment => {
                        if (comment._id === newComment.parentCommentId) {
                            const replies = comment.replies || [];
                            const isReplyAlreadyDisplayed = replies.some(r => r._id === newComment._id);
                            if (isReplyAlreadyDisplayed) return comment;
                            const updatedReplies = [...replies, newComment];
                            return { ...comment, replies: updatedReplies, replyCount: (comment.replyCount || 0) + 1 };
                        }
                        if (comment.replies?.length > 0) {
                            return { ...comment, replies: updateNestedComments(comment.replies) };
                        }
                        return comment;
                    });
                    return updateNestedComments(prevComments);
                }
                return [newComment, ...prevComments];
            });

            if (newComment.parentCommentId) {
                setShowRepliesMap(prev => ({ ...prev, [newComment.parentCommentId]: true }));
            }
            onCommentActionSuccess?.();
        };

        const handleDeletedComment = ({ commentId }) => {
            const removeCommentFromState = (comments) => {
                return comments.filter(c => c._id !== commentId).map(comment => {
                    if (comment.replies?.length > 0) {
                        return { ...comment, replies: removeCommentFromState(comment.replies) };
                    }
                    return comment;
                });
            };
            setDisplayedComments(prev => removeCommentFromState(prev));
            onCommentActionSuccess?.();
        };

        const handleUpdatedComment = (updatedComment) => {
            const updateCommentInState = (comments) => comments.map(comment => {
                if (comment._id === updatedComment._id) {
                    return { ...comment, ...updatedComment };
                }
                if (comment.replies?.length > 0) {
                    return { ...comment, replies: updateCommentInState(comment.replies) };
                }
                return comment;
            });
            setDisplayedComments(prev => updateCommentInState(prev));
        };

        const handleCommentLikeUpdated = (data) => {
            const { commentId, likeCount, isLiked } = data;
            const updateLikes = (comments) => comments.map(comment => {
                if (comment._id === commentId) {
                    return { ...comment, likeCount, isLikedByCurrentUser: isLiked };
                }
                if (comment.replies?.length > 0) {
                    return { ...comment, replies: updateLikes(comment.replies) };
                }
                return comment;
            });
            setDisplayedComments(prev => updateLikes(prev));
        };

        // Set up listeners
        socket.on('newComment', handleNewComment);
        socket.on('deletedComment', handleDeletedComment);
        socket.on('updatedComment', handleUpdatedComment);
        socket.on('commentLikeUpdated', handleCommentLikeUpdated);
        socket.emit('joinPostRoom', `post-${post._id}`);

        // Cleanup function
        return () => {
            socket.off('newComment', handleNewComment);
            socket.off('deletedComment', handleDeletedComment);
            socket.off('updatedComment', handleUpdatedComment);
            socket.off('commentLikeUpdated', handleCommentLikeUpdated);
            socket.emit('leavePostRoom', `post-${post._id}`);
        };
    }, [open, post?._id, onCommentActionSuccess]); // Dependencies

    const handleAddComment = async () => {
        if (!newCommentContent.trim() || !user) return;
        try {
            const token = localStorage.getItem('token');
            const payload = {
                content: newCommentContent,
                postId: post?._id,
                parentCommentId: replyingTo?._id || null,
            };
            // The server will send a socket event that updates the UI.
            await axios.post('http://localhost:5000/api/comments', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Clear the input fields after successful submission.
            setNewCommentContent('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Lỗi khi thêm bình luận:', error);
            alert('Không thể gửi bình luận. Vui lòng thử lại.');
        }
    };

    const handleLikeComment = async (commentId) => {
        if (likingComments.has(commentId)) return;

        setLikingComments(prev => new Set(prev).add(commentId));

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/comments/${commentId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // The UI will be updated via socket event, so no need to manually update state here.
        } catch (error) {
            console.error('Lỗi khi thích bình luận:', error);
            // Optionally, show an error message to the user
        } finally {
            setLikingComments(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
        }
    };

    const handleOpenLikersDialog = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/comments/${commentId}/likes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentLikers(res.data);
            setLikerDialogOpen(true);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người thích:', error);
        }
    };

    const handleUpdateComment = async () => {
        if (!editingComment || !editedContent.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/comments/${editingComment._id}`,
                { content: editedContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingComment(null);
            setEditedContent('');
        } catch (error) {
            console.error('Lỗi khi cập nhật bình luận:', error);
            alert('Không thể cập nhật bình luận. Vui lòng thử lại.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // UI will be updated via socket
            } catch (error) {
                console.error('Lỗi khi xóa bình luận:', error);
                alert('Không thể xóa bình luận. Vui lòng thử lại.');
            }
        }
    };

    const toggleReplies = useCallback((commentId) => {
        setShowRepliesMap(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    }, []);

    // --- NEW CommentItem Component ---
    const CommentItem = ({ comment, level = 0, isLast = false }) => {
        const hasReplies = comment.replies && comment.replies.length > 0;
        const showReplies = showRepliesMap[comment._id];
        const avatarSize = level > 0 ? 28 : 36;
        const isReplying = replyingTo && replyingTo._id === comment._id;
        const isEditing = editingComment && editingComment._id === comment._id;

        return (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2, position: 'relative' }}>
                {/* Connector Lines */}
                {level > 0 && (
                    <>
                        {/* Vertical Line */}
                        {!isLast && <Box sx={{
                            position: 'absolute',
                            left: -28, // Adjust based on indentation
                            top: avatarSize / 2,
                            bottom: 0,
                            width: '2px',
                            backgroundColor: 'divider',
                        }} />}
                        {/* Horizontal Line (L-shape) */}
                        <Box sx={{
                            position: 'absolute',
                            left: -28, // Adjust based on indentation
                            top: avatarSize / 2,
                            width: '20px', // Length of the horizontal part
                            height: '2px',
                            backgroundColor: 'divider',
                        }} />
                    </>
                )}

                <Avatar
                    src={comment.authorId?.avatarUrl && !comment.authorId?.isAvatarBlocked ? constructUrl(comment.authorId?.avatarUrl) : undefined}
                    sx={{ width: avatarSize, height: avatarSize, mr: 1.5 }}
                >
                    {comment.authorId?.fullName?.charAt(0)}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                    {/* Comment Bubble */}
                    <Box sx={{
                        backgroundColor: darkMode ? '#3a3b3c' : '#f0f2f5',
                        borderRadius: '18px',
                        p: '8px 12px',
                        display: 'inline-block',
                        maxWidth: '100%',
                    }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: darkMode ? '#e4e6eb' : 'text.primary' }}>
                            {comment.authorId?.fullName || 'Anonymous'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkMode ? '#e4e6eb' : 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {comment.content}
                        </Typography>
                    </Box>

                    {/* Actions (Like, Reply, Time) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, pl: 1.5, gap: 1.5 }}>
                        <Typography
                            component="span"
                            variant="caption"
                            sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => handleLikeComment(comment._id)}
                        >
                            Thích
                        </Typography>
                        <Typography
                            component="span"
                            variant="caption"
                            sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => setReplyingTo(comment)}
                        >
                            Trả lời
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleTimeString()}
                        </Typography>
                        {user && user._id === comment.authorId._id && (
                            <>
                                <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                    onClick={() => {
                                        setEditingComment(comment);
                                        setEditedContent(comment.content);
                                        setReplyingTo(null); // Close reply box when editing
                                    }}
                                >
                                    Sửa
                                </Typography>
                                <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'error.main', '&:hover': { textDecoration: 'underline' } }}
                                    onClick={() => handleDeleteComment(comment._id)}
                                >
                                    Xóa
                                </Typography>
                            </>
                        )}
                        {comment.likeCount > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleOpenLikersDialog(comment._id)}>
                                <FavoriteIcon sx={{ fontSize: 14, color: 'red' }} />
                                <Typography variant="caption" sx={{ ml: 0.5 }}>{comment.likeCount}</Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Inline Reply/Edit Form */}
                    {isEditing ? (
                        <Box display="flex" alignItems="center" mt={1}>
                            <TextField
                                fullWidth
                                autoFocus
                                variant="outlined"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleUpdateComment())}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '20px',
                                        backgroundColor: darkMode ? '#3a3b3c' : '#f0f2f5',
                                        '& fieldset': { borderColor: 'transparent' },
                                    },
                                }}
                            />
                            <IconButton onClick={handleUpdateComment} color="primary" disabled={!editedContent.trim()}>
                                <SendIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => setEditingComment(null)}>
                                <CancelIcon />
                            </IconButton>
                        </Box>
                    ) : isReplying && (
                        <Box display="flex" alignItems="center" mt={1}>
                            <Avatar src={constructUrl(user?.avatarUrl)} sx={{ width: 28, height: 28, mr: 1 }} />
                            <TextField
                                fullWidth
                                autoFocus
                                variant="outlined"
                                placeholder={`Trả lời ${comment.authorId?.fullName}...`}
                                value={newCommentContent}
                                onChange={(e) => setNewCommentContent(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '20px',
                                        backgroundColor: darkMode ? '#3a3b3c' : '#f0f2f5',
                                        '& fieldset': { borderColor: 'transparent' },
                                    },
                                }}
                            />
                            <IconButton onClick={handleAddComment} color="primary" disabled={!newCommentContent.trim()}>
                                <SendIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => setReplyingTo(null)}>
                                <CancelIcon />
                            </IconButton>
                        </Box>
                    )}

                    {/* Replies Section */}
                    {hasReplies && (
                        <Box sx={{ mt: 1 }}>
                            <Button
                                size="small"
                                startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                onClick={() => toggleReplies(comment._id)}
                                sx={{ textTransform: 'none', fontWeight: 'bold', color: 'text.secondary' }}
                            >
                                {showReplies ? 'Ẩn' : 'Xem'} {comment.replies.length} trả lời
                            </Button>
                            <Collapse in={showReplies}>
                                <Box sx={{ mt: 1, pl: level > 0 ? 0 : 5.5 }}>
                                    {comment.replies.map((reply, index) => (
                                        <CommentItem
                                            key={reply._id}
                                            comment={reply}
                                            level={level + 1}
                                            isLast={index === comment.replies.length - 1}
                                        />
                                    ))}
                                </Box>
                            </Collapse>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    };


    if (!post) return null;

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: darkMode ? '#242526' : '#ffffff', color: darkMode ? '#e4e6eb' : '#1c1e21' } }}>
                <DialogTitle sx={{ pr: 6 }}>
                    Bình luận cho bài: {post?.title}
                    <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{
                    borderColor: darkMode ? '#3a3b3c' : '#eee',
                    p: 0, // Padding will be handled by inner boxes
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: darkMode ? '#555' : '#ccc', borderRadius: '4px' },
                }}>
                    {/* --- STICKY COMMENT INPUT AREA --- */}
                    <Box sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        backgroundColor: darkMode ? '#242526' : '#ffffff',
                        p: { xs: 1, sm: 2 },
                        borderBottom: `1px solid ${darkMode ? '#3a3b3c' : '#eee'}`,
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <Avatar src={constructUrl(user?.avatarUrl)} sx={{ width: 32, height: 32, mr: 1 }} />
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder={replyingTo ? `Trả lời ${replyingTo.authorId?.fullName}...` : "Viết bình luận của bạn..."}
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    backgroundColor: darkMode ? '#3a3b3c' : '#f0f2f5',
                                    '& fieldset': { borderColor: 'transparent' },
                                },
                            }}
                        />
                        <IconButton onClick={handleAddComment} color="primary" disabled={!newCommentContent.trim()}>
                            <SendIcon />
                        </IconButton>
                    </Box>

                    {/* --- SCROLLABLE CONTENT AREA --- */}
                    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                        {/* Replying to indicator */}
                        {replyingTo && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, backgroundColor: darkMode ? '#333' : '#f0f0f0', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ flexGrow: 1, color: 'text.secondary' }}>
                                    Đang trả lời: **{replyingTo.authorId?.fullName}**
                                </Typography>
                                <IconButton size="small" onClick={() => setReplyingTo(null)}>
                                    <CancelIcon />
                                </IconButton>
                            </Box>
                        )}

                        {/* Comments List */}
                        {displayedComments.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                                Chưa có bình luận nào. Hãy là người đầu tiên!
                            </Typography>
                        ) : (
                            displayedComments.map((comment, index) => (
                                <CommentItem key={comment._id} comment={comment} level={0} isLast={index === displayedComments.length - 1} />
                            ))
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
            <LikerDialog
                open={likerDialogOpen}
                onClose={() => setLikerDialogOpen(false)}
                likers={currentLikers}
                darkMode={darkMode}
            />
        </>
    );
};

export default CommentDialog;
