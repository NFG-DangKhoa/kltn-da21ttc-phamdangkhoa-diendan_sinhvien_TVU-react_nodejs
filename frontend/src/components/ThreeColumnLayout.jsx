// File này sẽ đóng vai trò file chung để quản lý bố cục 3 cột, bao gồm logic ẩn/hiện cột cho mobile
import React, { useState } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import CategoriesSidebar from './CategoriesSidebar';
import MainContent from './MainContent';
import PopularTopicsSidebar from './PopularTopicsSidebar';

// Đổi tên prop 'darkMode' thành 'isDarkMode' để nhất quán
const ThreeColumnLayout = ({ filteredTopics, trendingTopics, isDarkMode }) => {
    const theme = useTheme(); // Lấy theme object hiện tại
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [showLeftColumn, setShowLeftColumn] = useState(true);
    const [showRightColumn, setShowRightColumn] = useState(true);

    return (
        <Box
            display="flex"
            justifyContent="center"
            gap={3}
            sx={{ mt: 5, flexDirection: { xs: 'column', md: 'row' } }}
        >
            {/* Nút bật/tắt cột trái (chỉ hiện trên mobile/tablet) */}
            {!isDesktop && (
                <IconButton
                    onClick={() => setShowLeftColumn(!showLeftColumn)}
                    sx={{
                        position: 'sticky',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        left: 0,
                        zIndex: 10,
                        // Sử dụng theme.palette.background.paper cho màu nền
                        backgroundColor: theme.palette.background.paper,
                        // Sử dụng theme.palette.action.hover cho hover
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                        // Sử dụng theme.palette.text.primary cho màu icon
                        color: theme.palette.text.primary,
                        display: { xs: 'block', md: 'none' },
                        boxShadow: theme.shadows[2], // Sử dụng shadow từ theme
                    }}
                >
                    {showLeftColumn ? <ChevronLeft /> : <ChevronRight />}
                </IconButton>
            )}

            {/* Cột trái: Danh mục */}
            {(isDesktop || showLeftColumn) && (
                // Truyền prop isDarkMode
                <CategoriesSidebar isDarkMode={isDarkMode} />
            )}

            {/* Cột giữa: Chủ đề chính */}
            {/* Truyền prop isDarkMode */}
            <MainContent filteredTopics={filteredTopics} isDarkMode={isDarkMode} />

            {/* Nút bật/tắt cột phải (chỉ hiện trên mobile/tablet) */}
            {!isDesktop && (
                <IconButton
                    onClick={() => setShowRightColumn(!showRightColumn)}
                    sx={{
                        position: 'sticky',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        right: 0,
                        zIndex: 10,
                        // Sử dụng theme.palette.background.paper cho màu nền
                        backgroundColor: theme.palette.background.paper,
                        // Sử dụng theme.palette.action.hover cho hover
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                        // Sử dụng theme.palette.text.primary cho màu icon
                        color: theme.palette.text.primary,
                        display: { xs: 'block', md: 'none' },
                        boxShadow: theme.shadows[2], // Sử dụng shadow từ theme
                    }}
                >
                    {showRightColumn ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
            )}

            {/* Cột phải: Chủ đề phổ biến */}
            {(isDesktop || showRightColumn) && (
                // Truyền prop isDarkMode
                <PopularTopicsSidebar trendingTopics={trendingTopics} isDarkMode={isDarkMode} />
            )}
        </Box>
    );
};

export default ThreeColumnLayout;