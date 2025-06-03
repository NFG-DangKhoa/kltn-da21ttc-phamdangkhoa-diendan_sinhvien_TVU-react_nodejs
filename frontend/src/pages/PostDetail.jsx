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
    Stack,
    useTheme
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Đảm bảo import này là chính xác

const PostDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const { mode } = useContext(ThemeContext); // Lấy mode từ ThemeContext
    const theme = useTheme(); // Hook để truy cập theme object

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/posts/${id}`);
                setPost(res.data.post);
                setComments(res.data.comments);
                setLikes(res.data.likes);
                // Kiểm tra xem user có tồn tại và post có thông tin userLiked/userRating không
                // để tránh lỗi khi user chưa đăng nhập
                setIsLiked(res.data.userLiked || false);
                setUserRating(res.data.userRating || 0);
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết bài viết:', error);
            }
        };
        fetchData();
    }, [id]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        if (!user) { // Đảm bảo người dùng đã đăng nhập để bình luận
            alert('Bạn cần đăng nhập để bình luận!');
            return;
        }
        try {
            await axios.post(`/comments/${id}`, { content: newComment });
            setNewComment('');
            // Sau khi thêm bình luận, gọi lại API để lấy danh sách bình luận mới nhất
            const res = await axios.get(`/posts/${id}`);
            setComments(res.data.comments);
        } catch (error) {
            console.error('Lỗi khi thêm bình luận:', error);
            alert('Không thể thêm bình luận. Vui lòng thử lại.');
        }
    };

    const handleLike = async () => {
        if (!user) { // Đảm bảo người dùng đã đăng nhập để thích
            alert('Bạn cần đăng nhập để thích bài viết!');
            return;
        }
        try {
            await axios.post(`/posts/${id}/like`);
            setIsLiked(prev => !prev);
            setLikes(prev => (isLiked ? prev - 1 : prev + 1));
        } catch (error) {
            console.error('Lỗi khi thích bài viết:', error);
            alert('Không thể thích bài viết. Vui lòng thử lại.');
        }
    };

    const handleRate = async (value) => {
        if (!user) { // Đảm bảo người dùng đã đăng nhập để đánh giá
            alert('Bạn cần đăng nhập để đánh giá bài viết!');
            return;
        }
        if (value === null) return;
        try {
            await axios.post(`/posts/${id}/rate`, { rating: value });
            setUserRating(value);
        } catch (error) {
            console.error('Lỗi khi đánh giá bài viết:', error);
            alert('Không thể đánh giá bài viết. Vui lòng thử lại.');
        }
    };

    if (!post) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                color: theme.palette.text.primary
            }}>
                <Typography variant="h6">Đang tải chi tiết bài viết...</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                maxWidth: 800,
                mx: 'auto',
                mt: 25,
                p: 2,
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                minHeight: 'calc(100vh - 64px)', // Giả sử chiều cao header là 64px
                transition: 'background-color 0.4s ease, color 0.4s ease',
            }}
        >
            <Paper
                sx={{
                    p: 3,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[3],
                    transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                }}
            >
                <Typography variant="h4" gutterBottom
                    sx={{ color: theme.palette.text.primary }}>
                    {post.title}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: theme.palette.text.secondary }}>
                    {post.content}
                </Typography>
                <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={handleLike} disabled={!user} // Vô hiệu hóa nút nếu chưa đăng nhập
                        sx={{ color: isLiked ? theme.palette.primary.main : theme.palette.action.active }}
                    >
                        <ThumbUpIcon />
                    </IconButton>
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                        {likes} lượt thích
                    </Typography>

                    <Rating
                        name="post-rating"
                        value={userRating}
                        onChange={(e, newVal) => handleRate(newVal)}
                        precision={1}
                        sx={{ color: theme.palette.secondary.main }}
                        disabled={!user} // Vô hiệu hóa rating nếu chưa đăng nhập
                    />
                </Stack>

                <Divider sx={{ my: 3, borderColor: theme.palette.divider }} />
                <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                    Bình luận
                </Typography>
                {comments.length > 0 ? (
                    comments.map(c => (
                        <Box
                            key={c._id}
                            sx={{
                                mt: 2,
                                p: 2,
                                background: theme.palette.background.default, // Hoặc theme.palette.grey[100] / [900] tùy chế độ
                                borderRadius: 1,
                                transition: 'background-color 0.4s ease',
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ color: theme.palette.primary.light }}>
                                {c.authorName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                                {c.content}
                            </Typography>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
                        Chưa có bình luận nào.
                    </Typography>
                )}

                {user ? ( // Chỉ hiển thị phần bình luận nếu người dùng đã đăng nhập
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Thêm bình luận"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            variant="outlined"
                            sx={{
                                '& .MuiInputBase-root': {
                                    backgroundColor: theme.palette.background.paper,
                                    color: theme.palette.text.primary,
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.divider,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.light,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main,
                                    borderWidth: '2px',
                                },
                                '& .MuiInputLabel-root': {
                                    color: theme.palette.text.secondary,
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                mt: 1,
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                                color: theme.palette.primary.contrastText,
                            }}
                            onClick={handleAddComment}
                        >
                            Gửi
                        </Button>
                    </Box>
                ) : (
                    <Typography variant="body2" sx={{ mt: 3, color: theme.palette.text.secondary }}>
                        Vui lòng đăng nhập để bình luận, thích hoặc đánh giá bài viết.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default PostDetail;