import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Link, Divider, useTheme } from '@mui/material';
import { School, Info, Mail, Phone, LocationOn, Forum } from '@mui/icons-material';

const AboutSection = ({ darkMode }) => {
    const theme = useTheme();

    return (
        <Box
            mb={6}
            sx={{
                backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
                borderRadius: 3,
                p: 4,
                boxShadow: darkMode ? '0px 8px 20px rgba(0,0,0,0.5)' : '0px 8px 20px rgba(0,0,0,0.1)',
                transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
            }}
        >
            <Typography
                variant="h5"
                mb={3}
                sx={{
                    fontWeight: 700,
                    color: darkMode ? '#ffffff' : 'text.primary',
                    textAlign: 'center',
                    borderBottom: `2px solid ${darkMode ? '#424242' : '#e0e0e0'}`,
                    pb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Info sx={{ mr: 1, color: '#3f51b5' }} /> Về Diễn Đàn & Trường
            </Typography>

            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                {/* Thông tin về Diễn Đàn (Admin) */}
                <Grid item xs={12} sm={6} md={6}> {/* Thay đổi xs thành sm=6 để hiển thị ngang trên màn hình nhỏ hơn (tablet) */}
                    <Card
                        sx={{
                            backgroundColor: darkMode ? '#2c2c2c' : '#ffffff',
                            borderRadius: 2,
                            boxShadow: darkMode ? '0px 4px 8px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.1)',
                            height: '100%', // Đảm bảo chiều cao bằng nhau
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 3,
                        }}
                    >
                        <Avatar
                            alt="Diễn Đàn Sinh Viên TVU"
                            src="/logo-forum.png" // Thay thế bằng logo hoặc icon của diễn đàn
                            sx={{ width: 80, height: 80, mb: 2, bgcolor: theme.palette.primary.main }}
                        >
                            <Forum fontSize="large" />
                        </Avatar>
                        <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    color: darkMode ? '#e0e0e0' : 'text.primary',
                                }}
                            >
                                Diễn Đàn Sinh Viên TVU
                            </Typography>
                            <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'} mb={1}>
                                Nơi kết nối, chia sẻ và phát triển cộng đồng sinh viên Trường Đại học Trà Vinh.
                            </Typography>
                            <Link
                                href="#" // Thêm liên kết đến trang "Về chúng tôi" hoặc thông tin admin chi tiết
                                variant="body2"
                                color="primary"
                                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Tìm hiểu thêm về chúng tôi
                            </Link>
                            <Divider sx={{ my: 2, borderColor: darkMode ? '#424242' : '#e0e0e0' }} />
                            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                <Mail sx={{ mr: 1, color: darkMode ? '#90caf9' : 'text.secondary' }} fontSize="small" />
                                <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                                    contact@tvuforum.edu.vn
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <Phone sx={{ mr: 1, color: darkMode ? '#90caf9' : 'text.secondary' }} fontSize="small" />
                                <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                                    (+84) 123 456 789
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Thông tin về Trường */}
                <Grid item xs={12} sm={6} md={6}> {/* Thay đổi xs thành sm=6 để hiển thị ngang trên màn hình nhỏ hơn (tablet) */}
                    <Card
                        sx={{
                            backgroundColor: darkMode ? '#2c2c2c' : '#ffffff',
                            borderRadius: 2,
                            boxShadow: darkMode ? '0px 4px 8px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.1)',
                            height: '100%', // Đảm bảo chiều cao bằng nhau
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 3,
                        }}
                    >
                        <Avatar
                            alt="Trường Đại học Trà Vinh"
                            src="/logo-tvu.png" // Thay thế bằng logo chính thức của trường
                            sx={{ width: 80, height: 80, mb: 2, bgcolor: theme.palette.secondary.main }}
                        >
                            <School fontSize="large" />
                        </Avatar>
                        <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    color: darkMode ? '#e0e0e0' : 'text.primary',
                                }}
                            >
                                Trường Đại học Trà Vinh
                            </Typography>
                            <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'} mb={1}>
                                Là một trường đại học đa ngành, đa lĩnh vực tại khu vực Đồng bằng sông Cửu Long.
                            </Typography>
                            <Link
                                href="https://www.tvu.edu.vn/" // Thay thế bằng URL trang web chính thức của trường
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="body2"
                                color="primary"
                                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Truy cập website trường
                            </Link>
                            <Divider sx={{ my: 2, borderColor: darkMode ? '#424242' : '#e0e0e0' }} />
                            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                <LocationOn sx={{ mr: 1, color: darkMode ? '#90caf9' : 'text.secondary' }} fontSize="small" />
                                <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                                    126 Nguyễn Thiện Thành, P.5, TP. Trà Vinh, T. Trà Vinh
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <Phone sx={{ mr: 1, color: darkMode ? '#90caf9' : 'text.secondary' }} fontSize="small" />
                                <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                                    (+84) 294 3855 246
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AboutSection;