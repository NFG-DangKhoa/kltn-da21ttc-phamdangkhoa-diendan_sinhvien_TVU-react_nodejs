import React, { useState, useEffect, useContext } from 'react';
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
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    CircularProgress,
    alpha,
    Fade,
    Zoom
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Visibility as ViewIcon,
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
    TrendingUp as TrendingIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { ThemeContext } from '../context/ThemeContext';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import axios from 'axios';

const AllPosts = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(12);

    const theme = useTheme();
    const { mode } = useContext(ThemeContext);
    const isDarkMode = mode === 'dark';
    const navigate = useNavigate();

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch posts - sử dụng API không cần auth
                const postsRes = await axios.get('http://localhost:5000/api/posts/recent?limit=100');
                if (postsRes.data && Array.isArray(postsRes.data)) {
                    setPosts(postsRes.data);
                    setFilteredPosts(postsRes.data);
                } else {
                    console.log('No posts data received');
                    setPosts([]);
                    setFilteredPosts([]);
                }

                // Fetch topics
                const topicsRes = await axios.get('http://localhost:5000/api/topics/all');
                if (topicsRes.data && Array.isArray(topicsRes.data)) {
                    setTopics(topicsRes.data);
                } else {
                    console.log('No topics data received');
                    setTopics([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter and sort posts
    useEffect(() => {
        let filtered = posts;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by topic
        if (selectedTopic) {
            filtered = filtered.filter(post =>
                post.topicId === selectedTopic ||
                post.topicId?._id === selectedTopic
            );
        }

        // Sort posts
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'mostViewed':
                filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'mostLiked':
                filtered.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
                break;
            case 'mostCommented':
                filtered.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
                break;
            default:
                break;
        }

        setFilteredPosts(filtered);
        setCurrentPage(1);
    }, [posts, searchTerm, selectedTopic, sortBy]);

    // Pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // Format functions
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num?.toString() || '0';
    };

    const handlePostClick = (post) => {
        navigate(`/posts/detail?topicId=${post.topicId?._id || post.topicId}&postId=${post._id}`);
    };

    const getTopicColor = (topic) => {
        if (typeof topic === 'object' && topic?.color) return topic.color;
        const foundTopic = topics.find(t => t._id === topic || t._id === topic?._id);
        return foundTopic?.color || '#2196F3';
    };

    const getTopicName = (topic) => {
        if (typeof topic === 'object' && topic?.name) return topic.name;
        const foundTopic = topics.find(t => t._id === topic || t._id === topic?._id);
        return foundTopic?.name || 'Chưa phân loại';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${alpha('#f5f7fa', 0.8)} 0%, ${alpha('#c3cfe2', 0.8)} 100%)`,
            pt: 12
        }}>
            {/* Breadcrumb */}
            <BreadcrumbNavigation
                darkMode={isDarkMode}
                items={[
                    { label: 'Trang chủ', path: '/' },
                    { label: 'Tất cả bài viết', path: '/all-posts' }
                ]}
            />

            <Container maxWidth="xl">
                {/* Header - Enhanced */}
                <Fade in timeout={800}>
                    <Box sx={{
                        background: isDarkMode
                            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                        color: 'white',
                        p: { xs: 4, md: 8 },
                        borderRadius: 4,
                        mb: 6,
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: isDarkMode
                            ? '0 20px 40px rgba(0,0,0,0.3)'
                            : '0 20px 40px rgba(102,126,234,0.3)',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                            opacity: 0.6
                        }
                    }}>
                        <Typography variant="h2" component="h1" gutterBottom sx={{
                            fontWeight: 900,
                            mb: 3,
                            position: 'relative',
                            zIndex: 2,
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            background: 'linear-gradient(45deg, #fff, #f0f0f0)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            📚 Tất cả bài viết
                        </Typography>
                        <Typography variant="h5" sx={{
                            opacity: 0.95,
                            maxWidth: 700,
                            mx: 'auto',
                            position: 'relative',
                            zIndex: 2,
                            fontWeight: 400,
                            lineHeight: 1.6,
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                            mb: 4
                        }}>
                            Khám phá và tìm hiểu những bài viết thú vị từ cộng đồng sinh viên TVU
                        </Typography>

                        {/* Stats */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 4,
                            position: 'relative',
                            zIndex: 2
                        }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    {filteredPosts.length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Bài viết
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    {topics.length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Chủ đề
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Fade>

                {/* Filters */}
                <Fade in timeout={1000}>
                    <Card sx={{ mb: 4, borderRadius: 3, boxShadow: theme.shadows[4] }}>
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3} alignItems="center">
                                {/* Search */}
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        placeholder="Tìm kiếm bài viết..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Topic Filter */}
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Chủ đề</InputLabel>
                                        <Select
                                            value={selectedTopic}
                                            label="Chủ đề"
                                            onChange={(e) => setSelectedTopic(e.target.value)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            <MenuItem value="">Tất cả chủ đề</MenuItem>
                                            {topics.map((topic) => (
                                                <MenuItem key={topic._id} value={topic._id}>
                                                    {topic.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Sort */}
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Sắp xếp</InputLabel>
                                        <Select
                                            value={sortBy}
                                            label="Sắp xếp"
                                            onChange={(e) => setSortBy(e.target.value)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            <MenuItem value="newest">Mới nhất</MenuItem>
                                            <MenuItem value="oldest">Cũ nhất</MenuItem>
                                            <MenuItem value="mostViewed">Nhiều lượt xem</MenuItem>
                                            <MenuItem value="mostLiked">Nhiều lượt thích</MenuItem>
                                            <MenuItem value="mostCommented">Nhiều bình luận</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Results count */}
                                <Grid item xs={12} md={2}>
                                    <Typography variant="body2" color="text.secondary" textAlign="center">
                                        {filteredPosts.length} bài viết
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Fade>

                {/* Posts Grid */}
                {currentPosts.length > 0 ? (
                    <Grid container spacing={4}>
                        {currentPosts.map((post, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={post._id}>
                                <Zoom in timeout={600 + index * 100}>
                                    <Card
                                        sx={{
                                            height: '100%', // Đảm bảo chiều cao 100% trong Grid item
                                            minHeight: 480, // Chiều cao tối thiểu
                                            maxHeight: 480, // Chiều cao tối đa
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            boxShadow: theme.shadows[2],
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            '&:hover': {
                                                transform: 'translateY(-12px)',
                                                boxShadow: theme.shadows[16],
                                                borderColor: alpha(theme.palette.primary.main, 0.3)
                                            }
                                        }}
                                        onClick={() => handlePostClick(post)}
                                    >
                                        {/* Post Image */}
                                        {post.thumbnailImage || post.images?.[0] ? (
                                            <CardMedia
                                                component="img"
                                                height="220" // Cố định chiều cao ảnh
                                                image={post.thumbnailImage || post.images?.[0]}
                                                alt={post.title}
                                                sx={{
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': { transform: 'scale(1.05)' }
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 220, // Cố định chiều cao placeholder giống ảnh
                                                    bgcolor: alpha(getTopicColor(post.topicId), 0.15),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: getTopicColor(post.topicId),
                                                    background: `linear-gradient(135deg, ${alpha(getTopicColor(post.topicId), 0.1)} 0%, ${alpha(getTopicColor(post.topicId), 0.2)} 100%)`
                                                }}
                                            >
                                                <Typography variant="h3" sx={{ opacity: 0.7 }}>
                                                    📝
                                                </Typography>
                                            </Box>
                                        )}

                                        <CardContent sx={{
                                            flexGrow: 1,
                                            p: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2
                                        }}>
                                            {/* Topic & Date */}
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Chip
                                                    label={getTopicName(post.topicId)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(getTopicColor(post.topicId), 0.1),
                                                        color: getTopicColor(post.topicId),
                                                        fontWeight: 600
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(post.createdAt)}
                                                </Typography>
                                            </Box>

                                            {/* Title */}
                                            <Typography
                                                variant="h6"
                                                component="h2"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '1.1rem',
                                                    lineHeight: 1.4,
                                                    mb: 1,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {post.title}
                                            </Typography>

                                            {/* Description */}
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    mb: 'auto'
                                                }}
                                            >
                                                {post.description}
                                            </Typography>

                                            {/* Author & Stats */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                mt: 2,
                                                pt: 2,
                                                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                            }}>
                                                <Avatar
                                                    src={post.author?.avatarUrl}
                                                    alt={post.author?.name}
                                                    sx={{ width: 32, height: 32 }}
                                                />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="subtitle2" noWrap>
                                                        {post.author?.name}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    color: 'text.secondary'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <FavoriteIcon sx={{ fontSize: '0.9rem' }} />
                                                        <Typography variant="caption">
                                                            {post.likesCount || 0}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CommentIcon sx={{ fontSize: '0.9rem' }} />
                                                        <Typography variant="caption">
                                                            {post.commentsCount || 0}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Zoom>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Fade in timeout={1000}>
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 8,
                                bgcolor: 'background.paper',
                                borderRadius: 3,
                                border: '2px dashed',
                                borderColor: 'grey.300'
                            }}
                        >
                            <Typography variant="h5" color="text.secondary" mb={2}>
                                Không tìm thấy bài viết nào
                            </Typography>
                            <Typography variant="body1" color="text.secondary" mb={3}>
                                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTopic('');
                                    setSortBy('newest');
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </Box>
                    </Fade>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Fade in timeout={1200}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(event, value) => setCurrentPage(value)}
                                color="primary"
                                size="large"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        borderRadius: 2,
                                        fontWeight: 500
                                    }
                                }}
                            />
                        </Box>
                    </Fade>
                )}
            </Container>
        </Box>
    );
};

export default AllPosts;
