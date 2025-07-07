import React, { useState, useEffect } from 'react';
import { getMarquees, createMarquee, updateMarquee, deleteMarquee, setActiveMarquee, deactivateMarquee } from '../../services/marqueeService';
import {
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Paper,
    Box,
    Switch,
    Tooltip,
    Snackbar,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import { Edit, Delete, CheckCircle } from '@mui/icons-material';

const AdminMarqueePage = () => {
    const [marquees, setMarquees] = useState([]);
    const [newMarquee, setNewMarquee] = useState({ content: '', backgroundColor: '#ffffff' });
    const [editingMarquee, setEditingMarquee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchMarquees();
    }, []);

    const fetchMarquees = async () => {
        setLoading(true);
        try {
            const res = await getMarquees();
            setMarquees(res.data);
        } catch (error) {
            console.error('Error fetching marquees:', error);
            showSnackbar('Lỗi khi tải thông báo chạy', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newMarquee.content.trim()) {
            showSnackbar('Nội dung thông báo không được để trống', 'error');
            return;
        }
        setLoading(true);
        try {
            await createMarquee(newMarquee.content, newMarquee.backgroundColor);
            setNewMarquee({ content: '', backgroundColor: '#ffffff' });
            fetchMarquees();
            showSnackbar('Tạo thông báo chạy thành công!', 'success');
        } catch (error) {
            console.error('Error creating marquee:', error);
            showSnackbar('Lỗi khi tạo thông báo chạy', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingMarquee || !editingMarquee.content.trim()) {
            showSnackbar('Nội dung thông báo không được để trống', 'error');
            return;
        }
        setLoading(true);
        try {
            await updateMarquee(editingMarquee._id, editingMarquee.content, editingMarquee.backgroundColor);
            setEditingMarquee(null);
            fetchMarquees();
            showSnackbar('Cập nhật thông báo chạy thành công!', 'success');
        } catch (error) {
            console.error('Error updating marquee:', error);
            showSnackbar('Lỗi khi cập nhật thông báo chạy', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo chạy này?')) return;
        setLoading(true);
        try {
            await deleteMarquee(id);
            fetchMarquees();
            showSnackbar('Đã xóa thông báo chạy thành công!', 'success');
        } catch (error) {
            console.error('Error deleting marquee:', error);
            showSnackbar('Lỗi khi xóa thông báo chạy', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id, active) => {
        setLoading(true);
        try {
            if (active) {
                await deactivateMarquee(id);
                showSnackbar('Đã hủy kích hoạt thông báo chạy', 'success');
            } else {
                await setActiveMarquee(id);
                showSnackbar('Đã kích hoạt thông báo chạy', 'success');
            }
            fetchMarquees();
        } catch (error) {
            console.error('Error toggling marquee status:', error);
            showSnackbar('Lỗi khi thay đổi trạng thái thông báo chạy', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Quản lý thông báo chạy</Typography>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Tạo thông báo mới</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                        <TextField
                            fullWidth
                            label="Nội dung thông báo"
                            value={newMarquee.content}
                            onChange={(e) => setNewMarquee({ ...newMarquee, content: e.target.value })}
                            margin="normal"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            label="Màu nền"
                            type="color"
                            value={newMarquee.backgroundColor}
                            onChange={(e) => setNewMarquee({ ...newMarquee, backgroundColor: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ width: '100%' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            variant="contained"
                            onClick={handleCreate}
                            fullWidth
                            sx={{ height: '56px' }}
                            disabled={!newMarquee.content.trim() || loading}
                        >
                            Tạo
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {editingMarquee && (
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Chỉnh sửa thông báo</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Nội dung thông báo"
                                value={editingMarquee.content}
                                onChange={(e) => setEditingMarquee({ ...editingMarquee, content: e.target.value })}
                                margin="normal"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Màu nền"
                                type="color"
                                value={editingMarquee.backgroundColor}
                                onChange={(e) => setEditingMarquee({ ...editingMarquee, backgroundColor: e.target.value })}
                                margin="normal"
                                variant="outlined"
                                sx={{ width: '100%' }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button variant="contained" onClick={handleUpdate} sx={{ mr: 1, height: '56px' }} disabled={loading}>Lưu</Button>
                            <Button variant="outlined" onClick={() => setEditingMarquee(null)} fullWidth sx={{ height: '56px' }}>Hủy</Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Danh sách thông báo</Typography>
                {marquees.length === 0 && !loading ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        Chưa có thông báo chạy nào.
                    </Typography>
                ) : (
                    <List>
                        {marquees.map((marquee) => (
                            <ListItem
                                key={marquee._id}
                                divider
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    py: 1.5
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            bgcolor: marquee.backgroundColor,
                                            border: '1px solid #ccc',
                                            mr: 2,
                                            flexShrink: 0
                                        }}
                                    />
                                    <ListItemText
                                        primary={marquee.content}
                                        secondary={marquee.active ? "Đang hoạt động" : "Không hoạt động"}
                                        primaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                                        secondaryTypographyProps={{
                                            color: marquee.active ? 'success.main' : 'error.main',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Tooltip title={marquee.active ? "Hủy kích hoạt" : "Kích hoạt"}>
                                        <Switch
                                            checked={marquee.active}
                                            onChange={() => handleToggleActive(marquee._id, marquee.active)}
                                            color="primary"
                                            disabled={loading}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Chỉnh sửa">
                                        <IconButton onClick={() => setEditingMarquee(marquee)} disabled={loading}>
                                            <Edit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa">
                                        <IconButton onClick={() => handleDelete(marquee._id)} disabled={loading}>
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>

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
        </Box>
    );
};

export default AdminMarqueePage;
