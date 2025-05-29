// src/components/ProfileHeader.js
import React from 'react';
import { Box, Typography, Avatar, Button, useTheme } from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const ProfileHeader = ({ userData }) => {
    const theme = useTheme();

    // Định dạng ngày tham gia
    const joinedDate = new Date(userData.joinedDate).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

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
            {/* Cover Photo */}
            <Box
                sx={{
                    height: { xs: 150, sm: 200, md: 250 },
                    backgroundImage: `url(${userData.coverPhotoUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: theme.palette.action.disabledBackground, // Màu nền dự phòng nếu ảnh lỗi
                }}
            />

            {/* Profile Picture and Info */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'center', md: 'flex-end' },
                    p: { xs: 2, md: 3 },
                    mt: { xs: -8, md: -10 }, // Di chuyển avatar lên trên ảnh bìa
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <Avatar
                    alt={userData.fullName}
                    src={userData.avatarUrl}
                    sx={{
                        width: { xs: 120, sm: 150, md: 180 },
                        height: { xs: 120, sm: 150, md: 180 },
                        border: `4px solid ${theme.palette.background.paper}`,
                        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 4px 10px rgba(0,0,0,0.1)',
                        zIndex: 2,
                        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                    }}
                />
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
                        {userData.fullName}
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
                        {userData.bio}
                    </Typography>

                    {/* Quick Stats */}
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
                            <Typography variant="body2">{userData.postsCount} Bài viết</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{userData.commentsCount} Bình luận</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <FavoriteBorderIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{userData.likesReceived} Lượt thích nhận được</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <CakeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Tham gia từ: {joinedDate}</Typography>
                        </Box>
                    </Box>
                </Box>
                {/* Edit Profile Button (For current user) */}
                <Box
                    sx={{
                        mt: { xs: 2, md: 0 },
                        ml: { xs: 0, md: 'auto' }, // Đẩy nút sang phải trên desktop
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 5,
                            minWidth: 150,
                            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 2px 5px rgba(0,0,0,0.2)',
                            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                        }}
                    >
                        Chỉnh sửa hồ sơ
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default ProfileHeader;