import React, { useContext } from 'react'; // Thêm useContext
import { Box, Typography, Grid, Card, CardContent, Avatar, Link, Divider, useTheme } from '@mui/material';
import { School, Info, Mail, Phone, LocationOn, Forum } from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext'; // Import ThemeContext

const AboutSection = () => { // Loại bỏ prop 'isDarkMode'
    const theme = useTheme(); // Lấy theme object hiện tại từ MUI
    const { mode } = useContext(ThemeContext); // Lấy mode từ ThemeContext

    return (
        <Box
            mb={6}
            sx={{
                backgroundColor: theme.palette.background.default,
                borderRadius: 3,
                p: 4,
                // Box shadow tùy chỉnh theo mode từ context
                boxShadow: mode === 'dark' ? '0px 8px 20px rgba(0,0,0,0.5)' : '0px 8px 20px rgba(0,0,0,0.1)',
                transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
            }}
        >
            <Typography
                variant="h5"
                mb={3}
                sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    pb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Info sx={{ mr: 1, color: theme.palette.primary.main }} /> Về Diễn Đàn & Trường
            </Typography>

            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                {/* Thông tin về Diễn Đàn (Admin) */}
                <Grid item xs={12} sm={6} md={6}>
                    <Card
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 2,
                            // Box shadow tùy chỉnh theo mode từ context
                            boxShadow: mode === 'dark' ? '0px 4px 8px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.1)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 3,
                        }}
                    >
                        <Avatar
                            alt="Diễn Đàn Sinh Viên TVU"
                            src="/logo-forum.png"
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
                                    color: theme.palette.text.primary,
                                }}
                            >
                                Diễn Đàn Sinh Viên TVU
                            </Typography>
                            <Typography
                                variant="body2"
                                color={theme.palette.text.secondary}
                                mb={1}
                            >
                                Nơi kết nối, chia sẻ và phát triển cộng đồng sinh viên Trường Đại học Trà Vinh.
                            </Typography>
                            <Link
                                href="#"
                                variant="body2"
                                color="primary"
                                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Tìm hiểu thêm về chúng tôi
                            </Link>
                            <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />
                            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                <Mail sx={{ mr: 1, color: theme.palette.text.secondary }} fontSize="small" />
                                <Typography variant="body2" color={theme.palette.text.secondary}>
                                    contact@tvuforum.edu.vn
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <Phone sx={{ mr: 1, color: theme.palette.text.secondary }} fontSize="small" />
                                <Typography variant="body2" color={theme.palette.text.secondary}>
                                    (+84) 123 456 789
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Thông tin về Trường */}
                <Grid item xs={12} sm={6} md={6}>
                    <Card
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 2,
                            // Box shadow tùy chỉnh theo mode từ context
                            boxShadow: mode === 'dark' ? '0px 4px 8px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.1)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 3,
                        }}
                    >
                        <Avatar
                            alt="Trường Đại học Trà Vinh"
                            src="/logo-tvu.png"
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
                                    color: theme.palette.text.primary,
                                }}
                            >
                                Trường Đại học Trà Vinh
                            </Typography>
                            <Typography
                                variant="body2"
                                color={theme.palette.text.secondary}
                                mb={1}
                            >
                                Là một trường đại học đa ngành, đa lĩnh vực tại khu vực Đồng bằng sông Cửu Long.
                            </Typography>
                            <Link
                                href="https://www.tvu.edu.vn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="body2"
                                color="primary"
                                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Truy cập website trường
                            </Link>
                            <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />
                            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                <LocationOn sx={{ mr: 1, color: theme.palette.text.secondary }} fontSize="small" />
                                <Typography variant="body2" color={theme.palette.text.secondary}>
                                    126 Nguyễn Thiện Thành, P.5, TP. Trà Vinh, T. Trà Vinh
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <Phone sx={{ mr: 1, color: theme.palette.text.secondary }} fontSize="small" />
                                <Typography variant="body2" color={theme.palette.text.secondary}>
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