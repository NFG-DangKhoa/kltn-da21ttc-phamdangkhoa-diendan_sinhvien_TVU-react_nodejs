import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import {
    Typography,
    Grid,
    Paper,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Container
} from '@mui/material';
import {
    People as PeopleIcon,
    Article as ArticleIcon,
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
    Star as StarIcon,
    Reply as ReplyIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
    Topic as TopicIcon,
    HowToVote as HowToVoteIcon
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    ArcElement,
    BarElement,
    RadialLinearScale
} from 'chart.js';
import { Doughnut, PolarArea } from 'react-chartjs-2';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    ChartLegend,
    ArcElement,
    BarElement,
    RadialLinearScale
);

const BasicStatsDashboard = () => {
    const navigate = useNavigate(); // Instantiate useNavigate
    // State management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [basicStats, setBasicStats] = useState(null);
    const [timePeriod, setTimePeriod] = useState('last_month');

    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    // Get auth token
    const getAuthToken = () => {
        const token = localStorage.getItem('token');
        if (token) return token;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token;
    };

    // Format number with K, M suffix
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Fetch basic statistics
    const fetchBasicStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getAuthToken();
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const [overviewResponse, ratingsResponse, topicsResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/analytics/overview?period=${timePeriod}`, { headers }),
                axios.get(`${API_BASE_URL}/admin/analytics/ratings?period=${timePeriod}`, { headers }),
                axios.get(`${API_BASE_URL}/admin/analytics/topics?period=${timePeriod}`, { headers })
            ]);

            const overviewData = overviewResponse.data.data;
            const ratingsData = ratingsResponse.data.data;
            const topicsData = topicsResponse.data.data;

            // Tính toán số người đánh giá duy nhất từ ratingAnalytics
            const uniqueRaters = overviewData.ratingAnalytics?.usersWhoRated || 0;

            const realData = {
                totals: {
                    users: overviewData.totals.users || 0,
                    posts: overviewData.totals.posts || 0,
                    comments: overviewData.totals.comments || 0,
                    likes: overviewData.totals.likes || 0,
                    ratings: overviewData.totals.ratings || 0,
                    totalTopics: overviewData.totals.topics || 0,
                    featuredTopics: overviewData.totals.featuredTopics || 0,
                    featuredPosts: overviewData.totals.featuredPosts || 0,
                    uniqueRaters: uniqueRaters,
                },
                periodStats: {
                    users: overviewData.periodStats?.users || 0,
                    posts: overviewData.periodStats?.posts || 0,
                    comments: overviewData.periodStats?.comments || 0,
                    ratings: overviewData.periodStats?.ratings || 0,
                },
                contentDistribution: [
                    { name: 'Bài viết', value: overviewData.totals.posts || 0, color: '#0088FE' },
                    { name: 'Bình luận', value: overviewData.totals.comments || 0, color: '#00C49F' },
                    { name: 'Chủ đề', value: overviewData.totals.topics || 0, color: '#FFBB28' },
                    { name: 'Người dùng', value: overviewData.totals.users || 0, color: '#FF8042' }
                ],
                engagementStats: [
                    { name: 'Lượt thích', value: overviewData.totals.likes || 0, color: '#FF6384' },
                    { name: 'Bình luận', value: overviewData.totals.comments || 0, color: '#36A2EB' },
                    { name: 'Đánh giá', value: overviewData.totals.ratings || 0, color: '#FFCE56' },
                ],
                ratingDistribution: overviewData.ratingAnalytics?.ratingDistribution ?
                    Object.entries(overviewData.ratingAnalytics.ratingDistribution).map(([star, count]) => ({
                        name: `${star} sao`,
                        value: count,
                        color: COLORS[parseInt(star) - 1]
                    })) : [],
                topicsByCategory: topicsData.categoryStats?.slice(0, 5).map((cat, index) => ({
                    name: cat._id || 'Khác',
                    value: cat.topicCount,
                    color: COLORS[index % COLORS.length]
                })) || [],
                featuredContent: [
                    { name: 'Bài viết nổi bật', value: overviewData.totals.featuredPosts || 0, color: '#8884D8' },
                    { name: 'Chủ đề nổi bật', value: overviewData.totals.featuredTopics || 0, color: '#82CA9D' },
                    { name: 'Bài viết thường', value: (overviewData.totals.posts || 0) - (overviewData.totals.featuredPosts || 0), color: '#FFC658' },
                    { name: 'Chủ đề thường', value: (overviewData.totals.topics || 0) - (overviewData.totals.featuredTopics || 0), color: '#FF7C7C' }
                ]
            };

            setBasicStats(realData);
        } catch (error) {
            console.error('Error fetching basic stats:', error);
            setError('Lỗi khi tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        fetchBasicStats();
    }, [timePeriod]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const StatCard = ({ onClick, children }) => (
        <Box
            onClick={onClick}
            sx={{
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': {
                    transform: onClick ? 'scale(1.03)' : 'none',
                    boxShadow: onClick ? 6 : 1,
                },
                transition: 'transform 0.2s, box-shadow 0.2s',
                height: '100%'
            }}
        >
            {children}
        </Box>
    );

    const periodStatsData = basicStats ? [
        { name: 'Người dùng mới', value: basicStats.periodStats.users, color: '#4CAF50' },
        { name: 'Bài viết mới', value: basicStats.periodStats.posts, color: '#2196F3' },
        { name: 'Bình luận mới', value: basicStats.periodStats.comments, color: '#FFC107' },
        { name: 'Đánh giá mới', value: basicStats.periodStats.ratings, color: '#F44336' },
    ] : [];

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', p: 3 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
                    📊 Thống Kê Cơ Bản
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', mb: 3, gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Thời gian</InputLabel>
                        <Select
                            value={timePeriod}
                            label="Thời gian"
                            onChange={(e) => setTimePeriod(e.target.value)}
                        >
                            <MenuItem value={'yesterday'}>Hôm qua</MenuItem>
                            <MenuItem value={'last_week'}>Tuần trước</MenuItem>
                            <MenuItem value={'last_month'}>Tháng trước</MenuItem>
                            <MenuItem value={'last_3_months'}>3 tháng qua</MenuItem>
                            <MenuItem value={'last_6_months'}>6 tháng qua</MenuItem>
                            <MenuItem value={'last_year'}>Năm qua</MenuItem>
                            <MenuItem value={'all_time'}>Tất cả</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchBasicStats}
                        disabled={loading}
                    >
                        Làm mới
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Overview Stats Cards */}
                {basicStats && (
                    <>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={1.5}>
                                <StatCard onClick={() => navigate('/admin/users')}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <PeopleIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                                                <Box>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        Người dùng
                                                    </Typography>
                                                    <Typography variant="h5">
                                                        {formatNumber(basicStats.totals.users)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </StatCard>
                            </Grid>

                            <Grid item xs={12} sm={6} md={1.5}>
                                <StatCard onClick={() => navigate('/admin/posts')}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ArticleIcon sx={{ mr: 2, color: 'info.main', fontSize: 40 }} />
                                                <Box>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        Bài viết
                                                    </Typography>
                                                    <Typography variant="h5">
                                                        {formatNumber(basicStats.totals.posts)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </StatCard>
                            </Grid>

                            <Grid item xs={12} sm={6} md={1.5}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CommentIcon sx={{ mr: 2, color: 'warning.main', fontSize: 40 }} />
                                            <Box>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Bình luận
                                                </Typography>
                                                <Typography variant="h5">
                                                    {formatNumber(basicStats.totals.comments)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} md={1.5}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <FavoriteIcon sx={{ mr: 2, color: 'error.main', fontSize: 40 }} />
                                            <Box>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Lượt thích
                                                </Typography>
                                                <Typography variant="h5">
                                                    {formatNumber(basicStats.totals.likes)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} md={1.5}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <StarIcon sx={{ mr: 2, color: 'success.main', fontSize: 40 }} />
                                            <Box>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Đánh giá
                                                </Typography>
                                                <Typography variant="h5">
                                                    {formatNumber(basicStats.totals.ratings)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} md={1.5}>
                                <StatCard onClick={() => navigate('/admin/topics')}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <TopicIcon sx={{ mr: 2, color: 'primary.dark', fontSize: 40 }} />
                                                <Box>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        Tổng chủ đề
                                                    </Typography>
                                                    <Typography variant="h5">
                                                        {formatNumber(basicStats.totals.totalTopics)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </StatCard>
                            </Grid>

                            <Grid item xs={12} sm={6} md={1.5}>
                                <StatCard onClick={() => navigate('/admin/featured')}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <StarIcon sx={{ mr: 2, color: 'warning.dark', fontSize: 40 }} />
                                                <Box>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        Chủ đề nổi bật
                                                    </Typography>
                                                    <Typography variant="h5">
                                                        {formatNumber(basicStats.totals.featuredTopics)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </StatCard>
                            </Grid>

                            <Grid item xs={12} sm={6} md={1.5}>
                                <StatCard onClick={() => navigate('/admin/featured')}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ArticleIcon sx={{ mr: 2, color: 'info.dark', fontSize: 40 }} />
                                                <Box>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        Bài viết nổi bật
                                                    </Typography>
                                                    <Typography variant="h5">
                                                        {formatNumber(basicStats.totals.featuredPosts)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </StatCard>
                            </Grid>

                            <Grid item xs={12} sm={6} md={1.5}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <HowToVoteIcon sx={{ mr: 2, color: 'secondary.dark', fontSize: 40 }} />
                                            <Box>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Người đánh giá
                                                </Typography>
                                                <Typography variant="h5">
                                                    {formatNumber(basicStats.totals.uniqueRaters)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Charts Section */}
                        <Grid container spacing={3}>
                            {/* Content Distribution Pie Chart */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        🥧 Phân bố nội dung
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={basicStats.contentDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {basicStats.contentDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/* Engagement Stats Doughnut Chart */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        🍩 Thống kê tương tác
                                    </Typography>
                                    <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Doughnut
                                            data={{
                                                labels: basicStats.engagementStats.map(item => item.name),
                                                datasets: [{
                                                    data: basicStats.engagementStats.map(item => item.value),
                                                    backgroundColor: basicStats.engagementStats.map(item => item.color),
                                                    borderWidth: 2,
                                                    borderColor: '#fff',
                                                    hoverBorderWidth: 3,
                                                    hoverBorderColor: '#fff'
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: {
                                                            padding: 20,
                                                            usePointStyle: true
                                                        }
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function (context) {
                                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Rating Distribution Chart */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        ⭐ Phân bố đánh giá
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={basicStats.ratingDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#8884d8">
                                                {basicStats.ratingDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/* Featured Content Comparison */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        🌟 So sánh nội dung nổi bật
                                    </Typography>
                                    <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <PolarArea
                                            data={{
                                                labels: basicStats.featuredContent.map(item => item.name),
                                                datasets: [{
                                                    data: basicStats.featuredContent.map(item => item.value),
                                                    backgroundColor: basicStats.featuredContent.map(item => item.color),
                                                    borderWidth: 2,
                                                    borderColor: '#fff'
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: {
                                                            padding: 15,
                                                            usePointStyle: true
                                                        }
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function (context) {
                                                                return `${context.label}: ${context.parsed}`;
                                                            }
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    r: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Period Stats Bar Chart */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        📊 Hoạt động theo thời gian
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={periodStatsData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value">
                                                {periodStatsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/* Summary Statistics */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        📈 Tóm tắt thống kê
                                    </Typography>
                                    <Box sx={{ height: 350 }}>
                                        <Grid container spacing={2} sx={{ height: '100%' }}>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    p: 2,
                                                    bgcolor: 'primary.light',
                                                    borderRadius: 2,
                                                    height: '45%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <Typography variant="h4" color="primary.contrastText">
                                                        {formatNumber(basicStats.totals.posts + basicStats.totals.comments)}
                                                    </Typography>
                                                    <Typography variant="body2" color="primary.contrastText">
                                                        Tổng nội dung
                                                    </Typography>
                                                    <Typography variant="caption" color="primary.contrastText" sx={{ mt: 1 }}>
                                                        (Bài viết + Bình luận)
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    p: 2,
                                                    bgcolor: 'success.light',
                                                    borderRadius: 2,
                                                    height: '45%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <Typography variant="h4" color="success.contrastText">
                                                        {formatNumber(basicStats.totals.comments + basicStats.totals.likes + basicStats.totals.ratings)}
                                                    </Typography>
                                                    <Typography variant="body2" color="success.contrastText">
                                                        Tổng tương tác
                                                    </Typography>
                                                    <Typography variant="caption" color="success.contrastText" sx={{ mt: 1 }}>
                                                        (Bình luận + Thích + Đánh giá)
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    p: 2,
                                                    bgcolor: 'warning.light',
                                                    borderRadius: 2,
                                                    height: '45%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <Typography variant="h4" color="warning.contrastText">
                                                        {((basicStats.totals.featuredPosts + basicStats.totals.featuredTopics) /
                                                            (basicStats.totals.posts + basicStats.totals.totalTopics) * 100).toFixed(1)}%
                                                    </Typography>
                                                    <Typography variant="body2" color="warning.contrastText">
                                                        Tỷ lệ nổi bật
                                                    </Typography>
                                                    <Typography variant="caption" color="warning.contrastText" sx={{ mt: 1 }}>
                                                        (Nổi bật / Tổng)
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    p: 2,
                                                    bgcolor: 'info.light',
                                                    borderRadius: 2,
                                                    height: '45%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <Typography variant="h4" color="info.contrastText">
                                                        {basicStats.totals.ratings > 0 ?
                                                            (basicStats.totals.ratings / basicStats.totals.uniqueRaters).toFixed(1) : '0'}
                                                    </Typography>
                                                    <Typography variant="body2" color="info.contrastText">
                                                        Đánh giá/người
                                                    </Typography>
                                                    <Typography variant="caption" color="info.contrastText" sx={{ mt: 1 }}>
                                                        (Đánh giá / Người đánh giá)
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default BasicStatsDashboard;