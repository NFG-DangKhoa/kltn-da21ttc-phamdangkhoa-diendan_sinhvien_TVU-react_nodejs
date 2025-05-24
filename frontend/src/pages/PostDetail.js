import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Divider,
    TextField,
    Button,
    Rating,
    IconButton,
    Stack
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';

const PostDetail = () => {
    const { id } = useParams(); // postId
    const { user } = useContext(AuthContext);
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`/posts/${id}`);
            setPost(res.data.post);
            setComments(res.data.comments);
            setLikes(res.data.likes);
            setIsLiked(res.data.userLiked || false);
            setUserRating(res.data.userRating || 0);
        };
        fetchData();
    }, [id]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        await axios.post(`/comments/${id}`, { content: newComment });
        setNewComment('');
        const res = await axios.get(`/posts/${id}`);
        setComments(res.data.comments);
    };

    const handleLike = async () => {
        await axios.post(`/posts/${id}/like`);
        setIsLiked(prev => !prev);
        setLikes(prev => (isLiked ? prev - 1 : prev + 1));
    };

    const handleRate = async (value) => {
        await axios.post(`/posts/${id}/rate`, { rating: value });
        setUserRating(value);
    };

    if (!post) return <Typography>Đang tải...</Typography>;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>{post.title}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{post.content}</Typography>
                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={handleLike} color={isLiked ? 'primary' : 'default'}>
                        <ThumbUpIcon />
                    </IconButton>
                    <Typography>{likes} lượt thích</Typography>

                    <Rating
                        name="post-rating"
                        value={userRating}
                        onChange={(e, newVal) => handleRate(newVal)}
                    />
                </Stack>

                <Divider sx={{ my: 3 }} />
                <Typography variant="h6">Bình luận</Typography>
                {comments.map(c => (
                    <Box key={c._id} sx={{ mt: 2, p: 2, background: '#f9f9f9', borderRadius: 1 }}>
                        <Typography variant="subtitle2">{c.authorName}</Typography>
                        <Typography variant="body2">{c.content}</Typography>
                    </Box>
                ))}

                {user && (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Thêm bình luận"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button variant="contained" sx={{ mt: 1 }} onClick={handleAddComment}>
                            Gửi
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default PostDetail;
