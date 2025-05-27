import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, useTheme } from '@mui/material';
import { ArticleOutlined, PeopleAltOutlined, FavoriteBorderOutlined } from '@mui/icons-material';
// Không cần import axios nếu bạn chỉ dùng dữ liệu ảo và không gọi API thực tế
// import axios from 'axios'; 

const ForumStats = ({ darkMode }) => {
    const [stats, setStats] = useState({
        postCount: 0,
        userCount: 0,
        interactionCount: 0,
        loading: true,
        error: null,
    });

    const theme = useTheme();

    useEffect(() => {
        const fetchMockStats = () => {
            // Giả lập thời gian tải dữ liệu (ví dụ: 1 giây)
            setTimeout(() => {
                setStats({
                    postCount: 520, // Số lượng bài viết ảo
                    userCount: 1850, // Số lượng thành viên ảo
                    interactionCount: 7890, // Số lượng tương tác ảo
                    loading: false,
                    error: null,
                });
            }, 1000); // Tải sau 1 giây
        };

        fetchMockStats();
    }, []);

    const statItems = [
        { name: 'Bài viết', count: stats.postCount, icon: <ArticleOutlined sx={{ fontSize: 40, color: theme.palette.primary.main }} /> },
        { name: 'Thành viên', count: stats.userCount, icon: <PeopleAltOutlined sx={{ fontSize: 40, color: theme.palette.success.main }} /> },
        { name: 'Tương tác', count: stats.interactionCount, icon: <FavoriteBorderOutlined sx={{ fontSize: 40, color: theme.palette.error.main }} /> },
    ];

    if (stats.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (stats.error) {
        return (
            <Typography color="error" align="center" sx={{ my: 4 }}>
                {stats.error}
            </Typography>
        );
    }

    return (
        <Box sx={{ my: 6 }}>
            <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{
                    fontWeight: 700,
                    color: darkMode ? '#ffffff' : 'text.primary',
                    mb: 4,
                }}
            >
            </Typography>
            <Grid container spacing={4} justifyContent="center">
                {statItems.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                p: 3,
                                borderRadius: '16px',
                                boxShadow: darkMode ? '0px 8px 20px rgba(0,0,0,0.6)' : '0px 8px 20px rgba(0,0,0,0.1)',
                                backgroundColor: darkMode ? '#2e2e2e' : '#ffffff',
                                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: darkMode ? '0px 12px 25px rgba(0,0,0,0.8)' : '0px 12px 25px rgba(0,0,0,0.2)',
                                },
                            }}
                        >
                            <Box sx={{ mb: 2 }}>
                                {item.icon}
                            </Box>
                            <Typography
                                variant="h4"
                                component="div"
                                sx={{
                                    fontWeight: 700,
                                    color: darkMode ? '#e0e0e0' : 'text.primary',
                                }}
                            >
                                {item.count}
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                color={darkMode ? '#bdbdbd' : 'text.secondary'}
                                sx={{ mt: 0.5 }}
                            >
                                {item.name}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ForumStats;