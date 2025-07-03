import React, { useState } from 'react';
import { Box, Typography, FormGroup, FormControlLabel, Switch, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const ActivityVisibilitySettings = ({ initialSettings, onSettingsChange }) => {
    const [settings, setSettings] = useState(initialSettings || { posts: true, comments: true, likes: true });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (event) => {
        setSettings({
            ...settings,
            [event.target.name]: event.target.checked,
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5000/api/users/me/activity-visibility',
                settings,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onSettingsChange(response.data.activityVisibility);
            setSuccess('Cập nhật cài đặt thành công!');
        } catch (err) {
            console.error('Error updating visibility settings:', err);
            setError(err.response?.data?.message || 'Không thể cập nhật cài đặt. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                Cài đặt hiển thị hoạt động
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Chọn các tab hoạt động bạn muốn hiển thị công khai trên trang cá nhân của mình.
            </Typography>
            <FormGroup>
                <FormControlLabel
                    control={<Switch checked={settings.posts} onChange={handleChange} name="posts" />}
                    label="Hiển thị tab Bài viết"
                />
                <FormControlLabel
                    control={<Switch checked={settings.comments} onChange={handleChange} name="comments" />}
                    label="Hiển thị tab Bình luận"
                />
                <FormControlLabel
                    control={<Switch checked={settings.likes} onChange={handleChange} name="likes" />}
                    label="Hiển thị tab Lượt thích"
                />
            </FormGroup>
            <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ mt: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
            </Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </Box>
    );
};

export default ActivityVisibilitySettings;
