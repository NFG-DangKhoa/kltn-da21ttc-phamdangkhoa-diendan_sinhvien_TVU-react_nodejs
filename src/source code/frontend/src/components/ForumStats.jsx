import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, useTheme } from '@mui/material';
import { ArticleOutlined, PeopleAltOutlined, FavoriteBorderOutlined } from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext'; // Import ThemeContext

const ForumStats = () => {
    const [stats, setStats] = useState({
        postCount: 0,
        userCount: 0,
        interactionCount: 0,
        loading: true,
        error: null,
    });

    const theme = useTheme();
    const { mode } = useContext(ThemeContext); // Lấy mode từ ThemeContext

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
                    color: mode === 'dark' ? '#ffffff' : 'text.primary', // Sử dụng mode từ context
                    mb: 4,
                }}
            >
                {/* Bạn có thể thêm tiêu đề ở đây nếu muốn, ví dụ: "Thống kê diễn đàn" */}
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
                                boxShadow: mode === 'dark' ? '0px 8px 20px rgba(0,0,0,0.6)' : '0px 8px 20px rgba(0,0,0,0.1)', // Sử dụng mode
                                backgroundColor: mode === 'dark' ? '#2e2e2e' : '#ffffff', // Sử dụng mode
                                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: mode === 'dark' ? '0px 12px 25px rgba(0,0,0,0.8)' : '0px 12px 25px rgba(0,0,0,0.2)', // Sử dụng mode
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
                                    color: mode === 'dark' ? '#e0e0e0' : 'text.primary', // Sử dụng mode
                                }}
                            >
                                {item.count}
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                color={mode === 'dark' ? '#bdbdbd' : 'text.secondary'} // Sử dụng mode
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