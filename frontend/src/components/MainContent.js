import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Forum } from '@mui/icons-material';
import TopicCard from './TopicCard'; // Import TopicCard

// Đổi tên prop 'darkMode' thành 'isDarkMode' để nhất quán
const MainContent = ({ filteredTopics, isDarkMode }) => {
    const theme = useTheme(); // Lấy theme object hiện tại

    return (
        <Box
            sx={{
                p: 2,
                // Sử dụng theme.palette.background.default cho nền chính của cột
                backgroundColor: theme.palette.background.default,
                borderRadius: 3,
                // Box shadow tùy chỉnh theo isDarkMode
                boxShadow: isDarkMode ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)',
                flexGrow: 1,
                width: {
                    xs: '100%',
                    md: 'auto', // Adjusted to allow flexGrow to control width
                },
                // Sử dụng theme.palette.text.primary cho màu chữ mặc định của Box
                color: theme.palette.text.primary,
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, width 0.3s ease',
                // Quan trọng: Thêm overflowY: 'auto' cho Box cha này
                // để toàn bộ cột giữa cuộn nếu nội dung quá dài
                overflowY: 'auto',
                // Bạn có thể cân nhắc đặt một maxHeight ở đây
                // nếu bạn muốn cột giữa cuộn độc lập với toàn bộ trang
                // Ví dụ: maxHeight: 'calc(100vh - 150px)', // Thay đổi 150px tùy vào header/footer
                pr: 1, // Để có khoảng cách cho scrollbar
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': {
                    // Màu track scrollbar
                    background: isDarkMode ? theme.palette.background.paper : theme.palette.grey[300],
                    borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                    // Màu thumb scrollbar
                    background: isDarkMode ? theme.palette.grey[700] : theme.palette.grey[500],
                    borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    // Màu thumb scrollbar khi hover
                    background: isDarkMode ? theme.palette.grey[600] : theme.palette.grey[700]
                },
            }}
        >
            <Box
                sx={{
                    // Sử dụng theme.palette.background.paper cho nền của banner
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '16px',
                    px: 3,
                    py: 2,
                    mb: 3,
                    // Sử dụng theme.palette.divider cho border
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'background-color 0.4s ease, border-color 0.4s ease',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                    <Forum sx={{ verticalAlign: 'middle', mr: 1, color: '#3498DB' }} /> TVU_FORUM.VN
                </Typography>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                    Tổng hợp các chủ đề diễn đàn
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => (
                        <Box key={topic._id} sx={{ width: '100%' }}>
                            <TopicCard
                                topic={topic}
                                // Truyền prop isDarkMode xuống TopicCard
                                isDarkMode={isDarkMode}
                                variant="vertical"
                            />
                        </Box>
                    ))
                ) : (
                    <Typography align="center" color={theme.palette.text.secondary} mt={4} sx={{ width: '100%' }}>
                        Không tìm thấy chủ đề nào.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default MainContent;