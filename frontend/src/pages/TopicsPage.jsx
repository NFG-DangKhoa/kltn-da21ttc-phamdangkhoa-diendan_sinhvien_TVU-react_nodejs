import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Toolbar, // Added Toolbar import

    Box,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    useMediaQuery,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Avatar,
    IconButton,
    Paper,
    Divider,
    useTheme,
    alpha,
    Fade,
    Slide,
    Zoom
} from '@mui/material';
import {
    Search as SearchIcon,
    TrendingUp as TrendingUpIcon,
    School as SchoolIcon,
    Forum as ForumIcon,
    People as PeopleIcon,
    Star as StarIcon,
    ArrowForward as ArrowForwardIcon,
    Visibility as VisibilityIcon,
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
    AccessTime as AccessTimeIcon,
    LocalFireDepartment as FireIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as WebsiteIcon,
    EmojiEvents as AwardIcon,
    Groups as StudentsIcon,
    MenuBook as FacultyIcon,
    Business as DepartmentIcon,
    Home as HomeIcon, // Added HomeIcon
    Topic as TopicIcon // Added TopicIcon
} from '@mui/icons-material';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import HeroSection from '../components/HeroSection';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';

const TopicsPage = () => {
    const [topics, setTopics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [visibleSections, setVisibleSections] = useState({
        hero: false,
        topics: false
    });

    const theme = useTheme();
    const { mode } = useContext(ThemeContext);
    const isDarkMode = mode === 'dark';
    const navigate = useNavigate();

    const handleTopicClick = (topic) => {
        const topicId = topic._id || topic.id;
        if (topicId) {
            navigate(`/topic/${topicId}`);
        }
    };

    const handleLatestPostClick = (latestPost, topicId) => {
        const postId = latestPost._id || latestPost.id;
        if (topicId && postId) {
            const url = `/post-detail?topicId=${topicId}&postId=${postId}`;
            navigate(url);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchData = async () => {
            try {
                setLoading(true);
                const topicsRes = await axios.get('http://localhost:5000/api/topics/with-latest-posts');
                if (topicsRes.data.success) {
                    setTopics(topicsRes.data.data);
                } else {
                    const basicTopicsRes = await axios.get('http://localhost:5000/api/topics/all');
                    setTopics(basicTopicsRes.data);
                }
                setLoading(false);
                setTimeout(() => setVisibleSections(prev => ({ ...prev, hero: true })), 100);
                setTimeout(() => setVisibleSections(prev => ({ ...prev, topics: true })), 300);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const filteredTopics = topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`
                }}
            >
                <Typography variant="h6" color="text.secondary">
                    Đang tải...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <BreadcrumbNavigation
                darkMode={isDarkMode}
            />

            <Box sx={{
                px: { xs: 1, sm: 2, md: 3 },
                mt: '20px', // Margin-top để không bị che bởi header + breadcrumb
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '100vw',
                mx: 'auto'
            }}>
                <HeroSection visible={visibleSections.hero} />

                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Fade in={visibleSections.topics} timeout={1000}>
                        <Box>
                            <Typography
                                variant="h3"
                                component="h2"
                                textAlign="center"
                                mb={1}
                                fontWeight="bold"
                                color="text.primary"
                            >
                                Tìm kiếm chủ đề
                            </Typography>
                            <Typography
                                variant="body1"
                                textAlign="center"
                                color="text.secondary"
                                mb={4}
                                maxWidth="600px"
                                mx="auto"
                            >
                                Khám phá và tham gia thảo luận về các chủ đề bạn quan tâm
                            </Typography>

                            <Box maxWidth={600} mx="auto" >
                                <TextField
                                    fullWidth
                                    placeholder="Tìm kiếm chủ đề..."
                                    variant="outlined"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                    }}
                                />
                            </Box>
                        </Box>
                    </Fade>
                </Container>

                <Container maxWidth="xl" sx={{ py: 6 }}>
                    <Fade in={visibleSections.topics} timeout={1000}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                boxShadow: theme.shadows[4]
                            }}
                        >
                            {filteredTopics.length > 0 ? (
                                <Box>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 3fr 1fr 2fr',
                                            gap: 2,
                                            p: 3,
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                                            Chủ đề
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                                            Mô tả
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold" color="primary.main" textAlign="center">
                                            Bài viết
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                                            Bài viết gần nhất
                                        </Typography>
                                    </Box>

                                    {filteredTopics.map((topic, index) => (
                                        <Zoom in={visibleSections.topics} timeout={600 + index * 50} key={topic._id}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '2fr 3fr 1fr 2fr',
                                                    gap: 2,
                                                    p: 3,
                                                    borderBottom: index < filteredTopics.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}
                                                onClick={() => handleTopicClick(topic)}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 2,
                                                            bgcolor: topic.color || '#2196F3',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '1.2rem',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {topic.icon || '📚'}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="bold" mb={0.5}>
                                                            {topic.name}
                                                        </Typography>
                                                        {topic.trending && (
                                                            <Chip
                                                                label="🔥 Thịnh hành"
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: alpha('#FF5722', 0.1),
                                                                    color: '#FF5722',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.4
                                                        }}
                                                    >
                                                        {topic.description || `Thảo luận về ${topic.name.toLowerCase()}`}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                                                            {topic.postCount || 0}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            bài viết
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {topic.latestPost ? (
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1.5,
                                                                width: '100%',
                                                                cursor: 'pointer',
                                                                borderRadius: 2,
                                                                p: 1,
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                                    transform: 'translateX(4px)'
                                                                }
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLatestPostClick(topic.latestPost, topic._id);
                                                            }}
                                                        >
                                                            <Avatar
                                                                src={topic.latestPost.authorInfo?.avatarUrl || topic.latestPost.author?.avatarUrl}
                                                                sx={{ width: 32, height: 32, flexShrink: 0 }}
                                                            >
                                                                {(topic.latestPost.authorInfo?.fullName || topic.latestPost.author?.fullName || 'A').charAt(0)}
                                                            </Avatar>
                                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight="medium"
                                                                    sx={{
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 1,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        color: 'primary.main',
                                                                        '&:hover': {
                                                                            textDecoration: 'underline'
                                                                        }
                                                                    }}
                                                                >
                                                                    {topic.latestPost.title}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    bởi {topic.latestPost.authorInfo?.fullName || topic.latestPost.author?.fullName || 'Ẩn danh'}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    {formatTimeAgo(topic.latestPost.createdAt)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                            Chưa có bài viết
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Zoom>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography variant="h6" color="text.secondary" mb={1}>
                                        Không tìm thấy chủ đề nào
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Thử thay đổi từ khóa tìm kiếm
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Fade>
                </Container>
            </Box>
        </Box>
    );
};

export default TopicsPage;
