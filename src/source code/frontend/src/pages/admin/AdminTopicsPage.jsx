import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    Alert,
    Snackbar,
    Tooltip,
    Switch,
    FormControlLabel,
    Fab,
    Badge
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    VisibilityOff as VisibilityOffIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    DragIndicator as DragIcon,
    TrendingUp as TrendingUpIcon,
    Category as CategoryIcon,
    GetApp as ExportIcon
} from '@mui/icons-material';
import axios from 'axios';
import TopicChart from '../../components/admin/TopicChart';
import * as XLSX from 'xlsx';

const AdminTopicsPage = () => {
    // State management
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalTopics, setTotalTopics] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [topicToDelete, setTopicToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [stats, setStats] = useState({});
    const [debugDialogOpen, setDebugDialogOpen] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [timePeriod, setTimePeriod] = useState('last_month');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Học tập',
        priority: 0,
        color: '#1976d2',
        icon: 'topic',
        imageUrl: '',
        tags: [],
        isVisible: true,
        allowPosts: true,
        requireApproval: false
    });

    // Categories
    const categories = [
        'Học tập',
        'Nghiên cứu',
        'Thực tập',
        'Việc làm',
        'Hoạt động sinh viên',
        'Công nghệ',
        'Kỹ năng mềm',
        'Trao đổi học thuật',
        'Thông báo',
        'Khác'
    ];

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

    // Fetch topics
    const fetchTopics = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/topics`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search: searchTerm,
                    category: categoryFilter,
                    status: statusFilter
                }
            });

            if (response.data.success) {
                setTopics(response.data.data.topics);
                setTotalTopics(response.data.data.pagination.totalTopics);
            }
        } catch (error) {
            console.error('Error fetching topics:', error);
            showSnackbar('Lỗi khi tải danh sách chủ đề', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch topic stats
    const fetchStats = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/analytics/topics?period=${timePeriod}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Handle form submit
    const handleSubmit = async () => {
        try {
            const token = getAuthToken();
            const url = editingTopic
                ? `${API_BASE_URL}/admin/topics/${editingTopic._id}`
                : `${API_BASE_URL}/admin/topics`;

            const method = editingTopic ? 'put' : 'post';

            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSnackbar(`${editingTopic ? 'Cập nhật' : 'Tạo'} chủ đề thành công`);
            setDialogOpen(false);
            resetForm();
            fetchTopics();
            fetchStats();
        } catch (error) {
            console.error('Error saving topic:', error);
            showSnackbar(`Lỗi khi ${editingTopic ? 'cập nhật' : 'tạo'} chủ đề`, 'error');
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!topicToDelete) return;

        try {
            const token = getAuthToken();
            await axios.delete(`${API_BASE_URL}/admin/topics/${topicToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSnackbar('Xóa chủ đề thành công');
            setDeleteDialogOpen(false);
            setTopicToDelete(null);
            fetchTopics();
            fetchStats();
        } catch (error) {
            console.error('Error deleting topic:', error);
            const message = error.response?.data?.message || 'Lỗi khi xóa chủ đề';
            showSnackbar(message, 'error');
        }
    };

    // Handle status change
    const handleStatusChange = async (topicId, newStatus) => {
        try {
            const token = getAuthToken();
            await axios.put(`${API_BASE_URL}/admin/topics/${topicId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            showSnackbar('Cập nhật trạng thái thành công');
            fetchTopics();
            fetchStats();
        } catch (error) {
            console.error('Error updating status:', error);
            showSnackbar('Lỗi khi cập nhật trạng thái', 'error');
        }
    };

    // Handle update post counts
    const handleUpdatePostCounts = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.put(`${API_BASE_URL}/admin/topics/update-post-counts`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                showSnackbar(response.data.message);
                fetchTopics();
                fetchStats();
            }
        } catch (error) {
            console.error('Error updating post counts:', error);
            showSnackbar('Lỗi khi cập nhật số lượng bài viết', 'error');
        }
    };

    // Handle debug topic
    const handleDebugTopic = async (topic) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/admin/topics/${topic._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setDebugInfo({
                    topic: response.data.data.topic,
                    postStats: response.data.data.postStats,
                    totalPosts: response.data.data.totalPosts
                });
                setDebugDialogOpen(true);
            }
        } catch (error) {
            console.error('Error getting topic debug info:', error);
            showSnackbar('Lỗi khi lấy thông tin debug', 'error');
        }
    };

    // Handle fix topic data (createdAt, updatedAt, etc.)
    const handleFixTopicData = async () => {
        try {
            showSnackbar('Đang sửa dữ liệu chủ đề...', 'info');

            // Gọi API để sửa dữ liệu (cần tạo endpoint này)
            const token = getAuthToken();
            const response = await axios.put(`${API_BASE_URL}/admin/topics/fix-data`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                showSnackbar('Đã sửa dữ liệu chủ đề thành công');
                fetchTopics();
                fetchStats();
            }
        } catch (error) {
            console.error('Error fixing topic data:', error);
            showSnackbar('Lỗi khi sửa dữ liệu chủ đề', 'error');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'Học tập',
            priority: 0,
            color: '#1976d2',
            icon: 'topic',
            imageUrl: '',
            tags: [],
            isVisible: true,
            allowPosts: true,
            requireApproval: false
        });
        setEditingTopic(null);
    };

    // Open edit dialog
    const openEditDialog = (topic) => {
        setEditingTopic(topic);
        setFormData({
            name: topic.name,
            description: topic.description,
            category: topic.category,
            priority: topic.priority,
            color: topic.color,
            icon: topic.icon,
            imageUrl: topic.imageUrl || '',
            tags: topic.tags || [],
            isVisible: topic.isVisible,
            allowPosts: topic.allowPosts,
            requireApproval: topic.requireApproval
        });
        setDialogOpen(true);
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            active: 'success',
            inactive: 'warning',
            archived: 'default'
        };
        return colors[status] || 'default';
    };

    // Get category color
    const getCategoryColor = (category) => {
        const colors = {
            'Học tập': 'primary',
            'Nghiên cứu': 'secondary',
            'Thực tập': 'info',
            'Việc làm': 'success',
            'Hoạt động sinh viên': 'warning',
            'Công nghệ': 'error'
        };
        return colors[category] || 'default';
    };

    // Effects
    useEffect(() => {
        fetchTopics();
    }, [page, rowsPerPage, searchTerm, categoryFilter, statusFilter]);

    useEffect(() => {
        fetchStats();
    }, [timePeriod]);


    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(topics.map(topic => ({
            "Tên chủ đề": topic.name,
            "Trạng thái": topic.status,
            "Số bài viết": topic.postCount,
            "Ngày tạo": new Date(topic.createdAt).toLocaleDateString('vi-VN')
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Chủ đề");
        XLSX.writeFile(workbook, "DanhSachChuDe.xlsx");
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Quản lý Chủ đề
                </Typography>
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={() => {
                        resetForm();
                        setDialogOpen(true);
                    }}
                >
                    <AddIcon />
                </Fab>
            </Box>

            {/* Chart */}
            {stats.topicsByPosts && stats.topicsByPosts.length > 0 && (
                <TopicChart data={stats.topicsByPosts} />
            )}

            {/* Stats Cards */}
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
                    onClick={fetchStats}
                    disabled={loading}
                >
                    Làm mới
                </Button>
            </Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CategoryIcon sx={{ mr: 2, color: 'primary.main' }} />
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Tổng chủ đề
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.totals?.topics || 0}
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
                                <ViewIcon sx={{ mr: 2, color: 'success.main' }} />
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Mới trong kỳ
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {stats.periodStats?.topics || 0}
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
                                <TrendingUpIcon sx={{ mr: 2, color: 'warning.main' }} />
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Có bài viết mới
                                    </Typography>
                                    <Typography variant="h4" color="warning.main">
                                        {stats.periodStats?.topicsWithNewPosts || 0}
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
                                <ViewIcon sx={{ mr: 2, color: 'primary.main' }} />
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Chủ đề đang hoạt động
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.totals?.activeTopics || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
            </Grid>

            {/* Filters and Search */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm"
                            placeholder="Tìm theo tên, mô tả hoặc tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Danh mục</InputLabel>
                            <Select
                                value={categoryFilter}
                                label="Danh mục"
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Trạng thái"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="active">Hoạt động</MenuItem>
                                <MenuItem value="inactive">Không hoạt động</MenuItem>
                                <MenuItem value="archived">Đã lưu trữ</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2} container spacing={1}>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategoryFilter('');
                                    setStatusFilter('');
                                    fetchTopics();
                                }}
                                fullWidth
                            >
                                Làm mới
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<ExportIcon />}
                                onClick={handleExportExcel}
                                fullWidth
                            >
                                Export Excel
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            {/* Topics Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên chủ đề</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Bài viết</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : topics.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Không có chủ đề nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                topics.map((topic) => (
                                    <TableRow key={topic._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        backgroundColor: topic.color,
                                                        borderRadius: '50%',
                                                        mr: 1.5
                                                    }}
                                                />
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {topic.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {topic.description?.substring(0, 60)}...
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={
                                                    topic.status === 'active' ? 'Hoạt động' :
                                                        topic.status === 'inactive' ? 'Tạm ngưng' : 'Đã lưu trữ'
                                                }
                                                color={getStatusColor(topic.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">{topic.postCount || 0}</TableCell>
                                        <TableCell>
                                            {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Chỉnh sửa">
                                                <IconButton size="small" onClick={() => openEditDialog(topic)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={topic.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}>
                                                <IconButton
                                                    size="small"
                                                    color={topic.status === 'active' ? 'warning' : 'success'}
                                                    onClick={() => handleStatusChange(
                                                        topic._id,
                                                        topic.status === 'active' ? 'inactive' : 'active'
                                                    )}
                                                >
                                                    {topic.status === 'active' ? <VisibilityOffIcon /> : <ViewIcon />}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        setTopicToDelete(topic);
                                                        setDeleteDialogOpen(true);
                                                    }}
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
                    count={totalTopics}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
                    }
                />
            </Paper>

            {/* Create/Edit Topic Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingTopic ? 'Chỉnh sửa chủ đề' : 'Tạo chủ đề mới'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tên chủ đề"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Danh mục</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Danh mục"
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mô tả"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Thứ tự ưu tiên"
                                type="number"
                                inputProps={{ min: 0, max: 10 }}
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Màu sắc"
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Icon"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="URL ảnh đại diện"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tags (phân cách bằng dấu phẩy)"
                                value={formData.tags.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isVisible}
                                        onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                    />
                                }
                                label="Hiển thị công khai"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.allowPosts}
                                        onChange={(e) => setFormData({ ...formData, allowPosts: e.target.checked })}
                                    />
                                }
                                label="Cho phép tạo bài viết"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.requireApproval}
                                        onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                                    />
                                }
                                label="Yêu cầu duyệt bài"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.name || !formData.description}
                    >
                        {editingTopic ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Xác nhận xóa chủ đề
                </DialogTitle>
                <DialogContent>
                    {topicToDelete && (
                        <Box>
                            <Typography gutterBottom>
                                Bạn có chắc chắn muốn xóa chủ đề <strong>"{topicToDelete.name}"</strong>?
                            </Typography>
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Hành động này không thể hoàn tác. Chủ đề chỉ có thể xóa khi không có bài viết nào đang sử dụng.
                            </Alert>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Debug Dialog */}
            <Dialog
                open={debugDialogOpen}
                onClose={() => setDebugDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Debug thông tin chủ đề
                </DialogTitle>
                <DialogContent>
                    {debugInfo && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Thông tin chủ đề: {debugInfo.topic.name}
                                </Typography>
                                <Typography><strong>ID:</strong> {debugInfo.topic._id}</Typography>
                                <Typography><strong>PostCount trong DB:</strong> {debugInfo.topic.postCount || 0}</Typography>
                                <Typography><strong>Tổng bài viết thực tế:</strong> {debugInfo.totalPosts || 0}</Typography>
                                <Typography><strong>Trạng thái:</strong> {debugInfo.topic.status}</Typography>
                                <Typography>
                                    <strong>Ngày tạo:</strong> {
                                        debugInfo.topic.createdAt
                                            ? new Date(debugInfo.topic.createdAt).toLocaleString('vi-VN')
                                            : '❌ Thiếu dữ liệu'
                                    }
                                </Typography>
                                <Typography>
                                    <strong>Ngày cập nhật:</strong> {
                                        debugInfo.topic.updatedAt
                                            ? new Date(debugInfo.topic.updatedAt).toLocaleString('vi-VN')
                                            : '❌ Thiếu dữ liệu'
                                    }
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Phân tích theo Status
                                </Typography>
                                {debugInfo.postStats && debugInfo.postStats.length > 0 ? (
                                    <Box>
                                        {debugInfo.postStats.map((stat, index) => (
                                            <Chip
                                                key={index}
                                                label={`${stat._id}: ${stat.count}`}
                                                color="primary"
                                                variant="outlined"
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography color="text.secondary">
                                        Không có bài viết nào
                                    </Typography>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Alert
                                    severity={debugInfo.topic.postCount === debugInfo.totalPosts ? "success" : "warning"}
                                    sx={{ mt: 2 }}
                                >
                                    {debugInfo.topic.postCount === debugInfo.totalPosts
                                        ? "✅ Số lượng bài viết khớp với database"
                                        : `⚠️ Số lượng bài viết không khớp! DB: ${debugInfo.topic.postCount || 0}, Thực tế: ${debugInfo.totalPosts || 0}`
                                    }
                                </Alert>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDebugDialogOpen(false)}>
                        Đóng
                    </Button>
                    <Button
                        onClick={() => {
                            handleUpdatePostCounts();
                            setDebugDialogOpen(false);
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Sửa ngay
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

export default AdminTopicsPage;
