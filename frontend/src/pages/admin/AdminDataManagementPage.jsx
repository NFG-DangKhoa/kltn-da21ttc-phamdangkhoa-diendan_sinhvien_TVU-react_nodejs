import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
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
    LinearProgress,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    CloudDownload as ExportIcon,
    CloudUpload as ImportIcon,
    Backup as BackupIcon,
    Restore as RestoreIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    GetApp as DownloadIcon,
    Publish as UploadIcon,
    Storage as DatabaseIcon,
    Assessment as ReportIcon,
    Schedule as ScheduleIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon
} from '@mui/icons-material';
// Removed DatePicker imports to avoid dependency issues
import api from '../../services/api';

const AdminDataManagementPage = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [exportHistory, setExportHistory] = useState([]);
    const [importHistory, setImportHistory] = useState([]);
    const [backups, setBackups] = useState([]);

    // Dialog states
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [openBackupDialog, setOpenBackupDialog] = useState(false);

    // Form states
    const [exportForm, setExportForm] = useState({
        dataType: 'users',
        format: 'excel',
        dateFrom: null,
        dateTo: null,
        includeDeleted: false
    });

    const [importForm, setImportForm] = useState({
        dataType: 'users',
        file: null,
        updateExisting: false,
        validateOnly: false
    });

    // Progress and status
    const [progress, setProgress] = useState(0);
    const [currentOperation, setCurrentOperation] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchStats();
        fetchExportHistory();
        fetchImportHistory();
        fetchBackups();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/data/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchExportHistory = async () => {
        try {
            const response = await api.get('/admin/data/exports');
            setExportHistory(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error('Error fetching export history:', error);
            setExportHistory([]);
        }
    };

    const fetchImportHistory = async () => {
        try {
            const response = await api.get('/admin/data/imports');
            setImportHistory(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error('Error fetching import history:', error);
            setImportHistory([]);
        }
    };

    const fetchBackups = async () => {
        try {
            const response = await api.get('/admin/data/backups');
            setBackups(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error('Error fetching backups:', error);
            setBackups([]);
        }
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            setCurrentOperation('Đang xuất dữ liệu...');
            setProgress(0);

            const response = await api.post('/admin/data/export', exportForm, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const extension = exportForm.format === 'excel' ? 'xlsx' : 'csv';
            const filename = `${exportForm.dataType}_export_${new Date().toISOString().split('T')[0]}.${extension}`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showSnackbar('Xuất dữ liệu thành công!', 'success');
            setOpenExportDialog(false);
            fetchExportHistory();
        } catch (error) {
            console.error('Error exporting data:', error);
            showSnackbar('Lỗi khi xuất dữ liệu', 'error');
        } finally {
            setLoading(false);
            setProgress(0);
            setCurrentOperation('');
        }
    };

    const handleImport = async () => {
        if (!importForm.file) {
            showSnackbar('Vui lòng chọn file để import', 'warning');
            return;
        }

        try {
            setLoading(true);
            setCurrentOperation('Đang import dữ liệu...');
            setProgress(0);

            const formData = new FormData();
            formData.append('file', importForm.file);
            formData.append('dataType', importForm.dataType);
            formData.append('updateExisting', importForm.updateExisting);
            formData.append('validateOnly', importForm.validateOnly);

            const response = await api.post('/admin/data/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            showSnackbar(
                importForm.validateOnly
                    ? 'Validation hoàn tất! Kiểm tra kết quả.'
                    : 'Import dữ liệu thành công!',
                'success'
            );

            setOpenImportDialog(false);
            fetchImportHistory();
            fetchStats();
        } catch (error) {
            console.error('Error importing data:', error);
            showSnackbar('Lỗi khi import dữ liệu', 'error');
        } finally {
            setLoading(false);
            setProgress(0);
            setCurrentOperation('');
        }
    };

    const handleBackup = async () => {
        try {
            setLoading(true);
            setCurrentOperation('Đang tạo backup...');
            setProgress(0);

            await api.post('/admin/data/backup');

            showSnackbar('Tạo backup thành công!', 'success');
            setOpenBackupDialog(false);
            fetchBackups();
        } catch (error) {
            console.error('Error creating backup:', error);
            showSnackbar('Lỗi khi tạo backup', 'error');
        } finally {
            setLoading(false);
            setProgress(0);
            setCurrentOperation('');
        }
    };

    const handleRestore = async (backupId) => {
        if (!window.confirm('Bạn có chắc chắn muốn khôi phục từ backup này? Dữ liệu hiện tại sẽ bị ghi đè.')) {
            return;
        }

        try {
            setLoading(true);
            setCurrentOperation('Đang khôi phục dữ liệu...');

            await api.post(`/admin/data/restore/${backupId}`);

            showSnackbar('Khôi phục dữ liệu thành công!', 'success');
            fetchStats();
        } catch (error) {
            console.error('Error restoring backup:', error);
            showSnackbar('Lỗi khi khôi phục dữ liệu', 'error');
        } finally {
            setLoading(false);
            setCurrentOperation('');
        }
    };

    const handleDeleteBackup = async (backupId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa backup này?')) {
            return;
        }

        try {
            await api.delete(`/admin/data/backups/${backupId}`);
            showSnackbar('Xóa backup thành công!', 'success');
            fetchBackups();
        } catch (error) {
            console.error('Error deleting backup:', error);
            showSnackbar('Lỗi khi xóa backup', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <SuccessIcon color="success" />;
            case 'error': return <ErrorIcon color="error" />;
            case 'warning': return <WarningIcon color="warning" />;
            default: return <InfoIcon color="info" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Quản lý Dữ liệu
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                        fetchStats();
                        fetchExportHistory();
                        fetchImportHistory();
                        fetchBackups();
                    }}
                >
                    Làm mới
                </Button>
            </Box>

            {/* Progress Bar */}
            {loading && (
                <Box mb={3}>
                    <Typography variant="body2" gutterBottom>
                        {currentOperation}
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="caption" color="text.secondary">
                        {progress}%
                    </Typography>
                </Box>
            )}

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <DatabaseIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h4" color="primary">
                                    {stats.totalRecords}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Tổng bản ghi
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <ExportIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                <Typography variant="h4" color="success.main">
                                    {stats.totalExports}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Lần xuất dữ liệu
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <ImportIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                <Typography variant="h4" color="warning.main">
                                    {stats.totalImports}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Lần nhập dữ liệu
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <BackupIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                                <Typography variant="h4" color="info.main">
                                    {stats.totalBackups}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Backup có sẵn
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Action Cards */}
            <Grid container spacing={3} mb={4}>
                {/* Export Data Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <ExportIcon sx={{ fontSize: 32, color: 'success.main', mr: 1 }} />
                                <Typography variant="h6">Xuất Dữ liệu</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Xuất dữ liệu ra file Excel hoặc CSV để phân tích hoặc backup.
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText primary="• Người dùng" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Bài viết" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Bình luận" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Chủ đề" />
                                </ListItem>
                            </List>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<DownloadIcon />}
                                onClick={() => setOpenExportDialog(true)}
                                fullWidth
                            >
                                Xuất dữ liệu
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Import Data Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <ImportIcon sx={{ fontSize: 32, color: 'warning.main', mr: 1 }} />
                                <Typography variant="h6">Nhập Dữ liệu</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Nhập dữ liệu từ file Excel hoặc CSV vào hệ thống.
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText primary="• Validation tự động" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Cập nhật dữ liệu có sẵn" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Báo cáo lỗi chi tiết" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Rollback khi có lỗi" />
                                </ListItem>
                            </List>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<UploadIcon />}
                                onClick={() => setOpenImportDialog(true)}
                                fullWidth
                            >
                                Nhập dữ liệu
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Backup & Restore Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <BackupIcon sx={{ fontSize: 32, color: 'info.main', mr: 1 }} />
                                <Typography variant="h6">Backup & Khôi phục</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Tạo backup toàn bộ database và khôi phục khi cần thiết.
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText primary="• Backup tự động hàng ngày" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Backup thủ công" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Khôi phục nhanh chóng" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Quản lý backup cũ" />
                                </ListItem>
                            </List>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                color="info"
                                startIcon={<BackupIcon />}
                                onClick={() => setOpenBackupDialog(true)}
                                fullWidth
                            >
                                Tạo Backup
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Activities */}
            <Grid container spacing={3}>
                {/* Export History */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Lịch sử Xuất dữ liệu
                        </Typography>
                        <TableContainer sx={{ maxHeight: 300 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Loại</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell>Ngày</TableCell>
                                        <TableCell>Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Array.isArray(exportHistory) && exportHistory.slice(0, 5).map((item) => (
                                        <TableRow key={item._id || Math.random()}>
                                            <TableCell>{item.dataType || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getStatusIcon(item.status)}
                                                    <Chip
                                                        label={item.status || 'unknown'}
                                                        size="small"
                                                        color={item.status === 'success' ? 'success' : 'error'}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {item.downloadUrl && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => window.open(item.downloadUrl)}
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!Array.isArray(exportHistory) || exportHistory.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                Chưa có lịch sử export
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Backup List */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Danh sách Backup
                        </Typography>
                        <TableContainer sx={{ maxHeight: 300 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tên</TableCell>
                                        <TableCell>Kích thước</TableCell>
                                        <TableCell>Ngày</TableCell>
                                        <TableCell>Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Array.isArray(backups) && backups.slice(0, 5).map((backup) => (
                                        <TableRow key={backup._id || Math.random()}>
                                            <TableCell>{backup.name || 'N/A'}</TableCell>
                                            <TableCell>{backup.size ? formatFileSize(backup.size) : 'N/A'}</TableCell>
                                            <TableCell>
                                                {backup.createdAt ? new Date(backup.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Tooltip title="Khôi phục">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleRestore(backup._id)}
                                                        >
                                                            <RestoreIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteBackup(backup._id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!Array.isArray(backups) || backups.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                Chưa có backup nào
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Export Dialog */}
            <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Xuất Dữ liệu</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Loại dữ liệu</InputLabel>
                                <Select
                                    value={exportForm.dataType}
                                    onChange={(e) => setExportForm({ ...exportForm, dataType: e.target.value })}
                                >
                                    <MenuItem value="users">Người dùng</MenuItem>
                                    <MenuItem value="posts">Bài viết</MenuItem>
                                    <MenuItem value="comments">Bình luận</MenuItem>
                                    <MenuItem value="topics">Chủ đề</MenuItem>
                                    <MenuItem value="all">Tất cả</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Định dạng</InputLabel>
                                <Select
                                    value={exportForm.format}
                                    onChange={(e) => setExportForm({ ...exportForm, format: e.target.value })}
                                >
                                    <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                                    <MenuItem value="csv">CSV (.csv)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Từ ngày"
                                type="date"
                                value={exportForm.dateFrom ? new Date(exportForm.dateFrom).toISOString().slice(0, 10) : ''}
                                onChange={(e) => setExportForm({ ...exportForm, dateFrom: e.target.value ? new Date(e.target.value) : null })}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Đến ngày"
                                type="date"
                                value={exportForm.dateTo ? new Date(exportForm.dateTo).toISOString().slice(0, 10) : ''}
                                onChange={(e) => setExportForm({ ...exportForm, dateTo: e.target.value ? new Date(e.target.value) : null })}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenExportDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleExport}
                        variant="contained"
                        disabled={loading}
                        startIcon={<ExportIcon />}
                    >
                        Xuất dữ liệu
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nhập Dữ liệu</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Loại dữ liệu</InputLabel>
                                <Select
                                    value={importForm.dataType}
                                    onChange={(e) => setImportForm({ ...importForm, dataType: e.target.value })}
                                >
                                    <MenuItem value="users">Người dùng</MenuItem>
                                    <MenuItem value="posts">Bài viết</MenuItem>
                                    <MenuItem value="comments">Bình luận</MenuItem>
                                    <MenuItem value="topics">Chủ đề</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => setImportForm({ ...importForm, file: e.target.files[0] })}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenImportDialog(false)}>Hủy</Button>
                    <Button
                        onClick={() => setImportForm({ ...importForm, validateOnly: true })}
                        variant="outlined"
                        disabled={loading || !importForm.file}
                    >
                        Chỉ kiểm tra
                    </Button>
                    <Button
                        onClick={handleImport}
                        variant="contained"
                        disabled={loading || !importForm.file}
                        startIcon={<ImportIcon />}
                    >
                        Nhập dữ liệu
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Backup Dialog */}
            <Dialog open={openBackupDialog} onClose={() => setOpenBackupDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Tạo Backup</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Bạn có muốn tạo backup toàn bộ database không?
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Quá trình backup có thể mất vài phút tùy thuộc vào kích thước dữ liệu.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBackupDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleBackup}
                        variant="contained"
                        disabled={loading}
                        startIcon={<BackupIcon />}
                    >
                        Tạo Backup
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
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminDataManagementPage;
