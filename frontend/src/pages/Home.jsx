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
import ThreeColumnLayout from '../components/ThreeColumnLayout';
import TopicGrid from '../components/TopicGrid';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';

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
    const [posts, setPosts] = useState([]);
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

                // Fetch all topics for search
                try {
                    const topicsRes = await axios.get('http://localhost:5000/api/topics/all');
                    setTopics(topicsRes.data);
                } catch (error) {
                    console.log('Topics API not available');
                }

                // Fetch recent posts for backward compatibility
                try {
                    const postsRes = await axios.get('http://localhost:5000/api/home/recent-posts?limit=6');
                    if (postsRes.data.success) {
                        setPosts(postsRes.data.data);
                    } else {
                        setPosts(mockPosts);
                    }
                } catch (error) {
                    console.log('Recent posts API not available, using mock data');
                    setPosts(mockPosts);
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

    // Mock data for posts
    const mockPosts = [
        {
            _id: "1",
            title: 'Làm sao để học tốt kỳ này và không bị stress?',
            author: { fullName: 'Nguyễn Văn A', avatarUrl: 'https://i.pravatar.cc/40?img=1' },
            createdAt: '2024-01-15T10:30:00Z',
            views: 245,
            comments: 18,
            likes: 32,
            image: 'https://picsum.photos/400/250?random=1',
            excerpt: 'Chia sẻ những phương pháp học tập hiệu quả và cách quản lý stress trong học tập...',
            topic: { name: 'Học tập', color: '#2196F3' },
            type: 'question'
        },
        {
            _id: "2",
            title: 'Top 5 địa điểm giải trí "chill" nhất Trà Vinh!',
            author: { fullName: 'Trần Thị B', avatarUrl: 'https://i.pravatar.cc/40?img=2' },
            createdAt: '2024-01-14T15:20:00Z',
            views: 189,
            comments: 25,
            likes: 47,
            image: 'https://picsum.photos/400/250?random=2',
            excerpt: 'Khám phá những địa điểm thú vị và phù hợp với sinh viên tại Trà Vinh...',
            topic: { name: 'Đời sống', color: '#FF9800' },
            type: 'discussion'
        },
        {
            _id: "3",
            title: 'Sự kiện chào tân sinh viên 2024: Đừng bỏ lỡ!',
            author: { fullName: 'Phạm Văn F', avatarUrl: 'https://i.pravatar.cc/40?img=6' },
            createdAt: '2024-01-10T16:00:00Z',
            views: 567,
            comments: 45,
            likes: 89,
            image: 'https://picsum.photos/400/250?random=6',
            excerpt: 'Thông tin chi tiết về sự kiện chào đón tân sinh viên và các hoạt động thú vị...',
            topic: { name: 'Sự kiện', color: '#F44336' },
            type: 'event'
        },
        {
            _id: "4",
            title: 'Kinh nghiệm tìm kiếm việc làm thêm cho sinh viên',
            author: { fullName: 'Phạm Thị D', avatarUrl: 'https://i.pravatar.cc/40?img=4' },
            createdAt: '2024-01-12T14:45:00Z',
            views: 298,
            comments: 34,
            likes: 56,
            image: 'https://picsum.photos/400/250?random=4',
            excerpt: 'Chia sẻ kinh nghiệm và mẹo hay để tìm được công việc part-time phù hợp...',
            topic: { name: 'Việc làm', color: '#9C27B0' },
            type: 'job'
        },
        {
            _id: "5",
            title: 'Hướng dẫn làm đồ án cuối kỳ từ A đến Z',
            author: { fullName: 'Võ Thị E', avatarUrl: 'https://i.pravatar.cc/40?img=5' },
            createdAt: '2024-01-11T11:30:00Z',
            views: 412,
            comments: 28,
            likes: 73,
            image: 'https://picsum.photos/400/250?random=5',
            excerpt: 'Quy trình chi tiết và những lưu ý quan trọng khi thực hiện đồ án cuối kỳ...',
            topic: { name: 'Học tập', color: '#2196F3' },
            type: 'discussion'
        },
        {
            _id: "6",
            title: 'Tin tức mới về học bổng 2024',
            author: { fullName: 'Tin Tức', avatarUrl: 'https://i.pravatar.cc/40?img=7' },
            createdAt: '2024-01-09T09:00:00Z',
            views: 120,
            comments: 10,
            likes: 15,
            image: 'https://picsum.photos/400/250?random=7',
            excerpt: 'Thông báo học bổng mới nhất dành cho sinh viên...',
            topic: { name: 'Tin tức', color: '#00BCD4' },
            type: 'news'
        }
    ];

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
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

    // Lọc bài viết theo loại
    const questionPosts = posts.filter(post => post.type === "question");
    const eventPosts = posts.filter(post => post.type === "event");
    const jobPosts = posts.filter(post => post.type === "job");
    const discussionPosts = posts.filter(post => post.type === "discussion");
    const newsPosts = posts.filter(post => post.type === "news");

    // Giả sử bạn có component PostCard, thay thế bằng Card hoặc Box nếu chưa có
    const renderPosts = (postList) =>
        postList.length === 0 ? (
            <Typography variant="body2" sx={{ ml: 2, color: "text.secondary" }}>Chưa có bài viết.</Typography>
        ) : (
            postList.map(post => (
                <Grid item xs={12} sm={6} md={4} key={post._id}>
                    {/* <PostCard post={post} /> */}
                    <Box sx={{
                        border: "1px solid #eee",
                        borderRadius: 2,
                        p: 2,
                        background: mode === "dark" ? "#23272f" : "#fff"
                    }}>
                        <Typography variant="subtitle1" fontWeight="bold">{post.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{post.author?.fullName || post.authorId?.fullName || 'Ẩn danh'} • {new Date(post.createdAt).toLocaleDateString()}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>{post.excerpt}</Typography>
                    </Box>
                </Grid>
            ))
        );

    return (
        <Box>
            {/* Global Breadcrumb Navigation - Only show "Trang chủ" */}
            <BreadcrumbNavigation
                darkMode={isDarkMode}
            />

            <Box sx={{ maxWidth: 1200, mx: "auto", pt: 4 }}>
                {/* Hero Section */}
                <HeroSection visible={visibleSections.hero} />

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
                                        gap: 3,
                                        overflowX: 'auto',
                                        pb: 2,
                                        justifyContent: featuredPosts.length <= 3 ? 'center' : 'flex-start',
                                        '&::-webkit-scrollbar': {
                                            height: 8,
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                            borderRadius: 4,
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: 'primary.main',
                                            borderRadius: 4,
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                        },
                                    }}
                                >
                                    {featuredPosts.map((post, index) => (
                                        <Zoom in={visibleSections.featured} timeout={600 + index * 100} key={post._id || post.id}>
                                            <Card
                                                sx={{
                                                    minWidth: 350,
                                                    maxWidth: 350,
                                                    height: 'auto',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: 3,
                                                    overflow: 'hidden',
                                                    transition: 'all 0.3s ease',
                                                    flexShrink: 0,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: theme.shadows[20]
                                                    }
                                                }}
                                                onClick={() => handlePostClick(post)}
                                            >
                                                {(post.thumbnailImage || post.images?.[0] || post.image) && (
                                                    <CardMedia
                                                        component="img"
                                                        height="180"
                                                        image={post.thumbnailImage || post.images?.[0] || post.image}
                                                        alt={post.title}
                                                        sx={{
                                                            objectFit: 'cover',
                                                            transition: 'transform 0.3s ease',
                                                            '&:hover': { transform: 'scale(1.05)' }
                                                        }}
                                                    />
                                                )}
                                                {!(post.thumbnailImage || post.images?.[0] || post.image) && (
                                                    <Box
                                                        sx={{
                                                            height: 180,
                                                            bgcolor: 'grey.200',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'grey.500'
                                                        }}
                                                    >
                                                        <Typography variant="body2">
                                                            Không có ảnh
                                                        </Typography>
                                                    </Box>
                                                )}
                                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Chip
                                                            label={post.topicInfo?.name || post.topic?.name || post.topicId?.name || 'Chưa phân loại'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha(post.topicInfo?.color || post.topic?.color || post.topicId?.color || '#2196F3', 0.1),
                                                                color: post.topicInfo?.color || post.topic?.color || post.topicId?.color || '#2196F3',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Box>

                                                    <Typography
                                                        variant="h6"
                                                        component="h3"
                                                        mb={2}
                                                        fontWeight="bold"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {post.title}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        mb={3}
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {post.excerpt}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Avatar
                                                            src={post.authorInfo?.avatarUrl || post.author?.avatarUrl || post.authorId?.avatarUrl}
                                                            sx={{ width: 32, height: 32, mr: 1 }}
                                                        >
                                                            {(post.authorInfo?.fullName || post.author?.fullName || post.authorId?.fullName || 'A').charAt(0)}
                                                        </Avatar>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {post.authorInfo?.fullName || post.author?.fullName || post.authorId?.fullName || 'Ẩn danh'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatDate(post.createdAt)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatNumber(post.views || 0)}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {post.commentCount || post.comments || 0}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <FavoriteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {post.likeCount || post.likes || 0}
                                                            </Typography>
                                                        </Box>
                                                        {post.featured && (
                                                            <Chip
                                                                label="⭐ Nổi bật"
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: alpha('#FFD700', 0.1),
                                                                    color: '#FF8F00',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem'
                                                                }}
                                                            />
                                                        )}
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
                                        <Grid item xs={12} sm={6} md={4} lg={2.4} key={topic._id || topic.id}>
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

                            <Box maxWidth={600} mx="auto" mb={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Tìm kiếm chủ đề..."
                                    variant="outlined"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
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
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            boxShadow: theme.shadows[4]
                                        }
                                    }}
                                />
                            </Box>

                            <Box display="flex" justifyContent="center">
                                <TopicGrid
                                    topics={filteredTopics}
                                    isDarkMode={isDarkMode}
                                    visible={visibleSections.topics}
                                    variant="compact"
                                    maxItems={8}
                                    columns={{ xs: 6, sm: 4, md: 3, lg: 3 }}
                                />
                            </Box>
                        </Box>
                    </Fade>
                </Container>

                {/* Three Column Layout - Detailed Topics View */}
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
                                Khám phá chi tiết
                            </Typography>
                            <Typography
                                variant="body1"
                                textAlign="center"
                                color="text.secondary"
                                mb={4}
                                maxWidth="600px"
                                mx="auto"
                            >
                                Duyệt qua tất cả chủ đề với giao diện chi tiết và đầy đủ thông tin
                            </Typography>

                            <Box display="flex" justifyContent="center">
                                <ThreeColumnLayout
                                    filteredTopics={filteredTopics}
                                    trendingTopics={trendingTopics}
                                    isDarkMode={isDarkMode}
                                />
                            </Box>
                        </Box>
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
                                <Box sx={{ mt: 6 }}>
                                    <Typography
                                        variant="h4"
                                        component="h3"
                                        textAlign="center"
                                        mb={4}
                                        fontWeight="bold"
                                        color="text.primary"
                                    >
                                        Đánh giá từ sinh viên
                                    </Typography>

                                    <Grid container spacing={3} justifyContent="center">
                                        <Grid item xs={12} md={4}>
                                            <Card
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    border: `2px solid ${alpha('#4CAF50', 0.2)}`,
                                                    bgcolor: alpha('#4CAF50', 0.05),
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-5px)',
                                                        boxShadow: theme.shadows[8]
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', mb: 2 }}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon key={star} sx={{ color: '#FFD700', fontSize: 20 }} />
                                                    ))}
                                                </Box>
                                                <Typography variant="body1" mb={2} fontStyle="italic">
                                                    "Môi trường học tập tuyệt vời, giảng viên nhiệt tình. Cơ sở vật chất hiện đại, thư viện phong phú."
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#4CAF50' }}>
                                                        N
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            Nguyễn Văn An
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Khoa Công nghệ Thông tin
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Card
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    border: `2px solid ${alpha('#2196F3', 0.2)}`,
                                                    bgcolor: alpha('#2196F3', 0.05),
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-5px)',
                                                        boxShadow: theme.shadows[8]
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', mb: 2 }}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon key={star} sx={{ color: '#FFD700', fontSize: 20 }} />
                                                    ))}
                                                </Box>
                                                <Typography variant="body1" mb={2} fontStyle="italic">
                                                    "Chương trình đào tạo cập nhật, thực tế. Nhiều cơ hội thực tập và làm việc tại các doanh nghiệp lớn."
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#2196F3' }}>
                                                        T
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            Trần Thị Bình
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Khoa Kinh tế
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Card
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    border: `2px solid ${alpha('#FF9800', 0.2)}`,
                                                    bgcolor: alpha('#FF9800', 0.05),
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-5px)',
                                                        boxShadow: theme.shadows[8]
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', mb: 2 }}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon key={star} sx={{ color: '#FFD700', fontSize: 20 }} />
                                                    ))}
                                                </Box>
                                                <Typography variant="body1" mb={2} fontStyle="italic">
                                                    "Hoạt động ngoại khóa phong phú, đời sống sinh viên sôi động. Rất nhiều câu lạc bộ và tổ chức."
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#FF9800' }}>
                                                        L
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            Lê Văn Cường
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Khoa Sư phạm
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Fade>
                    </Container>
                </Box>
            </Box>
        </Box >
    );
};

export default Home;