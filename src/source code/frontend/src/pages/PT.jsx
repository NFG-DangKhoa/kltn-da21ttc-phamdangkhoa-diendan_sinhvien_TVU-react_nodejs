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
    useTheme,
    alpha,
    Grid,
    Avatar
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Đảm bảo import này là chính xác
import TableOfContents from '../components/TableOfContents';
import parse, { domToReact } from 'html-react-parser';
import slugify from 'slugify';

const constructUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `http://localhost:5000${path}`;
};

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

    const parseOptions = {
        replace: domNode => {
            if (domNode.type === 'tag' && /h[1-6]/.test(domNode.name)) {
                const slug = slugify(domNode.children[0].data, { lower: true, strict: true });
                return React.createElement(
                    domNode.name,
                    { id: slug },
                    domToReact(domNode.children, parseOptions)
                );
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Append user ID to the request to get personalized data like userLiked, userRating
                const url = user ? `/posts/${id}?userId=${user._id}` : `/posts/${id}`;
                const res = await axios.get(url);

                setPost(res.data.post);
                setComments(res.data.comments);
                setLikes(res.data.likes);
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
                px: { xs: 1, sm: 2, md: 3 },
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '100vw',
                mx: 'auto',
                mt: 0,
                p: 2,
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                minHeight: 'calc(100vh - 64px)',
                transition: 'background-color 0.4s ease, color 0.4s ease',
            }}
        >
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    {post.content && <TableOfContents content={post.content} />}
                </Grid>
                <Grid item xs={12} md={9}>
                    <Paper
                        sx={{
                            p: 3,
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            boxShadow: theme.shadows[3],
                            transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar
                                src={constructUrl(post.author?.avatarUrl)}
                                alt={post.author?.fullName}
                                sx={{ width: 56, height: 56 }}
                            >
                                {post.author?.fullName?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                                    {post.author?.fullName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    Đăng vào {new Date(post.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
                            {post.title}
                        </Typography>
                        <Box sx={{
                            whiteSpace: 'pre-wrap',
                            color: theme.palette.text.secondary,
                            mb: 6,
                            lineHeight: 1.7,
                            fontSize: '1.1rem',
                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                                marginTop: '24px',
                                marginBottom: '16px',
                                fontWeight: 'bold',
                            }
                        }}>
                            {post.content && parse(post.content, parseOptions)}
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.background.default, 0.6) }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button
                                    startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                    onClick={handleLike}
                                    disabled={!user}
                                    sx={{ color: isLiked ? theme.palette.error.main : theme.palette.text.secondary, textTransform: 'none' }}
                                >
                                    {likes} Thích
                                </Button>
                                <Button
                                    startIcon={<ChatBubbleOutlineIcon />}
                                    sx={{ color: theme.palette.text.secondary, textTransform: 'none' }}
                                    onClick={() => document.getElementById('comment-input')?.focus()}
                                >
                                    {comments.length} Bình luận
                                </Button>
                            </Stack>
                            <Box>
                                <Rating
                                    name="post-rating"
                                    value={userRating}
                                    onChange={(_, newVal) => handleRate(newVal)}
                                    precision={1}
                                    emptyIcon={<StarBorderIcon style={{ color: theme.palette.action.disabled }} />}
                                    disabled={!user}
                                />
                            </Box>
                        </Stack>
                        <Divider sx={{ my: 2 }} />
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
                                        background: theme.palette.background.default,
                                        borderRadius: 1,
                                        transition: 'background-color 0.4s ease',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 2
                                    }}
                                >
                                    <Avatar
                                        src={constructUrl(c.author?.avatarUrl)}
                                        alt={c.author?.fullName || c.authorName}
                                    >
                                        {c.author?.fullName?.charAt(0) || c.authorName?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: theme.palette.primary.light, fontWeight: 'bold' }}>
                                            {c.author?.fullName || c.authorName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                                            {c.content}
                                        </Typography>
                                    </Box>
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
                                    id="comment-input"
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
                </Grid>
            </Grid>
        </Box>
    );
};

export default PostDetail;
