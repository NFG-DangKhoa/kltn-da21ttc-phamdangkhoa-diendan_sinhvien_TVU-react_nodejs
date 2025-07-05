import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemButton, useTheme } from '@mui/material';
import {
    Rocket,
    Forum,
    SportsHandball,
    School,
    AccountCircle,
    HelpOutline,
} from '@mui/icons-material';

// Đổi tên prop 'darkMode' thành 'isDarkMode' để nhất quán
const CategoriesSidebar = ({ isDarkMode }) => {
    const theme = useTheme(); // Lấy theme object hiện tại

    return (
        <Box
            sx={{
                p: 2,
                // Sử dụng theme.palette.background.paper cho nền sidebar
                backgroundColor: theme.palette.background.paper,
                borderRadius: 3,
                // Box shadow tùy chỉnh theo isDarkMode
                boxShadow: isDarkMode ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)',
                width: { xs: '100%', md: '220px' },
                minWidth: { xs: 'auto', md: '220px' },
                // Sử dụng theme.palette.text.primary cho màu chữ mặc định của Box
                color: theme.palette.text.primary,
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, width 0.3s ease',
                flexShrink: 0,
            }}
        >
            <Typography
                variant="h6"
                gutterBottom
                sx={{
                    // Sử dụng theme.palette.text.primary cho tiêu đề danh mục
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    mb: 2,
                    // Sử dụng theme.palette.divider cho đường gạch chân
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    pb: 1,
                }}
            >
                Danh mục
            </Typography>
            <List disablePadding>
                {['Bài mới', 'Thảo luận', 'Giải trí', 'Sinh hoạt', 'Tài khoản', 'Câu hỏi'].map((text, index) => (
                    <ListItem key={index} disablePadding>
                        <ListItemButton
                            sx={{
                                borderRadius: '8px',
                                mb: 1,
                                '&:hover': {
                                    // Sử dụng theme.palette.action.hover cho hover
                                    backgroundColor: theme.palette.action.hover,
                                },
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center">
                                        {/* Sử dụng màu sắc từ theme.palette hoặc màu cố định có ý nghĩa */}
                                        {text === 'Bài mới' && <Rocket sx={{ mr: 1, color: theme.palette.info.light }} />}
                                        {text === 'Thảo luận' && <Forum sx={{ mr: 1, color: theme.palette.success.main }} />}
                                        {text === 'Giải trí' && <SportsHandball sx={{ mr: 1, color: theme.palette.warning.main }} />}
                                        {text === 'Sinh hoạt' && <School sx={{ mr: 1, color: theme.palette.error.main }} />}
                                        {text === 'Tài khoản' && <AccountCircle sx={{ mr: 1, color: theme.palette.secondary.main }} />}
                                        {text === 'Câu hỏi' && <HelpOutline sx={{ mr: 1, color: theme.palette.text.secondary }} />}
                                        <Typography
                                            component="span"
                                            sx={{
                                                // Sử dụng theme.palette.text.primary cho tên danh mục
                                                color: theme.palette.text.primary,
                                                fontWeight: 500
                                            }}
                                        >
                                            {text}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default CategoriesSidebar;