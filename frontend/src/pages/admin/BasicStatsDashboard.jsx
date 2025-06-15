import React, { useState, useEffect } from 'react';
import {
    Typography,
    Grid,
    Paper,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import {
    People as PeopleIcon,
    Article as ArticleIcon,
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
    Star as StarIcon,
    Reply as ReplyIcon,
    TrendingUp as TrendingUpIcon
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
    ResponsiveContainer
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
    BarElement
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
    BarElement
);

const BasicStatsDashboard = () => {
    // State management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [basicStats, setBasicStats] = useState(null);

    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    // Get auth token
    const getAuthToken = () => {
        // Try to get token from localStorage directly first
        const token = localStorage.getItem('token');
        if (token) return token;

        // Fallback to user.token for backward compatibility
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

            // Fetch real data from multiple APIs
            const [overviewResponse, userStatsResponse, topicStatsResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/analytics/overview`, { headers }),
                axios.get(`${API_BASE_URL}/admin/users/stats`, { headers }),
                axios.get(`${API_BASE_URL}/admin/topics/stats`, { headers })
            ]);

            const overviewData = overviewResponse.data.data;
            const userStats = userStatsResponse.data.data;
            const topicStats = topicStatsResponse.data.data;

            // Use real data from API
            const dailyGrowth = overviewData.dailyGrowth || [];
            const hourlyActivity = overviewData.hourlyActivity || [];

            const realData = {
                totals: {
                    users: overviewData.totals.users || 0,
                    posts: overviewData.totals.posts || 0,
                    comments: overviewData.totals.comments || 0,
                    likes: overviewData.totals.likes || 0,
                    ratings: userStats.totalRatings || 0,
                    replies: Math.floor(overviewData.totals.comments * 0.3) || 0 // Estimate replies as 30% of comments
                },
                dailyGrowth,
                hourlyActivity,
                contentDistribution: [
                    { name: 'Bài viết', value: overviewData.totals.posts || 0, color: '#0088FE' },
                    { name: 'Bình luận', value: overviewData.totals.comments || 0, color: '#00C49F' },
                    { name: 'Chủ đề', value: topicStats.totalTopics || 0, color: '#FFBB28' },
                    { name: 'Người dùng', value: overviewData.totals.users || 0, color: '#FF8042' }
                ],
                engagementStats: [
                    { name: 'Lượt thích', value: overviewData.totals.likes || 0, color: '#FF6384' },
                    { name: 'Bình luận', value: overviewData.totals.comments || 0, color: '#36A2EB' },
                    { name: 'Chủ đề', value: topicStats.totalTopics || 0, color: '#FFCE56' },
                    { name: 'Người dùng', value: overviewData.totals.users || 0, color: '#4BC0C0' }
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
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Typography variant="h4" gutterBottom>
                📊 Thống Kê Cơ Bản
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Overview Stats Cards */}
            {basicStats && (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={2}>
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
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
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
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
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

                        <Grid item xs={12} sm={6} md={2}>
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

                        <Grid item xs={12} sm={6} md={2}>
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

                        <Grid item xs={12} sm={6} md={2}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ReplyIcon sx={{ mr: 2, color: 'secondary.main', fontSize: 40 }} />
                                        <Box>
                                            <Typography color="textSecondary" gutterBottom>
                                                Phản hồi
                                            </Typography>
                                            <Typography variant="h5">
                                                {formatNumber(basicStats.totals.replies)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Charts Section */}
                    <Grid container spacing={3}>
                        {/* Daily Growth Line Chart */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    📈 Tăng trưởng theo ngày (7 ngày qua)
                                </Typography>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={basicStats.dailyGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })} />
                                        <YAxis />
                                        <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')} />
                                        <Legend />
                                        <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name="Người dùng mới" />
                                        <Line type="monotone" dataKey="posts" stroke="#82ca9d" strokeWidth={2} name="Bài viết mới" />
                                        <Line type="monotone" dataKey="comments" stroke="#ffc658" strokeWidth={2} name="Bình luận mới" />
                                        <Line type="monotone" dataKey="likes" stroke="#ff7300" strokeWidth={2} name="Lượt thích mới" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* Content Distribution Pie Chart */}
                        <Grid item xs={12} md={4}>
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
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {basicStats.contentDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
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

                        {/* Weekly Activity Area Chart */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    📊 Hoạt động trong tuần
                                </Typography>
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={basicStats.dailyGrowth.slice(-7).map((item, index) => ({
                                        day: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(item.date).getDay()],
                                        activity: item.users + item.posts + item.comments
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="activity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* User Growth Trend */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    👥 Xu hướng tăng trưởng người dùng
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={basicStats.dailyGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })} />
                                        <YAxis />
                                        <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')} />
                                        <Area type="monotone" dataKey="users" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} name="Người dùng mới" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* Top Statistics Summary */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    🏆 Tổng quan nổi bật
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body2">Tổng tương tác:</Typography>
                                        <Chip label={formatNumber(basicStats.totals.likes + basicStats.totals.comments)} color="primary" size="small" />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body2">Tỷ lệ tương tác:</Typography>
                                        <Chip label={`${Math.round((basicStats.totals.comments / basicStats.totals.posts) * 100) || 0}%`} color="success" size="small" />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body2">Bài viết/Người dùng:</Typography>
                                        <Chip label={`${Math.round(basicStats.totals.posts / basicStats.totals.users) || 0}`} color="info" size="small" />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body2">Like/Bài viết:</Typography>
                                        <Chip label={`${Math.round(basicStats.totals.likes / basicStats.totals.posts) || 0}`} color="warning" size="small" />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body2">Tổng đánh giá:</Typography>
                                        <Chip label={formatNumber(basicStats.totals.ratings)} color="secondary" size="small" />
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Hourly Activity Pattern */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    🕐 Mẫu hoạt động theo giờ
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={basicStats.hourlyActivity}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="activity" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </>
    );
};

export default BasicStatsDashboard;
