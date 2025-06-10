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
    Button
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Article as ArticleIcon,
    Topic as TopicIcon,
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Schedule as ScheduleIcon,
    Refresh as RefreshIcon
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
import axios from 'axios';

const AdminAnalyticsPage = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [timePeriod, setTimePeriod] = useState(30);
    const [overviewData, setOverviewData] = useState(null);
    const [userActivityData, setUserActivityData] = useState(null);
    const [popularContentData, setPopularContentData] = useState(null);
    const [searchAnalyticsData, setSearchAnalyticsData] = useState(null);
    const [growthTrendsData, setGrowthTrendsData] = useState(null);
    const [error, setError] = useState(null);

    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Get auth token
    const getAuthToken = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token;
    };

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    // Fetch overview data
    const fetchOverviewData = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/analytics/overview`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { days: timePeriod }
            });

            if (response.data.success) {
                setOverviewData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching overview data:', error);
            setError('Lỗi khi tải dữ liệu tổng quan');
        }
    };

    // Fetch user activity data
    const fetchUserActivityData = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/analytics/user-activity`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { days: timePeriod }
            });

            if (response.data.success) {
                setUserActivityData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching user activity data:', error);
            setError('Lỗi khi tải dữ liệu hoạt động người dùng');
        }
    };

    // Fetch popular content data
    const fetchPopularContentData = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/analytics/popular-content`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { days: timePeriod }
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
                params: { days: timePeriod }
            });

            if (response.data.success) {
                setSearchAnalyticsData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching search analytics data:', error);
            setError('Lỗi khi tải dữ liệu phân tích tìm kiếm');
        }
    };

    // Fetch growth trends data
    const fetchGrowthTrendsData = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/analytics/growth-trends`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { days: timePeriod }
            });

            if (response.data.success) {
                setGrowthTrendsData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching growth trends data:', error);
            setError('Lỗi khi tải dữ liệu xu hướng tăng trưởng');
        }
    };

    // Fetch all data
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);

        try {
            await Promise.all([
                fetchOverviewData(),
                fetchUserActivityData(),
                fetchPopularContentData(),
                fetchSearchAnalyticsData(),
                fetchGrowthTrendsData()
            ]);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            setError('Lỗi khi tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
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

    // Format date for charts
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    // Handle time period change
    const handleTimePeriodChange = (event) => {
        setTimePeriod(event.target.value);
    };

    // Effects
    useEffect(() => {
        fetchAllData();
    }, [timePeriod]);

    // Tab panel component
    const TabPanel = ({ children, value, index, ...other }) => (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`analytics-tabpanel-${index}`}
            aria-labelledby={`analytics-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );

    if (loading && !overviewData) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Thống kê và Phân tích
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Thời gian</InputLabel>
                        <Select
                            value={timePeriod}
                            label="Thời gian"
                            onChange={handleTimePeriodChange}
                        >
                            <MenuItem value={7}>7 ngày</MenuItem>
                            <MenuItem value={30}>30 ngày</MenuItem>
                            <MenuItem value={90}>90 ngày</MenuItem>
                            <MenuItem value={365}>1 năm</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchAllData}
                        disabled={loading}
                    >
                        Làm mới
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Overview Stats Cards */}
            {overviewData && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PeopleIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Người dùng
                                        </Typography>
                                        <Typography variant="h5">
                                            {formatNumber(overviewData.totals.users)}
                                        </Typography>
                                        <Typography variant="caption" color="success.main">
                                            +{overviewData.period.newUsers} mới
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ArticleIcon sx={{ mr: 2, color: 'info.main', fontSize: 40 }} />
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Bài viết
                                        </Typography>
                                        <Typography variant="h5">
                                            {formatNumber(overviewData.totals.posts)}
                                        </Typography>
                                        <Typography variant="caption" color="success.main">
                                            +{overviewData.period.newPosts} mới
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TopicIcon sx={{ mr: 2, color: 'warning.main', fontSize: 40 }} />
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Chủ đề
                                        </Typography>
                                        <Typography variant="h5">
                                            {formatNumber(overviewData.totals.topics)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CommentIcon sx={{ mr: 2, color: 'secondary.main', fontSize: 40 }} />
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Bình luận
                                        </Typography>
                                        <Typography variant="h5">
                                            {formatNumber(overviewData.totals.comments)}
                                        </Typography>
                                        <Typography variant="caption" color="success.main">
                                            +{overviewData.period.newComments} mới
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <FavoriteIcon sx={{ mr: 2, color: 'error.main', fontSize: 40 }} />
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Lượt thích
                                        </Typography>
                                        <Typography variant="h5">
                                            {formatNumber(overviewData.totals.likes)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Tabs for different analytics sections */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Xu hướng tăng trưởng" />
                    <Tab label="Hoạt động người dùng" />
                    <Tab label="Nội dung phổ biến" />
                    <Tab label="Phân tích tìm kiếm" />
                </Tabs>

                {/* Tab Panel 0: Growth Trends */}
                <TabPanel value={selectedTab} index={0}>
                    {growthTrendsData && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Xu hướng tăng trưởng theo thời gian
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={formatDate}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) => formatDate(value)}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                name="Người dùng mới"
                                                data={growthTrendsData.userGrowth}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#82ca9d"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                name="Bài viết mới"
                                                data={growthTrendsData.postGrowth}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#ffc658"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                name="Bình luận mới"
                                                data={growthTrendsData.commentGrowth}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {overviewData && (
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Tỷ lệ tăng trưởng
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography>Người dùng:</Typography>
                                                <Chip
                                                    label={`${overviewData.growth.userGrowthRate > 0 ? '+' : ''}${overviewData.growth.userGrowthRate}%`}
                                                    color={overviewData.growth.userGrowthRate > 0 ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography>Bài viết:</Typography>
                                                <Chip
                                                    label={`${overviewData.growth.postGrowthRate > 0 ? '+' : ''}${overviewData.growth.postGrowthRate}%`}
                                                    color={overviewData.growth.postGrowthRate > 0 ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}

                            {overviewData && (
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Hoạt động trong {timePeriod} ngày qua
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Người dùng hoạt động: <strong>{overviewData.period.activeUsers}</strong>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Bài viết mới: <strong>{overviewData.period.newPosts}</strong>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Bình luận mới: <strong>{overviewData.period.newComments}</strong>
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </TabPanel>

                {/* Tab Panel 1: User Activity */}
                <TabPanel value={selectedTab} index={1}>
                    {userActivityData && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Hoạt động theo giờ trong ngày
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={userActivityData.hourlyActivity}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="_id" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Loại hoạt động
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={userActivityData.activityStats}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {userActivityData.activityStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Hoạt động theo ngày
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={userActivityData.dailyActivity}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={formatDate}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) => formatDate(value)}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stackId="1"
                                                stroke="#8884d8"
                                                fill="#8884d8"
                                                name="Tổng hoạt động"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="uniqueUserCount"
                                                stackId="2"
                                                stroke="#82ca9d"
                                                fill="#82ca9d"
                                                name="Người dùng duy nhất"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Top người dùng hoạt động nhất
                                    </Typography>
                                    <List>
                                        {userActivityData.topActiveUsers.slice(0, 10).map((user, index) => (
                                            <React.Fragment key={user._id._id}>
                                                <ListItem>
                                                    <ListItemAvatar>
                                                        <Avatar src={user._id.avatarUrl}>
                                                            {user._id.fullName?.charAt(0)}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={user._id.fullName || 'Người dùng ẩn danh'}
                                                        secondary={`${user.activityCount} hoạt động`}
                                                    />
                                                    <Chip
                                                        label={`#${index + 1}`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </ListItem>
                                                {index < 9 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </TabPanel>

                {/* Tab Panel 2: Popular Content */}
                <TabPanel value={selectedTab} index={2}>
                    {popularContentData && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Bài viết phổ biến nhất
                                    </Typography>
                                    <List>
                                        {popularContentData.popularPosts.slice(0, 10).map((post, index) => (
                                            <React.Fragment key={post._id._id}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={post._id.title}
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="caption" display="block">
                                                                    Tác giả: {post._id.authorId?.fullName || 'Ẩn danh'}
                                                                </Typography>
                                                                <Typography variant="caption" display="block">
                                                                    Chủ đề: {post._id.topicId?.name || 'Không xác định'}
                                                                </Typography>
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Chip label={`${post.viewCount} lượt xem`} size="small" sx={{ mr: 1 }} />
                                                                    <Chip label={`${post.likeCount} thích`} size="small" color="error" sx={{ mr: 1 }} />
                                                                    <Chip label={`${post.commentCount} bình luận`} size="small" color="info" />
                                                                </Box>
                                                            </Box>
                                                        }
                                                    />
                                                    <Chip
                                                        label={`#${index + 1}`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </ListItem>
                                                {index < 9 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Chủ đề phổ biến nhất
                                    </Typography>
                                    <List>
                                        {popularContentData.popularTopics.slice(0, 10).map((topic, index) => (
                                            <React.Fragment key={topic._id}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={topic.name}
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="caption" display="block">
                                                                    Danh mục: {topic.category}
                                                                </Typography>
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Chip label={`${topic.postCount} bài viết`} size="small" sx={{ mr: 1 }} />
                                                                    <Chip label={`${topic.viewCount} lượt xem`} size="small" color="info" sx={{ mr: 1 }} />
                                                                    <Chip label={`${topic.recentPostCount} bài mới`} size="small" color="success" />
                                                                </Box>
                                                            </Box>
                                                        }
                                                    />
                                                    <Chip
                                                        label={`#${index + 1}`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </ListItem>
                                                {index < 9 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Thống kê theo danh mục
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={popularContentData.categoryStats}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="_id" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="topicCount" fill="#8884d8" name="Số chủ đề" />
                                            <Bar dataKey="totalPosts" fill="#82ca9d" name="Tổng bài viết" />
                                            <Bar dataKey="totalViews" fill="#ffc658" name="Tổng lượt xem" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </TabPanel>

                {/* Tab Panel 3: Search Analytics */}
                <TabPanel value={selectedTab} index={3}>
                    {searchAnalyticsData && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Tổng quan tìm kiếm
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h4" color="primary.main">
                                            {formatNumber(searchAnalyticsData.overview.totalSearches)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Tổng số lượt tìm kiếm
                                        </Typography>

                                        <Typography variant="h4" color="info.main">
                                            {formatNumber(searchAnalyticsData.overview.uniqueQueries)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Từ khóa duy nhất
                                        </Typography>

                                        <Typography variant="h4" color="success.main">
                                            {searchAnalyticsData.overview.avgProcessingTime.toFixed(0)}ms
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Thời gian xử lý trung bình
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Xu hướng tìm kiếm theo ngày
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={searchAnalyticsData.searchTrends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="_id"
                                                tickFormatter={(value) => `${value.day}/${value.month}`}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="searchCount"
                                                stroke="#8884d8"
                                                name="Số lượt tìm kiếm"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="uniqueQueryCount"
                                                stroke="#82ca9d"
                                                name="Từ khóa duy nhất"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Từ khóa tìm kiếm phổ biến
                                    </Typography>
                                    <List>
                                        {searchAnalyticsData.popularSearches.slice(0, 10).map((search, index) => (
                                            <React.Fragment key={search._id}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={search.originalQuery}
                                                        secondary={
                                                            <Box>
                                                                <Chip
                                                                    label={`${search.count} lượt`}
                                                                    size="small"
                                                                    sx={{ mr: 1 }}
                                                                />
                                                                <Chip
                                                                    label={`${(search.successRate * 100).toFixed(0)}% thành công`}
                                                                    size="small"
                                                                    color={search.successRate > 0.5 ? 'success' : 'warning'}
                                                                />
                                                            </Box>
                                                        }
                                                    />
                                                    <Chip
                                                        label={`#${index + 1}`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </ListItem>
                                                {index < 9 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Tìm kiếm thất bại
                                    </Typography>
                                    <List>
                                        {searchAnalyticsData.failedSearches.slice(0, 10).map((search, index) => (
                                            <React.Fragment key={search._id}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={search.originalQuery}
                                                        secondary={`${search.count} lần thất bại`}
                                                    />
                                                    <Chip
                                                        label={search.count}
                                                        size="small"
                                                        color="error"
                                                    />
                                                </ListItem>
                                                {index < 9 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Thống kê theo thiết bị
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={searchAnalyticsData.deviceStats}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {searchAnalyticsData.deviceStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default AdminAnalyticsPage;
