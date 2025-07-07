import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import axios from 'axios';

const constructUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

const AdminRatingDialog = ({ open, onClose, postId }) => {
    const [ratedUsers, setRatedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAuthToken = () => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined') {
            return token;
        }
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.token && user.token !== 'undefined') {
            return user.token;
        }
        return null;
    };

    const fetchRatedUsers = async () => {
        if (!postId) return;

        setLoading(true);
        setError(null);

        try {
            const token = getAuthToken();
            const response = await axios.get(`http://localhost:5000/api/admin/ratings/post/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const users = response.data.data.map(rating => rating.userId).filter(user => user);
            setRatedUsers(users);
        } catch (error) {
            console.error('Error fetching rated users:', error);
            setError('Không thể tải danh sách người đánh giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && postId) {
            fetchRatedUsers();
        }
    }, [open, postId]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    backgroundColor: '#ffffff',
                    color: '#1c1e21',
                    borderRadius: '10px',
                },
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1,
                borderBottom: '1px solid #e4e6ea'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Người đã đánh giá
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{
                p: 0,
                maxHeight: '400px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#ccc',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f0f0f0',
                },
            }}>
                {loading ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <CircularProgress size={24} />
                        <Typography sx={{ mt: 1, color: '#65676b' }}>
                            Đang tải...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography sx={{ color: '#f02849' }}>
                            {error}
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ pt: 0, pb: 0 }}>
                        {ratedUsers && ratedUsers.length > 0 ? (
                            ratedUsers.map((user) => (
                                <ListItem
                                    key={user._id}
                                    component={Link}
                                    to={`/profile/${user._id}`}
                                    sx={{
                                        py: 1,
                                        px: 2,
                                        '&:hover': {
                                            backgroundColor: '#f0f2f5',
                                        },
                                        textDecoration: 'none',
                                    }}
                                >
                                    <Avatar
                                        src={constructUrl(user.avatarUrl || user.profilePicture)}
                                        alt={user.fullName}
                                        sx={{ width: 40, height: 40, mr: 2 }}
                                    >
                                        {user.fullName ? user.fullName.charAt(0) : '?'}
                                    </Avatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1" sx={{ color: '#1c1e21', fontWeight: 600 }}>
                                                {user.fullName}
                                            </Typography>
                                        }
                                        secondary={
                                            user.username && (
                                                <Typography variant="body2" sx={{ color: '#65676b' }}>
                                                    @{user.username}
                                                </Typography>
                                            )
                                        }
                                    />
                                </ListItem>
                            ))
                        ) : (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography sx={{ color: '#65676b' }}>
                                    Chưa có ai đánh giá bài viết này.
                                </Typography>
                            </Box>
                        )}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AdminRatingDialog;
