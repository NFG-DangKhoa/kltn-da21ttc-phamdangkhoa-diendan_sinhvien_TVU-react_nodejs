import React, { useEffect, useState, useContext } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Avatar,
    CircularProgress,
    Alert,
    useTheme,
    alpha,
    Zoom
} from '@mui/material';
import {
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
    Visibility as VisibilityIcon,
    Star as StarIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';

// Helper function to construct full URL for images
const constructUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

const FeaturedPostsPage = () => {
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();
    const { mode } = useContext(ThemeContext);
    const isDarkMode = mode === 'dark';
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeaturedPosts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/home/featured-posts?limit=100&t=${Date.now()}`); // Fetch more posts
                if (response.data.success) {
                    setFeaturedPosts(response.data.data);
                } else {
                    setError('Không thể tải bài viết nổi bật.');
                }
            } catch (err) {
                console.error('Error fetching featured posts:', err);
                setError('Đã xảy ra lỗi khi tải bài viết nổi bật.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedPosts();
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffMinutes < 1) return 'Vừa xong';
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
        if (diffMonths < 12) return `${diffMonths} tháng trước`;
        return `${Math.floor(diffMonths / 12)} năm trước`;
    };

    const handlePostClick = (post) => {
        const topicId = post.topicInfo?._id ||
            post.topic?._id ||
            post.topicId?._id ||
            post.topicId ||
            post.topic_id ||
            post.topic;

        const postId = post._id || post.id || post.postId;

        if (topicId && postId) {
            const url = `/post-detail?topicId=${topicId}&postId=${postId}`;
            navigate(url);
        } else {
            console.error('Missing topicId or postId:', { topicId, postId, post });
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Đang tải bài viết nổi bật...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Box>
            <BreadcrumbNavigation
                darkMode={isDarkMode}
                path={[{ name: 'Trang chủ', path: '/' }, { name: 'Bài viết nổi bật', path: '/featured-posts' }]}
            />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <ArrowBackIcon
                        sx={{ mr: 1, cursor: 'pointer' }}
                        onClick={() => navigate(-1)}
                    />
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight="bold"
                        color="text.primary"
                    >
                        Tất cả bài viết nổi bật
                    </Typography>
                </Box>

                {featuredPosts.length > 0 ? (
                    <Grid container spacing={3} justifyContent="center">
                        {featuredPosts.map((post, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={post._id || post.id}>
                                <Zoom in={true} timeout={500 + index * 50}>
                                    <Card
                                        sx={{
                                            minWidth: 280,
                                            maxWidth: 280,
                                            height: 320,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            boxShadow: theme.shadows[2],
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: theme.shadows[12],
                                                borderColor: alpha(theme.palette.primary.main, 0.3)
                                            }
                                        }}
                                        onClick={() => handlePostClick(post)}
                                    >
                                        {(post.thumbnailImage || post.images?.[0] || post.image) ? (
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={post.thumbnailImage || post.images?.[0] || post.image}
                                                alt={post.title}
                                                sx={{
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 140,
                                                    background: `linear-gradient(135deg, ${alpha(post.topicInfo?.color || post.topic?.color || post.topicId?.color || '#2196F3', 0.1)} 0%, ${alpha(post.topicInfo?.color || post.topic?.color || post.topicId?.color || '#2196F3', 0.3)} 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: post.topicInfo?.color || post.topic?.color || post.topicId?.color || '#2196F3',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    p: 2,
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: `radial-gradient(circle at 30% 30%, ${alpha(post.topicInfo?.color || post.topic?.color || post.topicId?.color || '#2196F3', 0.2)} 0%, transparent 50%)`,
                                                    }
                                                }}
                                            >
                                                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.3,
                                                            fontSize: '0.9rem',
                                                            color: 'inherit',
                                                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                        }}
                                                    >
                                                        {post.title}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                        <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                                            {/* Topic Chip */}
                                            <Box sx={{ mb: 1 }}>
                                                <Chip
                                                    label={post.topicInfo?.name || post.topic?.name || post.topicId?.name || 'Chưa phân loại'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(post.topicInfo?.color || post.topic?.color || post.topicId?.color || '#2196F3', 0.1),
                                                        color: post.topicInfo?.color || post.topic?.color || post.topicId?.color || '#2196F3',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            </Box>

                                            {/* Title */}
                                            <Typography
                                                variant="h6"
                                                component="h3"
                                                mb={1}
                                                fontWeight="bold"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    fontSize: '0.95rem',
                                                    lineHeight: 1.3
                                                }}
                                            >
                                                {post.title}
                                            </Typography>

                                            {/* Author and Time */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Avatar
                                                    src={constructUrl(post.authorInfo?.avatarUrl)}
                                                    sx={{ width: 20, height: 20, mr: 1 }}
                                                >
                                                    {(post.authorInfo?.fullName || 'A').charAt(0)}
                                                </Avatar>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="caption" fontWeight="medium" display="block" sx={{ fontSize: '0.75rem' }}>
                                                        {post.authorInfo?.fullName || 'Ẩn danh'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                        {formatTimeAgo(post.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Stats */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto', flexWrap: 'wrap' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                    <CommentIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                        {post.commentCount || post.comments || 0}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                    <FavoriteIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                        {post.likeCount || post.likes || 0}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                    <VisibilityIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                        {formatNumber(post.views || 0)}
                                                    </Typography>
                                                </Box>
                                                {/* Rating Stars */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <StarIcon
                                                                key={star}
                                                                sx={{
                                                                    fontSize: 10,
                                                                    color: star <= (post.averageRating || 0) ? '#FFD700' : 'rgba(0,0,0,0.2)'
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                        ({post.totalRatings || 0})
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Zoom>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 8,
                            bgcolor: 'grey.50',
                            borderRadius: 3,
                            border: '2px dashed',
                            borderColor: 'grey.300'
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" mb={1}>
                            Không có bài viết nổi bật nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Hiện tại không có bài viết nào được đánh dấu là nổi bật.
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default FeaturedPostsPage;
