// filepath: d:\HỌC CNTT\HK2 2024-2025\KHÓA LUẬN TỐT NGHIỆP\DU AN\hilu-auau\frontend\src\pages\profile\ProfileHeader.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const ProfileHeader = ({ userData, isCurrentUser, onProfileUpdate }) => {
    const theme = useTheme();
    const [openEdit, setOpenEdit] = useState(false);
    const [form, setForm] = useState({
        fullName: userData.fullName || '',
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl || ''
    });
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        postCount: 0,
        commentCount: 0,
        likeCount: 0
    });

    const joinedDate = new Date(userData.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }); useEffect(() => {
        const fetchCounts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };

                const response = await axios.get(
                    `http://localhost:5000/api/users/stats/${userData._id}`,
                    config
                );
                setStats(response.data);

            } catch (error) {
                console.error("Error fetching counts:", error);
            }
        };

        if (userData && userData._id) {
            fetchCounts();
        }
    }, [userData]);

    const handleOpenEdit = () => setOpenEdit(true);
    const handleCloseEdit = () => setOpenEdit(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put('http://localhost:5000/api/users/me', form, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (onProfileUpdate) onProfileUpdate(form);
            setOpenEdit(false);
        } catch (err) {
            alert('Cập nhật thất bại!');
        }
        setLoading(false);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 4,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 2px 8px rgba(0,0,0,0.05)',
                transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
            }}
        >
            {/* Ảnh bìa với gradient overlay */}
            <Box
                sx={{
                    height: { xs: 180, sm: 220, md: 280 },
                    background: userData.coverPhotoUrl
                        ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${userData.coverPhotoUrl})`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
                        pointerEvents: 'none'
                    }
                }}
            >
                {/* Decorative elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <Box
                        sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.3)',
                        }}
                    />
                </Box>
            </Box>

            {/* Avatar và thông tin */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'center', md: 'flex-end' },
                    p: { xs: 2, md: 3 },
                    mt: { xs: -8, md: -10 },
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Avatar với hiệu ứng đẹp */}
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        alt={userData.fullName}
                        src={userData.avatarUrl || '/admin-avatar.png'}
                        sx={{
                            width: { xs: 140, sm: 160, md: 180 },
                            height: { xs: 140, sm: 160, md: 180 },
                            border: `6px solid ${theme.palette.background.paper}`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            zIndex: 2,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                            },
                        }}
                    />
                    {/* Online status indicator */}
                    {userData.isOnline && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: '#4CAF50',
                                border: `4px solid ${theme.palette.background.paper}`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                zIndex: 3,
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '60%',
                                    height: '60%',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                }
                            }}
                        />
                    )}
                </Box>
                <Box
                    sx={{
                        ml: { xs: 0, md: 3 },
                        mt: { xs: 2, md: 0 },
                        textAlign: { xs: 'center', md: 'left' },
                        flexGrow: 1,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            color: theme.palette.text.primary,
                            transition: 'color 0.4s ease',
                        }}
                    >
                        {userData.fullName || userData.username}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: theme.palette.text.secondary,
                            mb: 1,
                            transition: 'color 0.4s ease',
                        }}
                    >
                        @{userData.username}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme.palette.text.secondary,
                            transition: 'color 0.4s ease',
                        }}
                    >
                        {userData.bio || "Chưa có mô tả"}
                    </Typography>

                    {/* Thống kê nhanh */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: { xs: 'center', md: 'flex-start' },
                            gap: { xs: 2, sm: 4 },
                            mt: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <PostAddIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{stats.postCount} Bài viết</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{stats.commentCount} Bình luận</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <FavoriteBorderIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{stats.likeCount} Lượt thích</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <CakeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Tham gia: {joinedDate}</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Nút chỉnh sửa (chỉ hiện nếu là trang của mình) */}
                {isCurrentUser && (
                    <Box
                        sx={{
                            mt: { xs: 2, md: 0 },
                            ml: { xs: 0, md: 'auto' },
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            sx={{
                                px: 3,
                                py: 1,
                                borderRadius: 5,
                                minWidth: 150,
                                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 2px 5px rgba(0,0,0,0.2)',
                                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                            }}
                            onClick={handleOpenEdit}
                        >
                            Chỉnh sửa
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Dialog chỉnh sửa */}
            <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
                <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        label="Họ tên"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        margin="normal"
                        label="Mô tả bản thân"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <TextField
                        margin="normal"
                        label="Link ảnh đại diện"
                        name="avatarUrl"
                        value={form.avatarUrl}
                        onChange={handleChange}
                        fullWidth
                        helperText="Dán link ảnh hoặc để trống để dùng mặc định"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit}>Hủy</Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : "Lưu"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfileHeader;
