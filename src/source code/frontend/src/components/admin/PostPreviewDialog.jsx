import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Typography, Box, Paper
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/admin/posts';

const PostPreviewDialog = ({ postId, open, onClose }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { getToken } = useAuth();

    useEffect(() => {
        if (open && postId) {
            setLoading(true);
            setError('');
            setPost(null);
            const fetchPost = async () => {
                try {
                    const token = getToken();
                    const response = await axios.get(`${API_BASE_URL}/${postId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setPost(response.data);
                } catch (err) {
                    console.error('Error fetching post details:', err);
                    setError('Không thể tải chi tiết bài viết. Vui lòng thử lại.');
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [postId, open, getToken]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
            <DialogTitle>Xem trước nội dung bài viết</DialogTitle>
            <DialogContent dividers>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && <Typography color="error">{error}</Typography>}
                {post && (
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {post.title}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Bởi: {post.authorId?.fullName || 'N/A'} | Chủ đề: {post.topicId?.name || 'N/A'}
                        </Typography>
                        <Paper elevation={0} sx={{ p: 2, my: 2, border: '1px solid #eee' }}>
                            <Typography variant="h6">Nội dung bài viết:</Typography>
                            <Box
                                sx={{ mt: 1, wordBreak: 'break-word', '& img': { maxWidth: '100%', height: 'auto' } }}
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </Paper>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PostPreviewDialog;
