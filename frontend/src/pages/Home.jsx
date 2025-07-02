import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
    Business as DepartmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import HeroSection from '../components/HeroSection';
import StatsCard from '../components/StatsCard';
import TopicCard from '../components/TopicCard';

import TopicGrid from '../components/TopicGrid';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';
import AdminContactInfo from '../components/AdminContactInfo';

const Section = ({ title, children }) => (
    <Box mb={4}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
            {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
            {children}
        </Grid>
    </Box>
);

const Home = () => {
    const [topics, setTopics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        userCount: 0,
        postCount: 0,
        topicCount: 0,
        todayActivity: 0
    });
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [featuredLoading, setFeaturedLoading] = useState(false);
    const [trendingTopicsData, setTrendingTopicsData] = useState([]);
    const [visibleSections, setVisibleSections] = useState({
        hero: false,
        stats: false,
        featured: false,
        trending: false,
        topics: false
    });

    const theme = useTheme();
    const { mode } = useContext(ThemeContext);
    const isDarkMode = mode === 'dark';
    const navigate = useNavigate();

    // Navigation handlers for stats
    const handleStatsClick = (statLabel) => {
        switch (statLabel) {
            case 'Thành viên':
                navigate('/MembersList');
                break;
            case 'Bài viết':
                navigate('/all-posts');
                break;
            case 'Chủ đề':
                // Scroll to trending topics section
                const trendingSection = document.getElementById('trending-topics-section');
                if (trendingSection) {
                    trendingSection.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case 'Hoạt động hôm nay':
                // Navigate to first available topic detail page
                if (topics.length > 0) {
                    navigate(`/topic/${topics[0]._id}`);
                } else {
                    navigate('/');
                }
                break;
            default:
                break;
        }
    };

    // Navigation handlers - Using correct URL patterns from App.jsx routes
    const handlePostClick = (post) => {
        console.log('🎯 Featured Post clicked:', post);

        // Try multiple ways to extract topicId
        const topicId = post.topicInfo?._id ||
            post.topic?._id ||
            post.topicId?._id ||
            post.topicId ||
            post.topic_id ||
            post.topic;

        // Try multiple ways to extract postId
        const postId = post._id || post.id || post.postId;

        console.log('🔍 Extracted IDs:', { topicId, postId });
        console.log('🔍 Post structure debug:', {
            topicInfo: post.topicInfo,
            topic: post.topic,
            topicId: post.topicId,
            topic_id: post.topic_id,
            _id: post._id,
            id: post.id
        });

        if (topicId && postId) {
            const url = `/post-detail?topicId=${topicId}&postId=${postId}`;
            console.log('🚀 Navigating to:', url);
            navigate(url);
        } else {
            console.error('❌ Missing topicId or postId:', { topicId, postId, post });
        }
    };

    const handleTopicClick = (topic) => {
        const topicId = topic._id || topic.id;
        if (topicId) {
            // Use /topic/:topicId route (matches TopicCard pattern and App.jsx)
            navigate(`/topic/${topicId}`);
        }
    };

    // Navigation handler for latest post in topics table
    const handleLatestPostClick = (latestPost, topicId) => {
        console.log('🎯 Latest Post clicked:', latestPost);

        const postId = latestPost._id || latestPost.id;

        console.log('🔍 Extracted IDs for latest post:', { topicId, postId });

        if (topicId && postId) {
            const url = `/posts/detail?topicId=${topicId}&postId=${postId}`;
            console.log('🚀 Navigating to latest post:', url);
            navigate(url);
        } else {
            console.error('❌ Missing topicId or postId for latest post:', { topicId, postId, latestPost });
        }
    };

    // Function to refresh featured posts only
    const refreshFeaturedPosts = async () => {
        try {
            setFeaturedLoading(true);
            console.log('Refreshing featured posts...');
            const featuredRes = await axios.get(`http://localhost:5000/api/home/featured-posts?limit=10&t=${Date.now()}`);
            if (featuredRes.data.success) {
                console.log('Featured posts refreshed:', featuredRes.data.data.length);
                setFeaturedPosts(featuredRes.data.data);
            } else {
                console.log('Featured posts API failed during refresh');
                setFeaturedPosts([]);
            }
        } catch (error) {
            console.log('Featured posts API error during refresh:', error.message);
            setFeaturedPosts([]);
        } finally {
            setFeaturedLoading(false);
        }
    };

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch home statistics
                try {
                    const statsRes = await axios.get('http://localhost:5000/api/home/stats');
                    if (statsRes.data.success) {
                        setStats(statsRes.data.data);
                    }
                } catch (error) {
                    console.log('Stats API not available, using default values');
                }

                // Fetch featured posts
                try {
                    const featuredRes = await axios.get(`http://localhost:5000/api/home/featured-posts?limit=10&t=${Date.now()}`);
                    if (featuredRes.data.success) {
                        console.log('Featured posts loaded:', featuredRes.data.data.length);
                        console.log('🔍 Featured posts structure:', featuredRes.data.data[0]); // Debug first post structure
                        setFeaturedPosts(featuredRes.data.data);
                    } else {
                        console.log('Featured posts API failed, showing empty');
                        setFeaturedPosts([]); // Don't show mock data if API fails
                    }
                } catch (error) {
                    console.log('Featured posts API error:', error.message);
                    setFeaturedPosts([]); // Don't show mock data if API fails
                }

                // Fetch trending topics
                try {
                    const trendingRes = await axios.get('http://localhost:5000/api/home/trending-topics?limit=8');
                    if (trendingRes.data.success) {
                        console.log('Trending topics from API:', trendingRes.data.data);
                        setTrendingTopicsData(trendingRes.data.data);
                    } else {
                        setTrendingTopicsData(trendingTopics);
                    }
                } catch (error) {
                    console.log('Trending topics API not available, using mock data');
                    setTrendingTopicsData(trendingTopics);
                }

                // Fetch all topics with latest posts for detailed table
                try {
                    const topicsRes = await axios.get('http://localhost:5000/api/topics/with-latest-posts');
                    if (topicsRes.data.success) {
                        console.log('Topics with latest posts loaded:', topicsRes.data.data.length);
                        setTopics(topicsRes.data.data);
                    } else {
                        // Fallback to basic topics API
                        const basicTopicsRes = await axios.get('http://localhost:5000/api/topics/all');
                        setTopics(basicTopicsRes.data);
                    }
                } catch (error) {
                    console.log('Topics API not available, trying fallback');
                    try {
                        const basicTopicsRes = await axios.get('http://localhost:5000/api/topics/all');
                        setTopics(basicTopicsRes.data);
                    } catch (fallbackError) {
                        console.log('All topics APIs failed');
                        setTopics([]);
                    }
                }



                setLoading(false);

                // Animate sections
                setTimeout(() => setVisibleSections(prev => ({ ...prev, hero: true })), 100);
                setTimeout(() => setVisibleSections(prev => ({ ...prev, stats: true })), 300);
                setTimeout(() => setVisibleSections(prev => ({ ...prev, featured: true })), 500);
                setTimeout(() => setVisibleSections(prev => ({ ...prev, trending: true })), 700);
                setTimeout(() => setVisibleSections(prev => ({ ...prev, topics: true })), 900);

            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);



    const trendingTopics = [
        { id: 1, name: 'Học tập & Nghiên cứu', postCount: 120, growth: '+15%', icon: <SchoolIcon />, color: '#2196F3' },
        { id: 2, name: 'Đời sống Sinh viên', postCount: 95, growth: '+8%', icon: <PeopleIcon />, color: '#FF9800' },
        { id: 3, name: 'Tuyển dụng & Việc làm', postCount: 78, growth: '+22%', icon: <ForumIcon />, color: '#9C27B0' },
        { id: 4, name: 'Sự kiện & Hoạt động', postCount: 60, growth: '+12%', icon: <StarIcon />, color: '#4CAF50' },
        { id: 5, name: 'Thắc mắc & Giải đáp', postCount: 55, growth: '+5%', icon: <FireIcon />, color: '#F44336' }
    ];



    // Helper functions - defined before use
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

    const filteredTopics = topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamic forum stats using real data
    const forumStats = [
        {
            label: 'Thành viên',
            value: formatNumber(stats.userCount),
            icon: <PeopleIcon />,
            color: '#2196F3'
        },
        {
            label: 'Bài viết',
            value: formatNumber(stats.postCount),
            icon: <ForumIcon />,
            color: '#4CAF50'
        },
        {
            label: 'Chủ đề',
            value: formatNumber(stats.topicCount),
            icon: <SchoolIcon />,
            color: '#FF9800'
        },
        {
            label: 'Hoạt động hôm nay',
            value: formatNumber(stats.todayActivity),
            icon: <TrendingUpIcon />,
            color: '#9C27B0'
        }
    ];

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
            {/* Global Breadcrumb Navigation - Only show "Trang chủ" */}
            <BreadcrumbNavigation
                darkMode={isDarkMode}
            />

            <Box sx={{ maxWidth: 1200, mx: "auto", pt: 4 }}>
                {/* Hero Section */}
                <HeroSection visible={visibleSections.hero} />

                {/* Featured Posts */}
                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Fade in={visibleSections.featured} timeout={1000}>
                        <Box>
                            <Typography
                                variant="h3"
                                component="h2"
                                textAlign="center"
                                mb={1}
                                fontWeight="bold"
                                color="text.primary"
                            >
                                Bài viết nổi bật
                            </Typography>
                            <Typography
                                variant="body1"
                                textAlign="center"
                                color="text.secondary"
                                mb={3}
                                maxWidth="600px"
                                mx="auto"
                            >
                                Khám phá những bài viết được quan tâm nhất từ cộng đồng sinh viên TVU
                            </Typography>

                            {/* Debug refresh button */}
                            <Box textAlign="center" mb={3}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={refreshFeaturedPosts}
                                    disabled={featuredLoading}
                                    sx={{ fontSize: '0.8rem' }}
                                >
                                    {featuredLoading ? '⏳ Loading...' : '🔄 Refresh Featured Posts'}
                                </Button>
                            </Box>

                            {featuredPosts.length > 0 ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        overflowX: 'auto',
                                        pb: 2,
                                        px: 1,
                                        '&::-webkit-scrollbar': {
                                            height: 8,
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            backgroundColor: alpha(theme.palette.divider, 0.1),
                                            borderRadius: 4,
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: theme.palette.primary.main,
                                            borderRadius: 4,
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.dark,
                                            },
                                        },
                                    }}
                                >
                                    {featuredPosts.map((post, index) => (
                                        <Zoom in={visibleSections.featured} timeout={600 + index * 100} key={post._id || post.id}>
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
                                                            src={post.authorInfo?.avatarUrl || post.author?.avatarUrl || post.authorId?.avatarUrl}
                                                            sx={{ width: 20, height: 20, mr: 1 }}
                                                        >
                                                            {(post.authorInfo?.fullName || post.author?.fullName || post.authorId?.fullName || 'A').charAt(0)}
                                                        </Avatar>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="caption" fontWeight="medium" display="block" sx={{ fontSize: '0.75rem' }}>
                                                                {post.authorInfo?.fullName || post.author?.fullName || post.authorId?.fullName || 'Ẩn danh'}
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
                                    ))}
                                </Box>
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
                                        Chưa có bài viết nổi bật
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Admin chưa đánh dấu bài viết nào là nổi bật
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Fade>
                </Container>

                {/* Trending Topics */}
                <Box id="trending-topics-section" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), py: 6 }}>
                    <Container maxWidth="lg">
                        <Fade in={visibleSections.trending} timeout={1000}>
                            <Box>
                                <Typography
                                    variant="h3"
                                    component="h2"
                                    textAlign="center"
                                    mb={1}
                                    fontWeight="bold"
                                    color="text.primary"
                                >
                                    Chủ đề thịnh hành
                                </Typography>
                                <Typography
                                    variant="body1"
                                    textAlign="center"
                                    color="text.secondary"
                                    mb={5}
                                    maxWidth="600px"
                                    mx="auto"
                                >
                                    Những chủ đề được quan tâm và thảo luận nhiều nhất trong tuần
                                </Typography>

                                <Grid container spacing={3} justifyContent="center">
                                    {trendingTopicsData.map((topic, index) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={topic._id || topic.id}>
                                            <Zoom in={visibleSections.trending} timeout={600 + index * 100}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 3,
                                                        textAlign: 'center',
                                                        borderRadius: 3,
                                                        border: `2px solid ${alpha(topic.color || '#2196F3', 0.2)}`,
                                                        bgcolor: alpha(topic.color || '#2196F3', 0.05),
                                                        transition: 'all 0.3s ease',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            transform: 'translateY(-8px)',
                                                            boxShadow: `0 12px 40px ${alpha(topic.color || '#2196F3', 0.3)}`,
                                                            bgcolor: alpha(topic.color || '#2196F3', 0.1)
                                                        }
                                                    }}
                                                    onClick={() => handleTopicClick(topic)}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 60,
                                                            height: 60,
                                                            borderRadius: '50%',
                                                            bgcolor: topic.color || '#2196F3',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mx: 'auto',
                                                            mb: 2,
                                                            color: 'white',
                                                            fontSize: '1.5rem'
                                                        }}
                                                    >
                                                        {topic.icon || (topic.category === 'academic' ? '📚' :
                                                            topic.category === 'social' ? '👥' :
                                                                topic.category === 'career' ? '💼' :
                                                                    topic.category === 'event' ? '🎉' : '💬')}
                                                    </Box>
                                                    <Typography variant="h6" fontWeight="bold" mb={1}>
                                                        {topic.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                                        {topic.postCount || 0} bài viết
                                                    </Typography>
                                                    {topic.trending && (
                                                        <Chip
                                                            label="🔥 Thịnh hành"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha('#FF5722', 0.1),
                                                                color: '#FF5722',
                                                                fontWeight: 600,
                                                                mb: 1
                                                            }}
                                                        />
                                                    )}
                                                    {topic.recentPostCount > 0 && (
                                                        <Chip
                                                            label={`+${topic.recentPostCount} tuần này`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha('#4CAF50', 0.1),
                                                                color: '#4CAF50',
                                                                fontWeight: 600,
                                                                ml: topic.trending ? 1 : 0,
                                                                mt: topic.trending ? 1 : 0
                                                            }}
                                                        />
                                                    )}
                                                </Paper>
                                            </Zoom>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Fade>
                    </Container>
                </Box>

                {/* Search Section */}
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
                                    slotProps={{
                                        input: {
                                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                            sx: {
                                                borderRadius: '50px',
                                                bgcolor: 'background.paper',
                                                '& fieldset': {
                                                    borderColor: 'transparent'
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'primary.main'
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'primary.main',
                                                    borderWidth: '2px'
                                                }
                                            }
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            boxShadow: theme.shadows[4]
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Fade>
                </Container>

                {/* Topics Table - Detailed View */}
                <Container maxWidth="xl" sx={{ py: 6 }}>
                    <Fade in={visibleSections.topics} timeout={1000}>
                        <Box>
                            {/* Topics Table */}
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
                                        {/* Table Header */}
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

                                        {/* Table Body */}
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
                                                    {/* Topic Name */}
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

                                                    {/* Description */}
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

                                                    {/* Post Count */}
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

                                                    {/* Latest Post */}
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
                                                                    e.stopPropagation(); // Prevent topic row click
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
                        </Box>
                    </Fade>
                </Container>


                {/* Forum Stats */}
                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Fade in={visibleSections.stats} timeout={1000}>
                        <Grid container spacing={3} justifyContent="center">
                            {forumStats.map((stat, index) => (
                                <Grid item xs={6} sm={6} md={3} key={stat.label}>
                                    <StatsCard
                                        stat={stat}
                                        index={index}
                                        visible={visibleSections.stats}
                                        variant="gradient"
                                        onClick={() => handleStatsClick(stat.label)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Fade>
                </Container>

                {/* University Information Section */}
                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), py: 8 }}>
                    <Container maxWidth="lg">
                        <Fade in={visibleSections.topics} timeout={1200}>
                            <Box>
                                <Typography
                                    variant="h3"
                                    component="h2"
                                    textAlign="center"
                                    mb={1}
                                    fontWeight="bold"
                                    color="text.primary"
                                >
                                    Trường Đại học Trà Vinh
                                </Typography>
                                <Typography
                                    variant="h6"
                                    textAlign="center"
                                    color="primary.main"
                                    mb={2}
                                    fontWeight="medium"
                                >
                                    Tra Vinh University
                                </Typography>
                                <Typography
                                    variant="body1"
                                    textAlign="center"
                                    color="text.secondary"
                                    mb={6}
                                    maxWidth="800px"
                                    mx="auto"
                                    fontSize="1.1rem"
                                >
                                    Trường Đại học công lập đa ngành, đa lĩnh vực, có uy tín và chất lượng đào tạo cao tại khu vực Đồng bằng sông Cửu Long
                                </Typography>

                                {/* University Stats */}
                                <Grid container spacing={4} mb={6} justifyContent="center">
                                    <Grid item xs={6} sm={6} md={3}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                borderRadius: 3,
                                                bgcolor: alpha('#2196F3', 0.1),
                                                border: `2px solid ${alpha('#2196F3', 0.2)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: theme.shadows[8]
                                                }
                                            }}
                                        >
                                            <StudentsIcon sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#2196F3">
                                                25,000+
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Sinh viên
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={3}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                borderRadius: 3,
                                                bgcolor: alpha('#4CAF50', 0.1),
                                                border: `2px solid ${alpha('#4CAF50', 0.2)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: theme.shadows[8]
                                                }
                                            }}
                                        >
                                            <FacultyIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                                                15
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Khoa/Viện
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={3}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                borderRadius: 3,
                                                bgcolor: alpha('#FF9800', 0.1),
                                                border: `2px solid ${alpha('#FF9800', 0.2)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: theme.shadows[8]
                                                }
                                            }}
                                        >
                                            <DepartmentIcon sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#FF9800">
                                                80+
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Chuyên ngành
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={3}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                borderRadius: 3,
                                                bgcolor: alpha('#9C27B0', 0.1),
                                                border: `2px solid ${alpha('#9C27B0', 0.2)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: theme.shadows[8]
                                                }
                                            }}
                                        >
                                            <AwardIcon sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold" color="#9C27B0">
                                                30+
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Năm thành lập
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                {/* University Details */}
                                <Grid container spacing={4} justifyContent="center">
                                    {/* Contact Information */}
                                    <Grid item xs={12} md={6}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                borderRadius: 3,
                                                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: theme.shadows[12]
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 4 }}>
                                                <Typography variant="h5" fontWeight="bold" mb={3} color="primary.main">
                                                    Thông tin liên hệ
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                                    <LocationIcon sx={{ color: 'primary.main', mr: 2, mt: 0.5 }} />
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="medium" mb={0.5}>
                                                            Địa chỉ:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh, Tỉnh Trà Vinh
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                                    <PhoneIcon sx={{ color: 'primary.main', mr: 2 }} />
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="medium" mb={0.5}>
                                                            Điện thoại:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            (0294) 3855 246
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                                    <EmailIcon sx={{ color: 'primary.main', mr: 2 }} />
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="medium" mb={0.5}>
                                                            Email:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            info@tvu.edu.vn
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <WebsiteIcon sx={{ color: 'primary.main', mr: 2 }} />
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="medium" mb={0.5}>
                                                            Website:
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="primary.main"
                                                            sx={{
                                                                cursor: 'pointer',
                                                                '&:hover': { textDecoration: 'underline' }
                                                            }}
                                                        >
                                                            www.tvu.edu.vn
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* University Achievements */}
                                    <Grid item xs={12} md={6}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                borderRadius: 3,
                                                border: `2px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: theme.shadows[12]
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 4 }}>
                                                <Typography variant="h5" fontWeight="bold" mb={3} color="secondary.main">
                                                    Thành tích nổi bật
                                                </Typography>

                                                <Box sx={{ mb: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <StarIcon sx={{ color: '#FFD700', mr: 1 }} />
                                                        <Typography variant="body1" fontWeight="medium">
                                                            Xếp hạng chất lượng đào tạo
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" ml={3}>
                                                        Top 50 trường đại học tốt nhất Việt Nam
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ mb: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <AwardIcon sx={{ color: '#FF9800', mr: 1 }} />
                                                        <Typography variant="body1" fontWeight="medium">
                                                            Kiểm định chất lượng
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" ml={3}>
                                                        Đạt chuẩn kiểm định chất lượng giáo dục cấp cơ sở
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ mb: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <SchoolIcon sx={{ color: '#2196F3', mr: 1 }} />
                                                        <Typography variant="body1" fontWeight="medium">
                                                            Đào tạo đa dạng
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" ml={3}>
                                                        Từ Đại học, Thạc sĩ đến Tiến sĩ trong nhiều lĩnh vực
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <PeopleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                                                        <Typography variant="body1" fontWeight="medium">
                                                            Tỷ lệ việc làm cao
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" ml={3}>
                                                        Hơn 85% sinh viên có việc làm sau tốt nghiệp
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>

                                {/* Student Reviews */}

                            </Box>
                        </Fade>
                    </Container>
                </Box>
            </Box>

            {/* Admin Contact Info Section */}
            <AdminContactInfo />
        </Box >
    );
};

export default Home;