import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Tab,
    Tabs,
    Button,
    TextField
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Article as ArticleIcon,
    Topic as TopicIcon,
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
    Search as SearchIcon,
    Star as StarIcon,
    Event as EventIcon,
    Refresh as RefreshIcon,
    DateRange as DateRangeIcon
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
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
    BarElement,
    RadialLinearScale
} from 'chart.js';
import { Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import axios from 'axios';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

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

const AdminAnalyticsPage = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [timePeriod, setTimePeriod] = useState('last_month');
    const [overviewData, setOverviewData] = useState(null);
    const [ratingData, setRatingData] = useState(null);
    const [topicData, setTopicData] = useState(null);
    const [popularContentData, setPopularContentData] = useState(null);
    const [searchAnalyticsData, setSearchAnalyticsData] = useState(null);
    const [communityData, setCommunityData] = useState(null);
    const [error, setError] = useState(null);
    const [customDateRange, setCustomDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Get auth token
    const getAuthToken = () => {
        const token = localStorage.getItem('token');
        if (token) return token;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token;
    };

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    // Fetch overview data with new API structure
    const fetchOverviewData = async () => {
        try {
            const token = getAuthToken();
            const params = {
                period: timePeriod
            };

            if (timePeriod === 'custom') {
                params.customStartDate = customDateRange[0].startDate.toISOString();
                params.customEndDate = customDateRange[0].endDate.toISOString();
            }

            const response = await axios.get(`${API_BASE_URL}/admin/analytics/overview`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setOverviewData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching overview data:', error);
            setError('Lỗi khi tải dữ liệu tổng quan');
        }
    };

    // Fetch rating analytics data
    const fetchRatingData = async () => {
        try {
            const token = getAuthToken();
            const params = {
                period: timePeriod
            };

            if (timePeriod === 'custom') {
                params.customStartDate = customDateRange[0].startDate.toISOString();
                params.customEndDate = customDateRange[0].endDate.toISOString();
            }

            const response = await axios.get(`${API_BASE_URL}/admin/analytics/ratings`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setRatingData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching rating data:', error);
            setError('Lỗi khi tải dữ liệu đánh giá');
        }
    };

    // Fetch topic analytics data
    const fetchTopicData = async () => {
        try {
            const token = getAuthToken();
            const params = {
                period: timePeriod
            };

            if (timePeriod === 'custom') {
                params.customStartDate = customDateRange[0].startDate.toISOString();
                params.customEndDate = customDateRange[0].endDate.toISOString();
            }

            const response = await axios.get(`${API_BASE_URL}/admin/analytics/topics`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setTopicData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching topic data:', error);
            setError('Lỗi khi tải dữ liệu chủ đề');
        }
    };

    // Fetch popular content data
    const fetchPopularContentData = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/analytics/popular-content`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { days: 30 }
            });

            if (response.data.success) {
                setPopularContentData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching popular content data:', error);
            setError('Lỗi khi tải dữ liệu nội dung phổ biến');
        }
    };

    // Fetch search analytics data
    const fetchSearchAnalyticsData = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/analytics/search-analytics`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { days: 30 }
            });

            if (response.data.success) {
                setSearchAnalyticsData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching search analytics data:', error);
            setError('Lỗi khi tải dữ liệu phân tích tìm kiếm');
        }
    };

    // Fetch community stats data
    const fetchCommunityData = async () => {
        try {
            const token = getAuthToken();
            const params = {
                period: timePeriod
            };

            if (timePeriod === 'custom') {
                params.customStartDate = customDateRange[0].startDate.toISOString();
                params.customEndDate = customDateRange[0].endDate.toISOString();
            }

            const response = await axios.get(`${API_BASE_URL}/admin/analytics/community`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setCommunityData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching community data:', error);
            setError('Lỗi khi tải dữ liệu cộng đồng');
        }
    };

    // Load all data
    const loadAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchOverviewData(),
                fetchRatingData(),
                fetchTopicData(),
                fetchPopularContentData(),
                fetchSearchAnalyticsData(),
                fetchCommunityData()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Effect to load data on component mount and when time period changes
    useEffect(() => {
        loadAllData();
    }, [timePeriod]);

    // Handle time period change
    const handleTimePeriodChange = (event) => {
        setTimePeriod(event.target.value);
        if (event.target.value !== 'custom') {
            setShowDatePicker(false);
        }
    };

    // Handle custom date range change
    const handleDateRangeChange = (ranges) => {
        setCustomDateRange([ranges.selection]);
    };

    // Apply custom date range
    const applyCustomDateRange = () => {
        setShowDatePicker(false);
        loadAllData();
    };

    // Tab change handler
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    // Render overview stats cards
    const renderOverviewCards = () => {
        if (!overviewData) return null;

        const { totals, periodStats, ratingAnalytics } = overviewData;

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <PeopleIcon color="primary" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">{totals.users}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng người dùng
                                    </Typography>
                                    <Typography variant="caption" color="primary">
                                        +{periodStats.users} trong kỳ
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <ArticleIcon color="success" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">{totals.posts}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng bài viết
                                    </Typography>
                                    <Typography variant="caption" color="success">
                                        {totals.featuredPosts} nổi bật
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <TopicIcon color="warning" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">{totals.topics}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng chủ đề
                                    </Typography>
                                    <Typography variant="caption" color="warning">
                                        {totals.featuredTopics} nổi bật
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <StarIcon color="error" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">{totals.ratings}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng đánh giá
                                    </Typography>
                                    <Typography variant="caption" color="error">
                                        {ratingAnalytics.usersWhoRated} người tham gia
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <CommentIcon color="info" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">{totals.comments}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng bình luận
                                    </Typography>
                                    <Typography variant="caption" color="info">
                                        +{periodStats.comments} trong kỳ
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <FavoriteIcon color="secondary" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">{totals.likes}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng lượt thích
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Thống kê đánh giá
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h4" color="primary">
                                        {ratingAnalytics.averageRating?.toFixed(1) || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Điểm trung bình
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6">
                                        {ratingAnalytics.totalRatings}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng đánh giá
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    // Render rating distribution chart
    const renderRatingChart = () => {
        if (!ratingData) return null;

        const chartData = Object.entries(ratingData.ratingDistribution).map(([star, count]) => ({
            star: `${star} sao`,
            count
        }));

        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Phân bố đánh giá theo sao
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="star" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    };

    // Render topic statistics
    const renderTopicStats = () => {
        if (!topicData) return null;

        const { overview, categoryStats, topicsByPosts } = topicData;

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Tổng quan chủ đề
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="h4" color="primary">
                                        {overview.totalTopics}
                                    </Typography>
                                    <Typography variant="body2">Tổng chủ đề</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h4" color="warning">
                                        {overview.featuredTopics}
                                    </Typography>
                                    <Typography variant="body2">Chủ đề nổi bật</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h4" color="success">
                                        {overview.activeTopics}
                                    </Typography>
                                    <Typography variant="body2">Chủ đề hoạt động</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h4" color="info">
                                        {overview.periodTopics}
                                    </Typography>
                                    <Typography variant="body2">Chủ đề trong kỳ</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Thống kê theo danh mục
                            </Typography>
                            <List>
                                {categoryStats.slice(0, 5).map((category, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={category._id || 'Không phân loại'}
                                            secondary={`${category.topicCount} chủ đề, ${category.featuredCount} nổi bật`}
                                        />
                                        <Chip
                                            label={category.totalViews}
                                            size="small"
                                            color="primary"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Top chủ đề theo số bài viết
                            </Typography>
                            <List>
                                {topicsByPosts.slice(0, 10).map((topic, index) => (
                                    <ListItem key={topic._id}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                                                {index + 1}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={topic.name}
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2">
                                                        {topic.description}
                                                    </Typography>
                                                    <Box display="flex" gap={1} mt={1}>
                                                        <Chip
                                                            label={`${topic.postCount} bài viết`}
                                                            size="small"
                                                            color="primary"
                                                        />
                                                        <Chip
                                                            label={`${topic.recentPostCount} gần đây`}
                                                            size="small"
                                                            color="secondary"
                                                        />
                                                        {topic.trending && (
                                                            <Chip
                                                                label="Nổi bật"
                                                                size="small"
                                                                color="warning"
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    // Main render
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Thống kê & Phân tích
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadAllData}
                    disabled={loading}
                >
                    Làm mới
                </Button>
            </Box>

            {/* Time Period Selection */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Khoảng thời gian</InputLabel>
                        <Select
                            value={timePeriod}
                            label="Khoảng thời gian"
                            onChange={handleTimePeriodChange}
                        >
                            <MenuItem value="yesterday">Hôm qua</MenuItem>
                            <MenuItem value="last_week">Tuần trước</MenuItem>
                            <MenuItem value="previous_week">Tuần trước đó</MenuItem>
                            <MenuItem value="last_month">Tháng trước</MenuItem>
                            <MenuItem value="previous_month">Tháng trước đó</MenuItem>
                            <MenuItem value="last_3_months">3 tháng qua</MenuItem>
                            <MenuItem value="last_6_months">6 tháng qua</MenuItem>
                            <MenuItem value="last_year">Năm qua</MenuItem>
                            <MenuItem value="all_time">Tất cả</MenuItem>
                            <MenuItem value="custom">Tùy chọn</MenuItem>
                        </Select>
                    </FormControl>

                    {timePeriod === 'custom' && (
                        <Button
                            variant="outlined"
                            startIcon={<DateRangeIcon />}
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            Chọn ngày
                        </Button>
                    )}
                </Box>

                {/* Custom Date Range Picker */}
                {showDatePicker && timePeriod === 'custom' && (
                    <Box mt={2}>
                        <DateRangePicker
                            ranges={customDateRange}
                            onChange={handleDateRangeChange}
                            showSelectionPreview={true}
                            moveRangeOnFirstSelection={false}
                            months={2}
                            direction="horizontal"
                        />
                        <Box mt={2}>
                            <Button
                                variant="contained"
                                onClick={applyCustomDateRange}
                                sx={{ mr: 1 }}
                            >
                                Áp dụng
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setShowDatePicker(false)}
                            >
                                Hủy
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Loading Indicator */}
            {loading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Tổng quan" />
                    <Tab label="Thống kê đánh giá" />
                    <Tab label="Thống kê chủ đề" />
                    <Tab label="Cộng đồng" />
                    <Tab label="Nội dung phổ biến" />
                    <Tab label="Tìm kiếm" />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            {selectedTab === 0 && (
                <Box>
                    {renderOverviewCards()}
                </Box>
            )}

            {selectedTab === 1 && (
                <Box>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            {renderRatingChart()}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            {ratingData && (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Top người đánh giá
                                        </Typography>
                                        <List>
                                            {ratingData.topRaters?.slice(0, 5).map((rater, index) => (
                                                <ListItem key={rater._id}>
                                                    <ListItemAvatar>
                                                        <Avatar>{index + 1}</Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={rater.username}
                                                        secondary={`${rater.ratingCount} đánh giá`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            )}

            {selectedTab === 2 && (
                <Box>
                    {renderTopicStats()}
                </Box>
            )}

            {/* Add other tab contents here */}
        </Container>
    );
};

export default AdminAnalyticsPage;
