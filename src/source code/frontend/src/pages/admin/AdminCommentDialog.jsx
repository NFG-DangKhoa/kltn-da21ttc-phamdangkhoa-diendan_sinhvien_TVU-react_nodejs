import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Box,
    Typography,
    CircularProgress,
    Divider,
    Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Helper function to construct full URL for images
const constructUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

const AdminCommentDialog = ({ open, onClose, postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAuthToken = () => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined') {
            return token;
        }
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.token && user.token !== 'undefined') {
            return user.token;
        }
        return null;
    };

    const fetchComments = async () => {
        if (!postId) return;

        setLoading(true);
        setError(null);

        try {
            const token = getAuthToken();
            const response = await axios.get(`http://localhost:5000/api/admin/comments`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { postId: postId }
            });

            setComments(response.data.comments || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Không thể tải danh sách bình luận');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && postId) {
            fetchComments();
        }
    }, [open, postId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    backgroundColor: '#ffffff',
                    color: '#1c1e21',
                    borderRadius: '10px',
                    maxHeight: '80vh'
                },
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1,
                borderBottom: '1px solid #e4e6ea'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bình luận bài viết
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{
                p: 0,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#ccc',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f0f0f0',
                },
            }}>
                {loading ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <CircularProgress size={24} />
                        <Typography sx={{ mt: 1, color: '#65676b' }}>
                            Đang tải bình luận...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography sx={{ color: '#f02849' }}>
                            {error}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ p: 2 }}>
                        {comments && comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <Paper
                                    key={comment._id}
                                    elevation={1}
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #e4e6ea'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Avatar
                                            src={constructUrl(comment.authorId?.avatarUrl || comment.authorId?.profilePicture)}
                                            alt={comment.authorId?.fullName}
                                            sx={{ width: 40, height: 40 }}
                                            component={Link}
                                            to={`/profile/${comment.authorId?._id}`}
                                        >
                                            {comment.authorId?.fullName ? comment.authorId.fullName.charAt(0) : '?'}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ fontWeight: 600, color: '#1c1e21' }}
                                                    component={Link}
                                                    to={`/profile/${comment.authorId?._id}`}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    {comment.authorId?.fullName || 'Người dùng ẩn danh'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#65676b' }}>
                                                    {formatDate(comment.createdAt)}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: '#1c1e21', lineHeight: 1.4 }}>
                                                {comment.content}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography sx={{ color: '#65676b' }}>
                                    Chưa có bình luận nào cho bài viết này.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AdminCommentDialog;
