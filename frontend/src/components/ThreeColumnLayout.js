// File này sẽ đóng vai trò file chung để quản lý bố cục 3 cột, bao gồm logic ẩn/hiện cột cho mobile
import React, { useState } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import CategoriesSidebar from './CategoriesSidebar';
import MainContent from './MainContent';
import PopularTopicsSidebar from './PopularTopicsSidebar';

const ThreeColumnLayout = ({ filteredTopics, trendingTopics, darkMode }) => {
    const theme = useTheme();
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
                        backgroundColor: darkMode ? '#333' : '#eee',
                        '&:hover': { backgroundColor: darkMode ? '#555' : '#ccc' },
                        color: darkMode ? '#fff' : '#000',
                        display: { xs: 'block', md: 'none' },
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                >
                    {showLeftColumn ? <ChevronLeft /> : <ChevronRight />}
                </IconButton>
            )}

            {/* Cột trái: Danh mục */}
            {(isDesktop || showLeftColumn) && (
                <CategoriesSidebar darkMode={darkMode} />
            )}

            {/* Cột giữa: Chủ đề chính */}
            <MainContent filteredTopics={filteredTopics} darkMode={darkMode} />

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
                        backgroundColor: darkMode ? '#333' : '#eee',
                        '&:hover': { backgroundColor: darkMode ? '#555' : '#ccc' },
                        color: darkMode ? '#fff' : '#000',
                        display: { xs: 'block', md: 'none' },
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                >
                    {showRightColumn ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
            )}

            {/* Cột phải: Chủ đề phổ biến */}
            {(isDesktop || showRightColumn) && (
                <PopularTopicsSidebar trendingTopics={trendingTopics} darkMode={darkMode} />
            )}
        </Box>
    );
};

export default ThreeColumnLayout;