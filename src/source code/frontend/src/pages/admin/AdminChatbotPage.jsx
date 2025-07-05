import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
    CircularProgress,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Slider,
    Switch
} from '@mui/material';
import {
    SmartToy as BotIcon,
    Psychology as IntentIcon,
    Chat as ConversationIcon,
    Analytics as AnalyticsIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Sync as SyncIcon,
    School as TrainIcon,
    Visibility as ViewIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Pending as PendingIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
    Settings
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const AdminChatbotPage = () => {
    // State management
    const [selectedTab, setSelectedTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [intents, setIntents] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [intentAnalytics, setIntentAnalytics] = useState(null);
    const [conversationAnalytics, setConversationAnalytics] = useState(null);

    // Pagination
    const [intentPage, setIntentPage] = useState(0);
    const [intentRowsPerPage, setIntentRowsPerPage] = useState(10);
    const [intentTotalCount, setIntentTotalCount] = useState(0);

    const [conversationPage, setConversationPage] = useState(0);
    const [conversationRowsPerPage, setConversationRowsPerPage] = useState(10);
    const [conversationTotalCount, setConversationTotalCount] = useState(0);

    // Dialogs
    const [intentDialogOpen, setIntentDialogOpen] = useState(false);
    const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
    const [selectedIntent, setSelectedIntent] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);

    // Form data
    const [intentFormData, setIntentFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        category: 'other',
        trainingPhrases: [{ text: '' }],
        responses: [{ type: 'text', text: '' }],
        tags: []
    });

    // Widget customization
    const [widgetSettings, setWidgetSettings] = useState({
        primaryColor: '#1976d2',
        secondaryColor: '#f5f5f5',
        textColor: '#333333',
        greetingMessage: 'Hù, bạn cần hỗ trợ gì không nè',
        greetingDelay: 3000, // milliseconds
        position: 'bottom-right',
        size: 'medium',
        showAvatar: true,
        autoOpen: false,
        welcomeSound: true
    });

    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Get auth token
    const getAuthToken = () => {
        // Try to get token from localStorage directly first
        const token = localStorage.getItem('token');
        if (token) return token;

        // Fallback to user.token for backward compatibility
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token;
    };

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    // Fetch intents
    const fetchIntents = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/chatbot/intents`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: intentPage + 1,
                    limit: intentRowsPerPage
                }
            });

            if (response.data.success) {
                setIntents(response.data.data.intents);
                setIntentTotalCount(response.data.data.pagination.totalIntents);
            }
        } catch (error) {
            console.error('Error fetching intents:', error);
            showSnackbar('Lỗi khi tải danh sách intents', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch conversations
    const fetchConversations = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/chatbot/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: conversationPage + 1,
                    limit: conversationRowsPerPage
                }
            });

            if (response.data.success) {
                setConversations(response.data.data.conversations);
                setConversationTotalCount(response.data.data.pagination.totalConversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            showSnackbar('Lỗi khi tải danh sách conversations', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch analytics
    const fetchAnalytics = async () => {
        try {
            const token = getAuthToken();
            const [overviewRes, intentRes, conversationRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/chatbot/analytics/overview`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/admin/chatbot/analytics/intents`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/admin/chatbot/analytics/conversations`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (overviewRes.data.success) {
                setAnalytics(overviewRes.data.data);
            }
            if (intentRes.data.success) {
                setIntentAnalytics(intentRes.data.data);
            }
            if (conversationRes.data.success) {
                setConversationAnalytics(conversationRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            showSnackbar('Lỗi khi tải thống kê', 'error');
        }
    };

    // Create intent
    const handleCreateIntent = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.post(`${API_BASE_URL}/admin/chatbot/intents`, intentFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                showSnackbar('Tạo intent thành công');
                setIntentDialogOpen(false);
                fetchIntents();
                resetIntentForm();
            }
        } catch (error) {
            console.error('Error creating intent:', error);
            showSnackbar('Lỗi khi tạo intent', 'error');
        }
    };

    // Update intent
    const handleUpdateIntent = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.put(
                `${API_BASE_URL}/admin/chatbot/intents/${selectedIntent._id}`,
                intentFormData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                showSnackbar('Cập nhật intent thành công');
                setIntentDialogOpen(false);
                fetchIntents();
                resetIntentForm();
            }
        } catch (error) {
            console.error('Error updating intent:', error);
            showSnackbar('Lỗi khi cập nhật intent', 'error');
        }
    };

    // Delete intent
    const handleDeleteIntent = async (intentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa intent này?')) return;

        try {
            const token = getAuthToken();
            const response = await axios.delete(`${API_BASE_URL}/admin/chatbot/intents/${intentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                showSnackbar('Xóa intent thành công');
                fetchIntents();
            }
        } catch (error) {
            console.error('Error deleting intent:', error);
            showSnackbar('Lỗi khi xóa intent', 'error');
        }
    };

    // Sync with Dialogflow
    const handleSyncDialogflow = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await axios.post(`${API_BASE_URL}/admin/chatbot/sync`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                showSnackbar(response.data.message);
                fetchIntents();
            }
        } catch (error) {
            console.error('Error syncing with Dialogflow:', error);
            showSnackbar('Lỗi khi sync với Dialogflow', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Train agent
    const handleTrainAgent = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await axios.post(`${API_BASE_URL}/admin/chatbot/train`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                showSnackbar('Huấn luyện agent thành công');
            }
        } catch (error) {
            console.error('Error training agent:', error);
            showSnackbar('Lỗi khi huấn luyện agent', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Reset intent form
    const resetIntentForm = () => {
        setIntentFormData({
            name: '',
            displayName: '',
            description: '',
            category: 'other',
            trainingPhrases: [{ text: '' }],
            responses: [{ type: 'text', text: '' }],
            tags: []
        });
        setSelectedIntent(null);
    };

    // Open intent dialog
    const openIntentDialog = (intent = null) => {
        if (intent) {
            setSelectedIntent(intent);
            setIntentFormData({
                name: intent.name,
                displayName: intent.displayName,
                description: intent.description || '',
                category: intent.category,
                trainingPhrases: intent.trainingPhrases.length > 0 ? intent.trainingPhrases : [{ text: '' }],
                responses: intent.responses.length > 0 ? intent.responses : [{ type: 'text', text: '' }],
                tags: intent.tags || []
            });
        } else {
            resetIntentForm();
        }
        setIntentDialogOpen(true);
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'warning';
            case 'draft': return 'info';
            default: return 'default';
        }
    };

    // Get sync status icon
    const getSyncStatusIcon = (status) => {
        switch (status) {
            case 'synced': return <CheckIcon color="success" />;
            case 'pending': return <PendingIcon color="warning" />;
            case 'error': return <ErrorIcon color="error" />;
            default: return <PendingIcon />;
        }
    };

    // Format number
    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num?.toString() || '0';
    };

    // Load widget settings
    const loadWidgetSettings = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/chatbot/widget-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setWidgetSettings(prev => ({
                    ...prev,
                    ...response.data.data
                }));
            }
        } catch (error) {
            console.error('Error loading widget settings:', error);
            // Use default settings if API fails
        }
    };

    // Save widget settings
    const saveWidgetSettings = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.put(`${API_BASE_URL}/admin/chatbot/widget-settings`, widgetSettings, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                showSnackbar('Cài đặt widget đã được lưu thành công');
                // Apply settings to current widget
                applyWidgetSettings();
            }
        } catch (error) {
            console.error('Error saving widget settings:', error);
            showSnackbar('Lỗi khi lưu cài đặt widget', 'error');
        }
    };

    // Apply widget settings to current widget
    const applyWidgetSettings = () => {
        // Update CSS variables for widget styling
        const root = document.documentElement;
        root.style.setProperty('--chatbot-primary-color', widgetSettings.primaryColor);
        root.style.setProperty('--chatbot-secondary-color', widgetSettings.secondaryColor);
        root.style.setProperty('--chatbot-text-color', widgetSettings.textColor);

        // Store settings in localStorage for widget to use
        localStorage.setItem('chatbotWidgetSettings', JSON.stringify(widgetSettings));

        // Trigger widget update event
        window.dispatchEvent(new CustomEvent('chatbotSettingsUpdated', {
            detail: widgetSettings
        }));
    };

    // Reset widget settings to default
    const resetWidgetSettings = () => {
        setWidgetSettings({
            primaryColor: '#1976d2',
            secondaryColor: '#f5f5f5',
            textColor: '#333333',
            greetingMessage: 'Hù, bạn cần hỗ trợ gì không nè',
            greetingDelay: 3000,
            position: 'bottom-right',
            size: 'medium',
            showAvatar: true,
            autoOpen: false,
            welcomeSound: true
        });
    };

    // Handle widget setting change
    const handleWidgetSettingChange = (key, value) => {
        setWidgetSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Effects
    useEffect(() => {
        if (selectedTab === 0) {
            fetchIntents();
        } else if (selectedTab === 1) {
            fetchConversations();
        } else if (selectedTab === 2) {
            fetchAnalytics();
        } else if (selectedTab === 3) {
            loadWidgetSettings();
        }
    }, [selectedTab, intentPage, intentRowsPerPage, conversationPage, conversationRowsPerPage]);

    // Tab panel component
    const TabPanel = ({ children, value, index, ...other }) => (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`chatbot-tabpanel-${index}`}
            aria-labelledby={`chatbot-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );

    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    <BotIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
                    Quản lý Chatbot
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<SyncIcon />}
                        onClick={handleSyncDialogflow}
                        disabled={loading}
                    >
                        Sync Dialogflow
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<TrainIcon />}
                        onClick={handleTrainAgent}
                        disabled={loading}
                    >
                        Huấn luyện Agent
                    </Button>
                </Box>
            </Box>

            {/* Overview Cards */}
            {analytics && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IntentIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Tổng Intents
                                        </Typography>
                                        <Typography variant="h5">
                                            {analytics.overview.totalIntents}
                                        </Typography>
                                        <Typography variant="caption" color="success.main">
                                            {analytics.overview.activeIntents} hoạt động
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ConversationIcon sx={{ mr: 2, color: 'info.main', fontSize: 40 }} />
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Conversations
                                        </Typography>
                                        <Typography variant="h5">
                                            {analytics.overview.totalConversations}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            30 ngày qua
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <StarIcon sx={{ mr: 2, color: 'warning.main', fontSize: 40 }} />
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Đánh giá TB
                                        </Typography>
                                        <Typography variant="h5">
                                            {analytics.feedbackStats.avgRating?.toFixed(1) || 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {analytics.feedbackStats.totalFeedback || 0} đánh giá
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ErrorIcon sx={{ mr: 2, color: 'error.main', fontSize: 40 }} />
                                    <Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            Cần Review
                                        </Typography>
                                        <Typography variant="h5">
                                            {analytics.overview.needsReviewCount}
                                        </Typography>
                                        <Typography variant="caption" color="error.main">
                                            conversations
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Quản lý Intents" icon={<IntentIcon />} />
                    <Tab label="Conversations" icon={<ConversationIcon />} />
                    <Tab label="Thống kê" icon={<AnalyticsIcon />} />
                    <Tab label="Tùy chỉnh Widget" icon={<Settings />} />
                </Tabs>

                {/* Tab Panel 0: Intent Management */}
                <TabPanel value={selectedTab} index={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Danh sách Intents
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => openIntentDialog()}
                        >
                            Tạo Intent
                        </Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tên Intent</TableCell>
                                    <TableCell>Danh mục</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Sync Status</TableCell>
                                    <TableCell>Training Phrases</TableCell>
                                    <TableCell>Responses</TableCell>
                                    <TableCell>Trigger Count</TableCell>
                                    <TableCell>Success Rate</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : intents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            Không có intent nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    intents.map((intent) => (
                                        <TableRow key={intent._id}>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {intent.displayName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {intent.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={intent.category}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={intent.status}
                                                    color={getStatusColor(intent.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={intent.dialogflow?.syncError || intent.dialogflow?.syncStatus}>
                                                    {getSyncStatusIcon(intent.dialogflow?.syncStatus)}
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>{intent.trainingPhrases?.length || 0}</TableCell>
                                            <TableCell>{intent.responses?.length || 0}</TableCell>
                                            <TableCell>{intent.stats?.triggerCount || 0}</TableCell>
                                            <TableCell>
                                                {intent.stats?.triggerCount > 0 ?
                                                    `${intent.successRate}%` : 'N/A'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Chỉnh sửa">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openIntentDialog(intent)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteIntent(intent._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={intentTotalCount}
                        page={intentPage}
                        onPageChange={(event, newPage) => setIntentPage(newPage)}
                        rowsPerPage={intentRowsPerPage}
                        onRowsPerPageChange={(event) => {
                            setIntentRowsPerPage(parseInt(event.target.value, 10));
                            setIntentPage(0);
                        }}
                        labelRowsPerPage="Số hàng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
                        }
                    />
                </TabPanel>

                {/* Tab Panel 1: Conversations */}
                <TabPanel value={selectedTab} index={1}>
                    <Typography variant="h6" gutterBottom>
                        Lịch sử Conversations
                    </Typography>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Session ID</TableCell>
                                    <TableCell>Người dùng</TableCell>
                                    <TableCell>Thời gian bắt đầu</TableCell>
                                    <TableCell>Thời lượng</TableCell>
                                    <TableCell>Tin nhắn</TableCell>
                                    <TableCell>Success Rate</TableCell>
                                    <TableCell>Đánh giá</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : conversations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            Không có conversation nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    conversations.map((conversation) => (
                                        <TableRow key={conversation._id}>
                                            <TableCell>
                                                <Typography variant="body2" fontFamily="monospace">
                                                    {conversation.sessionId.substring(0, 8)}...
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {conversation.userId ?
                                                    conversation.userId.fullName : 'Ẩn danh'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {new Date(conversation.startedAt).toLocaleString('vi-VN')}
                                            </TableCell>
                                            <TableCell>
                                                {conversation.duration ?
                                                    `${Math.floor(conversation.duration / 60)}:${(conversation.duration % 60).toString().padStart(2, '0')}`
                                                    : 'N/A'
                                                }
                                            </TableCell>
                                            <TableCell>{conversation.stats?.totalMessages || 0}</TableCell>
                                            <TableCell>
                                                {conversation.successRate}%
                                            </TableCell>
                                            <TableCell>
                                                {conversation.feedback?.rating ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <StarIcon sx={{ color: 'gold', fontSize: 16, mr: 0.5 }} />
                                                        {conversation.feedback.rating}
                                                    </Box>
                                                ) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={conversation.status}
                                                    color={conversation.status === 'ended' ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                                {conversation.needsReview && (
                                                    <Chip
                                                        label="Cần review"
                                                        color="error"
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedConversation(conversation);
                                                            setConversationDialogOpen(true);
                                                        }}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={conversationTotalCount}
                        page={conversationPage}
                        onPageChange={(event, newPage) => setConversationPage(newPage)}
                        rowsPerPage={conversationRowsPerPage}
                        onRowsPerPageChange={(event) => {
                            setConversationRowsPerPage(parseInt(event.target.value, 10));
                            setConversationPage(0);
                        }}
                        labelRowsPerPage="Số hàng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
                        }
                    />
                </TabPanel>

                {/* Tab Panel 2: Analytics */}
                <TabPanel value={selectedTab} index={2}>
                    {analytics && (
                        <Grid container spacing={3}>
                            {/* Popular Intents */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Intents phổ biến nhất
                                    </Typography>
                                    <List>
                                        {analytics.popularIntents?.slice(0, 5).map((intent, index) => (
                                            <React.Fragment key={intent._id}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={intent.displayName}
                                                        secondary={`${intent.count} lượt trigger - Confidence: ${(intent.avgConfidence * 100).toFixed(1)}%`}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Chip
                                                            label={`#${index + 1}`}
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                {index < 4 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>

                            {/* Failed Intents */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Câu hỏi thất bại nhiều nhất
                                    </Typography>
                                    <List>
                                        {analytics.failedIntents?.slice(0, 5).map((failed, index) => (
                                            <React.Fragment key={index}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={failed._id}
                                                        secondary={`${failed.count} lần thất bại`}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Chip
                                                            label={failed.count}
                                                            size="small"
                                                            color="error"
                                                        />
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                {index < 4 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>

                            {/* Intent by Category */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Intents theo danh mục
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={analytics.intentsByCategory}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ _id, count }) => `${_id}: ${count}`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {analytics.intentsByCategory?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            {/* Conversation Trends */}
                            {conversationAnalytics && (
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Xu hướng conversations
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={conversationAnalytics.conversationTrend}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                                                />
                                                <YAxis />
                                                <RechartsTooltip
                                                    labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="#8884d8"
                                                    name="Số conversations"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>
                            )}

                            {/* Conversation by Hour */}
                            {conversationAnalytics && (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Conversations theo giờ trong ngày
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={conversationAnalytics.conversationByHour}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="_id" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Bar dataKey="count" fill="#82ca9d" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </TabPanel>

                {/* Tab Panel 3: Widget Customization */}
                <TabPanel value={selectedTab} index={3}>
                    <Grid container spacing={3}>
                        {/* Color Settings */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Màu sắc
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box>
                                        <Typography variant="body2" gutterBottom>
                                            Màu chính
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <input
                                                type="color"
                                                value={widgetSettings.primaryColor}
                                                onChange={(e) => handleWidgetSettingChange('primaryColor', e.target.value)}
                                                style={{ width: 50, height: 40, border: 'none', borderRadius: 4 }}
                                            />
                                            <TextField
                                                size="small"
                                                value={widgetSettings.primaryColor}
                                                onChange={(e) => handleWidgetSettingChange('primaryColor', e.target.value)}
                                                sx={{ width: 120 }}
                                            />
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" gutterBottom>
                                            Màu phụ
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <input
                                                type="color"
                                                value={widgetSettings.secondaryColor}
                                                onChange={(e) => handleWidgetSettingChange('secondaryColor', e.target.value)}
                                                style={{ width: 50, height: 40, border: 'none', borderRadius: 4 }}
                                            />
                                            <TextField
                                                size="small"
                                                value={widgetSettings.secondaryColor}
                                                onChange={(e) => handleWidgetSettingChange('secondaryColor', e.target.value)}
                                                sx={{ width: 120 }}
                                            />
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" gutterBottom>
                                            Màu chữ
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <input
                                                type="color"
                                                value={widgetSettings.textColor}
                                                onChange={(e) => handleWidgetSettingChange('textColor', e.target.value)}
                                                style={{ width: 50, height: 40, border: 'none', borderRadius: 4 }}
                                            />
                                            <TextField
                                                size="small"
                                                value={widgetSettings.textColor}
                                                onChange={(e) => handleWidgetSettingChange('textColor', e.target.value)}
                                                sx={{ width: 120 }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Message Settings */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Tin nhắn chào
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Câu chào"
                                        multiline
                                        rows={3}
                                        value={widgetSettings.greetingMessage}
                                        onChange={(e) => handleWidgetSettingChange('greetingMessage', e.target.value)}
                                        helperText="Tin nhắn sẽ hiển thị khi chatbot xuất hiện"
                                    />

                                    <Box>
                                        <Typography variant="body2" gutterBottom>
                                            Thời gian hiển thị (giây): {widgetSettings.greetingDelay / 1000}
                                        </Typography>
                                        <Box sx={{ px: 2 }}>
                                            <input
                                                type="range"
                                                min="1000"
                                                max="10000"
                                                step="500"
                                                value={widgetSettings.greetingDelay}
                                                onChange={(e) => handleWidgetSettingChange('greetingDelay', parseInt(e.target.value))}
                                                style={{ width: '100%' }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'text.secondary' }}>
                                            <span>1s</span>
                                            <span>10s</span>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Position & Size Settings */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Vị trí & Kích thước
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Vị trí</InputLabel>
                                        <Select
                                            value={widgetSettings.position}
                                            label="Vị trí"
                                            onChange={(e) => handleWidgetSettingChange('position', e.target.value)}
                                        >
                                            <MenuItem value="bottom-right">Góc phải dưới</MenuItem>
                                            <MenuItem value="bottom-left">Góc trái dưới</MenuItem>
                                            <MenuItem value="top-right">Góc phải trên</MenuItem>
                                            <MenuItem value="top-left">Góc trái trên</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth>
                                        <InputLabel>Kích thước</InputLabel>
                                        <Select
                                            value={widgetSettings.size}
                                            label="Kích thước"
                                            onChange={(e) => handleWidgetSettingChange('size', e.target.value)}
                                        >
                                            <MenuItem value="small">Nhỏ</MenuItem>
                                            <MenuItem value="medium">Vừa</MenuItem>
                                            <MenuItem value="large">Lớn</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Behavior Settings */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Hành vi
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemText
                                            primary="Hiển thị avatar"
                                            secondary="Hiển thị hình đại diện của bot"
                                        />
                                        <ListItemSecondaryAction>
                                            <input
                                                type="checkbox"
                                                checked={widgetSettings.showAvatar}
                                                onChange={(e) => handleWidgetSettingChange('showAvatar', e.target.checked)}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>

                                    <ListItem>
                                        <ListItemText
                                            primary="Tự động mở"
                                            secondary="Tự động mở chat khi trang được tải"
                                        />
                                        <ListItemSecondaryAction>
                                            <input
                                                type="checkbox"
                                                checked={widgetSettings.autoOpen}
                                                onChange={(e) => handleWidgetSettingChange('autoOpen', e.target.checked)}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>

                                    <ListItem>
                                        <ListItemText
                                            primary="Âm thanh chào"
                                            secondary="Phát âm thanh khi hiển thị tin nhắn chào"
                                        />
                                        <ListItemSecondaryAction>
                                            <input
                                                type="checkbox"
                                                checked={widgetSettings.welcomeSound}
                                                onChange={(e) => handleWidgetSettingChange('welcomeSound', e.target.checked)}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>

                        {/* Preview */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Xem trước
                                </Typography>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: 300,
                                        border: '2px dashed #ccc',
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'grey.50'
                                    }}
                                >
                                    <Typography color="text.secondary">
                                        Xem trước widget chatbot sẽ hiển thị ở đây
                                    </Typography>

                                    {/* Mini preview widget */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 20,
                                            right: 20,
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            bgcolor: widgetSettings.primaryColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '24px',
                                            cursor: 'pointer',
                                            boxShadow: 3
                                        }}
                                    >
                                        💬
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Action Buttons */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={resetWidgetSettings}
                                >
                                    Đặt lại mặc định
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={applyWidgetSettings}
                                >
                                    Áp dụng ngay
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={saveWidgetSettings}
                                >
                                    Lưu cài đặt
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Paper>

            {/* Intent Dialog */}
            <Dialog
                open={intentDialogOpen}
                onClose={() => setIntentDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedIntent ? 'Chỉnh sửa Intent' : 'Tạo Intent mới'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tên Intent"
                                value={intentFormData.name}
                                onChange={(e) => setIntentFormData({ ...intentFormData, name: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tên hiển thị"
                                value={intentFormData.displayName}
                                onChange={(e) => setIntentFormData({ ...intentFormData, displayName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mô tả"
                                multiline
                                rows={2}
                                value={intentFormData.description}
                                onChange={(e) => setIntentFormData({ ...intentFormData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Danh mục</InputLabel>
                                <Select
                                    value={intentFormData.category}
                                    label="Danh mục"
                                    onChange={(e) => setIntentFormData({ ...intentFormData, category: e.target.value })}
                                >
                                    <MenuItem value="greeting">Chào hỏi</MenuItem>
                                    <MenuItem value="faq">FAQ</MenuItem>
                                    <MenuItem value="support">Hỗ trợ</MenuItem>
                                    <MenuItem value="information">Thông tin</MenuItem>
                                    <MenuItem value="navigation">Điều hướng</MenuItem>
                                    <MenuItem value="feedback">Phản hồi</MenuItem>
                                    <MenuItem value="other">Khác</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Training Phrases
                            </Typography>
                            {intentFormData.trainingPhrases.map((phrase, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <TextField
                                        fullWidth
                                        label={`Câu huấn luyện ${index + 1}`}
                                        value={phrase.text}
                                        onChange={(e) => {
                                            const newPhrases = [...intentFormData.trainingPhrases];
                                            newPhrases[index].text = e.target.value;
                                            setIntentFormData({ ...intentFormData, trainingPhrases: newPhrases });
                                        }}
                                        required
                                    />
                                    <IconButton
                                        onClick={() => {
                                            const newPhrases = intentFormData.trainingPhrases.filter((_, i) => i !== index);
                                            setIntentFormData({ ...intentFormData, trainingPhrases: newPhrases });
                                        }}
                                        disabled={intentFormData.trainingPhrases.length === 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setIntentFormData({
                                        ...intentFormData,
                                        trainingPhrases: [...intentFormData.trainingPhrases, { text: '' }]
                                    });
                                }}
                            >
                                Thêm câu huấn luyện
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Responses
                            </Typography>
                            {intentFormData.responses.map((response, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <TextField
                                        fullWidth
                                        label={`Phản hồi ${index + 1}`}
                                        value={response.text}
                                        onChange={(e) => {
                                            const newResponses = [...intentFormData.responses];
                                            newResponses[index].text = e.target.value;
                                            setIntentFormData({ ...intentFormData, responses: newResponses });
                                        }}
                                        required
                                    />
                                    <IconButton
                                        onClick={() => {
                                            const newResponses = intentFormData.responses.filter((_, i) => i !== index);
                                            setIntentFormData({ ...intentFormData, responses: newResponses });
                                        }}
                                        disabled={intentFormData.responses.length === 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setIntentFormData({
                                        ...intentFormData,
                                        responses: [...intentFormData.responses, { type: 'text', text: '' }]
                                    });
                                }}
                            >
                                Thêm phản hồi
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIntentDialogOpen(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={selectedIntent ? handleUpdateIntent : handleCreateIntent}
                        variant="contained"
                        disabled={!intentFormData.name || !intentFormData.displayName}
                    >
                        {selectedIntent ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Conversation Detail Dialog */}
            <Dialog
                open={conversationDialogOpen}
                onClose={() => setConversationDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Chi tiết Conversation
                </DialogTitle>
                <DialogContent>
                    {selectedConversation && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Session: {selectedConversation.sessionId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Bắt đầu: {new Date(selectedConversation.startedAt).toLocaleString('vi-VN')}
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Tin nhắn:
                                </Typography>
                                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                                    {selectedConversation.messages?.map((message, index) => (
                                        <ListItem key={index} sx={{
                                            bgcolor: message.type === 'user' ? 'primary.light' : 'grey.100',
                                            mb: 1,
                                            borderRadius: 1
                                        }}>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {message.type === 'user' ? 'Người dùng' : 'Bot'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ ml: 1 }}>
                                                            {new Date(message.timestamp).toLocaleTimeString('vi-VN')}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {message.text}
                                                        </Typography>
                                                        {message.detectedIntent && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Intent: {message.detectedIntent.displayName}
                                                                (Confidence: {(message.detectedIntent.confidence * 100).toFixed(1)}%)
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConversationDialogOpen(false)}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminChatbotPage;
