import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Button,
    TextField, Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { ThemeContext } from '../../../context/ThemeContext';
import io from 'socket.io-client'; // Import Socket.IO client

// Kết nối tới Socket.IO server
// Đây là một instance socket chung. Đảm bảo bạn chỉ tạo nó một lần.
// Nếu bạn đã có một instance socket chung (ví dụ: trong usePostInteractions),
// hãy truyền nó vào đây thay vì tạo mới.
const socket = io('http://localhost:5000');

const CommentDialog = ({ open, onClose, post, user, onCommentActionSuccess }) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    const [displayedComments, setDisplayedComments] = useState([]);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [showRepliesMap, setShowRepliesMap] = useState({});

    // Sử dụng useRef để kiểm soát việc khởi tạo ban đầu của comments
    const initialCommentsLoaded = useRef(false);

    // Effect để khởi tạo displayedComments khi dialog mở hoặc post thay đổi lần đầu.
    // Sau đó, các cập nhật Socket.IO sẽ quản lý trạng thái.
    useEffect(() => {
        if (open && post && !initialCommentsLoaded.current) {
            console.log("Initializing comments from post prop.");
            // Sắp xếp bình luận gốc theo thời gian tạo giảm dần
            const sortedRootComments = [...(post.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setDisplayedComments(sortedRootComments);
            setNewCommentContent('');
            setReplyingTo(null);
            setShowRepliesMap({}); // Reset trạng thái mở/đóng replies
            initialCommentsLoaded.current = true; // Đánh dấu đã tải lần đầu
        } else if (!open) {
            // Khi dialog đóng, reset trạng thái và cờ để lần sau mở lại sẽ load mới
            setDisplayedComments([]);
            setNewCommentContent('');
            setReplyingTo(null);
            setShowRepliesMap({});
            initialCommentsLoaded.current = false;
        }
    }, [open, post]); // Dependency array chỉ cần open và post

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
                        // Nếu là phản hồi, tìm bình luận cha và thêm phản hồi
                        return prevComments.map(comment => {
                            if (comment._id === newComment.parentCommentId) {
                                const updatedReplies = Array.isArray(comment.replies) ? [...comment.replies, newComment] : [newComment];
                                return {
                                    ...comment,
                                    replies: updatedReplies,
                                    replyCount: (comment.replyCount || 0) + 1 // Tăng replyCount
                                };
                            }
                            return comment;
                        });
                    } else {
                        // Nếu là bình luận gốc, thêm vào đầu danh sách comments
                        return [newComment, ...prevComments];
                    }
                });
                // Tự động mở replies sau khi nhận được phản hồi mới
                if (newComment.parentCommentId) {
                    setShowRepliesMap(prev => ({ ...prev, [newComment.parentCommentId]: true }));
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
                    let updatedComments = [...prevComments];

                    if (parentCommentId) {
                        // Xóa phản hồi
                        updatedComments = updatedComments.map(comment => {
                            if (comment._id === parentCommentId && comment.replies) {
                                const filteredReplies = comment.replies.filter(reply => reply._id !== commentId);
                                return {
                                    ...comment,
                                    replies: filteredReplies,
                                    replyCount: Math.max(0, (comment.replyCount || 0) - 1) // Giảm replyCount
                                };
                            }
                            return comment;
                        });
                    } else {
                        // Xóa bình luận gốc
                        updatedComments = updatedComments.filter(comment => comment._id !== commentId);
                    }
                    return updatedComments;
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
                    return prevComments.map(comment => {
                        if (comment._id === updatedComment._id) {
                            return updatedComment;
                        }
                        if (comment.replies) {
                            const updatedReplies = comment.replies.map(reply =>
                                reply._id === updatedComment._id ? updatedComment : reply
                            );
                            return { ...comment, replies: updatedReplies };
                        }
                        return comment;
                    });
                });
            }
        };

        socket.on('newComment', handleNewComment);
        socket.on('deletedComment', handleDeletedComment);
        socket.on('updatedComment', handleUpdatedComment);

        // Cleanup function
        return () => {
            console.log(`Leaving post room: ${post._id}`);
            socket.emit('leavePostRoom', post._id); // Rời phòng khi dialog đóng
            socket.off('newComment', handleNewComment);
            socket.off('deletedComment', handleDeletedComment);
            socket.off('updatedComment', handleUpdatedComment);
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

    // HOC để hiển thị từng bình luận/phản hồi
    const CommentItem = ({ comment, isReply = false, parentCommentId = null }) => (
        <Box mt={isReply ? 1 : 2} pl={isReply ? 2 : 1} sx={{
            borderLeft: darkMode ? (isReply ? '1px solid #777' : '2px solid #555') : (isReply ? '1px solid #ddd' : '2px solid #eee'),
            p: 1,
            backgroundColor: darkMode ? (isReply ? '#333333' : '#2d2d2d') : (isReply ? '#f5f5f5' : '#f9f9f9'),
            borderRadius: 1
        }}>
            <Box display="flex" alignItems="center" mb={0.5}>
                <Avatar src={comment.authorId?.avatarUrl || 'default_avatar.png'} sx={{ width: isReply ? 20 : 24, height: isReply ? 20 : 24, mr: 1 }} />
                <Typography variant="subtitle2" sx={{ fontSize: isReply ? '0.75rem' : '0.85rem', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : 'text.primary' }}>
                    {comment.authorId?.fullName || comment.authorId?.username}
                </Typography>
                <Typography variant="caption" sx={{ ml: 1, color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                    • {new Date(comment.createdAt).toLocaleString()}
                </Typography>
                {user?._id === comment.authorId?._id && (
                    <Button
                        size="small"
                        sx={{ ml: 'auto', color: darkMode ? '#b0b3b8' : 'text.secondary', fontSize: isReply ? '0.65rem' : '0.75rem' }}
                        onClick={() => handleDeleteComment(comment._id, parentCommentId)}
                    >
                        Xóa
                    </Button>
                )}
            </Box>
            <Typography variant="body2" sx={{ fontSize: isReply ? '0.75rem' : '0.85rem', color: darkMode ? '#d0d0d0' : 'text.primary', ml: isReply ? 3 : 4 }}>
                {comment.content}
            </Typography>
            {!isReply && (
                <Button
                    size="small"
                    startIcon={<ReplyIcon />}
                    onClick={() => setReplyingTo(comment)}
                    sx={{
                        textTransform: 'none',
                        mt: 0.5,
                        ml: 3,
                        fontSize: '0.75rem',
                        color: darkMode ? '#90caf9' : 'primary.main',
                        '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline',
                        }
                    }}
                >
                    Trả lời
                </Button>
            )}

            {/* Hiển thị nút "Xem/Ẩn" nếu có replies */}
            {!isReply && comment.replies && comment.replies.length > 0 && (
                <Button
                    size="small"
                    onClick={() => toggleReplies(comment._id)}
                    sx={{
                        textTransform: 'none',
                        mt: 0.5,
                        ml: 1,
                        fontSize: '0.75rem',
                        color: darkMode ? '#90caf9' : 'primary.main',
                        '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline',
                        }
                    }}
                >
                    {showRepliesMap[comment._id] ? 'Ẩn' : `Xem`} {comment.replies.length} trả lời
                </Button>
            )}

            {/* Hiển thị replies con */}
            {!isReply && showRepliesMap[comment._id] && Array.isArray(comment.replies) && (
                <Box sx={{ ml: 2 }}>
                    {comment.replies.map((reply) => (
                        <CommentItem key={reply._id} comment={reply} isReply={true} parentCommentId={comment._id} />
                    ))}
                </Box>
            )}
        </Box>
    );

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
                        <CommentItem key={comment._id} comment={comment} />
                    ))
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CommentDialog;