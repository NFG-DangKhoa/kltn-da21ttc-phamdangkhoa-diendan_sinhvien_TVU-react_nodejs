// LikeDialog.js
import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton,
    List, ListItem, ListItemText, Avatar, Box, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';

// Helper function to construct full URL for images
const constructUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

const LikeDialog = ({ open, onClose, likedUsers, likeCount, darkMode }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    // Áp dụng màu nền và chữ dựa trên darkMode
                    backgroundColor: darkMode ? '#3a3b3c' : '#ffffff',
                    color: darkMode ? '#e4e6eb' : '#1c1e21',
                    borderRadius: '10px',
                },
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: darkMode ? '1px solid #444' : '1px solid #eee',
                pb: 1, // Padding bottom
                color: darkMode ? '#e4e6eb' : '#1c1e21',
            }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Người đã thích ({likeCount || 0}) {/* Hiển thị tổng số lượt thích */}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: darkMode ? '#b0b3b8' : '#65676b',
                        // Bỏ position: 'absolute' vì đã dùng flexbox để căn chỉnh
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{
                p: 0, // Bỏ padding mặc định của DialogContent
                // Custom scrollbar cho Dark Mode
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: darkMode ? '#555' : '#ccc',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: darkMode ? '#222' : '#f0f0f0',
                },
            }}>
                <List sx={{ pt: 0, pb: 0 }}> {/* Bỏ padding mặc định của List */}
                    {likedUsers && likedUsers.length > 0 ? (
                        likedUsers.map((user) => (
                            <ListItem
                                key={user._id}
                                component={Link}
                                to={`/profile/${user._id}`}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: darkMode ? '#4e4f50' : '#f0f2f5',
                                    },
                                    textDecoration: 'none', // Remove underline from link
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
                                        <Typography variant="body1" sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21', fontWeight: 600 }}>
                                            {user.fullName}
                                        </Typography>
                                    }
                                    secondary={
                                        user.username && (
                                            <Typography variant="body2" sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>
                                                @{user.username}
                                            </Typography>
                                        )
                                    }
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>
                                Chưa có ai thích bài viết này.
                            </Typography>
                        </Box>
                    )}
                </List>
            </DialogContent>
        </Dialog>
    );
};

export default LikeDialog;
