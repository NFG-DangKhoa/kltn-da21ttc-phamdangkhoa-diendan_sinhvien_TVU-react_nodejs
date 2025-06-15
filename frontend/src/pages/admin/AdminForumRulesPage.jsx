import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
    Card,
    CardContent,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton
} from '@mui/material';
import {
    Save as SaveIcon,
    Preview as PreviewIcon,
    History as HistoryIcon,
    Visibility as ViewIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const AdminForumRulesPage = () => {
    const [rules, setRules] = useState({
        title: '',
        content: ''
    });
    const [currentRules, setCurrentRules] = useState(null);
    const [rulesHistory, setRulesHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Get auth token
    const getAuthToken = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token;
    };

    // Show snackbar
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    // Load current rules
    const loadCurrentRules = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/forum-rules`);
            if (response.data.success) {
                const currentData = response.data.data;
                setCurrentRules(currentData);
                setRules({
                    title: currentData.title,
                    content: currentData.content
                });
            }
        } catch (error) {
            console.error('Error loading current rules:', error);
            showSnackbar('Lỗi khi tải quy định hiện tại', 'error');
        }
    };

    // Load rules history
    const loadRulesHistory = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/forum-rules/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRulesHistory(response.data.data);
            }
        } catch (error) {
            console.error('Error loading rules history:', error);
            showSnackbar('Lỗi khi tải lịch sử quy định', 'error');
        }
    };

    // Save rules
    const saveRules = async () => {
        if (!rules.title.trim() || !rules.content.trim()) {
            showSnackbar('Vui lòng nhập đầy đủ tiêu đề và nội dung', 'error');
            return;
        }

        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await axios.put(`${API_BASE_URL}/forum-rules`, rules, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                showSnackbar('Cập nhật quy định thành công');
                loadCurrentRules();
                loadRulesHistory();
            }
        } catch (error) {
            console.error('Error saving rules:', error);
            showSnackbar('Lỗi khi lưu quy định', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        loadCurrentRules();
        loadRulesHistory();
    }, []);

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Quản lý Quy định Diễn đàn
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Tùy chỉnh quy định và điều khoản sử dụng diễn đàn
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Main Content */}
                <Box sx={{ flex: 1 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                {previewMode ? 'Xem trước' : 'Chỉnh sửa quy định'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant={previewMode ? 'contained' : 'outlined'}
                                    startIcon={<PreviewIcon />}
                                    onClick={() => setPreviewMode(!previewMode)}
                                >
                                    {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={saveRules}
                                    disabled={loading || previewMode}
                                >
                                    {loading ? <CircularProgress size={20} /> : 'Lưu'}
                                </Button>
                            </Box>
                        </Box>

                        {!previewMode ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Tiêu đề quy định"
                                    value={rules.title}
                                    onChange={(e) => setRules({ ...rules, title: e.target.value })}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Nội dung quy định (Markdown)"
                                    multiline
                                    rows={20}
                                    value={rules.content}
                                    onChange={(e) => setRules({ ...rules, content: e.target.value })}
                                    variant="outlined"
                                    helperText="Hỗ trợ Markdown: **bold**, *italic*, # heading, - list, etc."
                                />
                            </Box>
                        ) : (
                            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 3, minHeight: 400 }}>
                                <Typography variant="h5" gutterBottom>
                                    {rules.title}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <ReactMarkdown>{rules.content}</ReactMarkdown>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Sidebar */}
                <Box sx={{ width: 350 }}>
                    {/* Current Rules Info */}
                    {currentRules && (
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Quy định hiện tại
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Phiên bản:
                                        </Typography>
                                        <Chip label={`v${currentRules.version}`} size="small" color="primary" />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Cập nhật:
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(currentRules.updatedAt).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Trạng thái:
                                        </Typography>
                                        <Chip 
                                            label={currentRules.isActive ? 'Đang áp dụng' : 'Không áp dụng'} 
                                            size="small" 
                                            color={currentRules.isActive ? 'success' : 'default'} 
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rules History */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Lịch sử phiên bản
                                </Typography>
                                <IconButton onClick={() => setShowHistory(!showHistory)}>
                                    <HistoryIcon />
                                </IconButton>
                            </Box>
                            
                            {showHistory && (
                                <List dense>
                                    {rulesHistory.map((rule, index) => (
                                        <ListItem key={rule._id} divider={index < rulesHistory.length - 1}>
                                            <ListItemText
                                                primary={`v${rule.version} - ${rule.title}`}
                                                secondary={new Date(rule.createdAt).toLocaleDateString('vi-VN')}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setRules({
                                                            title: rule.title,
                                                            content: rule.content
                                                        });
                                                        showSnackbar(`Đã tải phiên bản v${rule.version}`);
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>

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

export default AdminForumRulesPage;
