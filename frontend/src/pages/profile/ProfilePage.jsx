// src/components/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Tabs, Tab, CircularProgress, Alert, useTheme } from '@mui/material';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import UserActivity from './UserActivity';

const ProfilePage = ({ userId = 'mockUser123' }) => { // Mặc định userId cho ví dụ
    const theme = useTheme();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState(0); // 0: Posts, 1: Comments, 2: Likes, 3: Activity

    // Dữ liệu người dùng giả lập
    const mockUserData = {
        id: 'mockUser123',
        fullName: 'Lê Văn A',
        username: 'levana_dev',
        bio: 'Chào mừng đến với trang cá nhân của tôi! Tôi là một nhà phát triển web đam mê công nghệ và chia sẻ kiến thức, đặc biệt là về React và Next.js.',
        location: 'Trà Vinh, Việt Nam',
        occupation: 'Frontend Developer',
        website: 'https://levana.dev',
        socialLinks: { github: 'https://github.com/levana_dev', linkedin: 'https://linkedin.com/in/levana_dev', twitter: 'https://twitter.com/levana_dev' },
        avatarUrl: 'https://i.pravatar.cc/300?img=68', // Ảnh đại diện ngẫu nhiên
        coverPhotoUrl: 'https://source.unsplash.com/random/1200x300/?code,programming', // Ảnh bìa ngẫu nhiên về code
        postsCount: 150,
        commentsCount: 320,
        likesReceived: 1200,
        joinedDate: '2023-01-15',
        badges: [{ name: 'Top Contributor', icon: '🏆' }, { name: 'Helpful User', icon: '🤝' }, { name: 'Early Adopter', icon: '🌟' }]
    };

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Simulate API call to fetch user data
        setTimeout(() => {
            try {
                // In a real app, you'd fetch from an API:
                // const response = await axios.get(`/api/users/${userId}`);
                // setUserData(response.data);
                setUserData(mockUserData);
            } catch (err) {
                setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 800); // Simulate network delay
    }, [userId]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ backgroundColor: theme.palette.background.default }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ backgroundColor: theme.palette.background.default }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!userData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ backgroundColor: theme.palette.background.default }}>
                <Typography variant="h6" color="text.secondary">Không tìm thấy người dùng.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 2, md: 3 }, // Padding responsive
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            minHeight: '100vh',
            transition: 'background-color 0.4s ease, color 0.4s ease',
        }}>
            {/* Header / Banner Section */}
            <ProfileHeader userData={userData} />

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* Left Column - User Info & Navigation */}
                <Grid item xs={12} md={4} lg={3}>
                    <ProfileInfo userData={userData} />
                </Grid>

                {/* Center Column - Main Activity */}
                <Grid item xs={12} md={8} lg={9}> {/* Tăng chiều rộng cột giữa để đủ chỗ cho tab */}
                    <Paper
                        sx={{
                            p: { xs: 1, sm: 2, md: 3 },
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 2px 8px rgba(0,0,0,0.05)',
                            borderRadius: 2,
                            transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                            minHeight: '600px'
                        }}
                    >
                        {/* Tab Navigation for Activity */}
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            aria-label="User activity tabs"
                            variant="scrollable" // Cho phép cuộn trên màn hình nhỏ
                            scrollButtons="auto"
                            sx={{
                                borderBottom: 1,
                                borderColor: theme.palette.divider,
                                mb: 2,
                                '& .MuiTabs-indicator': {
                                    backgroundColor: theme.palette.primary.main,
                                },
                            }}
                        >
                            <Tab label="Bài viết" />
                            <Tab label="Bình luận" />
                            <Tab label="Lượt thích" />
                            <Tab label="Hoạt động" />
                        </Tabs>

                        {/* Content based on selected tab */}
                        <UserActivity currentTab={currentTab} userId={userId} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfilePage;