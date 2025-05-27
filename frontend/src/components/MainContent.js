import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Forum } from '@mui/icons-material';
import TopicCard from './TopicCard'; // Import TopicCard

const MainContent = ({ filteredTopics, darkMode }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 2,
                backgroundColor: darkMode ? '#1e1e1e' : '#f0f2f5',
                borderRadius: 3,
                boxShadow: darkMode ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)',
                flexGrow: 1,
                width: {
                    xs: '100%',
                    md: 'auto', // Adjusted to allow flexGrow to control width
                },
                color: darkMode ? '#e0e0e0' : '#1c1e21',
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, width 0.3s ease',
                // Quan trọng: Thêm overflowY: 'auto' cho Box cha này
                // để toàn bộ cột giữa cuộn nếu nội dung quá dài
                overflowY: 'auto',
                // Bạn có thể cân nhắc đặt một maxHeight ở đây
                // nếu bạn muốn cột giữa cuộn độc lập với toàn bộ trang
                // Ví dụ: maxHeight: 'calc(100vh - 150px)', // Thay đổi 150px tùy vào header/footer
                pr: 1, // Để có khoảng cách cho scrollbar
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { background: darkMode ? '#2c2c2c' : '#e0e0e0', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb': { background: darkMode ? '#555' : '#888', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { background: darkMode ? '#777' : '#555' },
            }}
        >
            <Box
                sx={{
                    backgroundColor: darkMode ? '#2c2c2c' : '#f0f4f8',
                    borderRadius: '16px',
                    px: 3,
                    py: 2,
                    mb: 3,
                    border: `1px solid ${darkMode ? '#424242' : '#cfd8dc'}`,
                    transition: 'background-color 0.4s ease, border-color 0.4s ease',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: darkMode ? '#ffffff' : 'text.primary' }}>
                    <Forum sx={{ verticalAlign: 'middle', mr: 1, color: '#3498DB' }} /> TVU_FORUM.VN
                </Typography>
                <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                    Tổng hợp các chủ đề diễn đàn
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    // Xóa bỏ hoặc đặt maxHeight về 'none' để nó mở rộng theo nội dung
                    // overflowY: 'auto', // Có thể không cần ở đây nếu Box cha đã có overflowY
                    // maxHeight: { xs: 'none', md: 'none' }, // Đã xóa hoặc đặt none
                    // pr: 1, // Đã chuyển lên Box cha
                    // '&::-webkit-scrollbar': { width: '8px' }, // Đã chuyển lên Box cha
                    // '&::-webkit-scrollbar-track': { background: darkMode ? '#2c2c2c' : '#e0e0e0', borderRadius: '4px' }, // Đã chuyển lên Box cha
                    // '&::-::-webkit-scrollbar-thumb': { background: darkMode ? '#555' : '#888', borderRadius: '4px' }, // Đã chuyển lên Box cha
                    // '&::-webkit-scrollbar-thumb:hover': { background: darkMode ? '#777' : '#555' }, // Đã chuyển lên Box cha
                }}
            >
                {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => (
                        <Box key={topic._id} sx={{ width: '100%' }}>
                            <TopicCard
                                topic={topic}
                                darkMode={darkMode}
                                variant="vertical"
                            />
                        </Box>
                    ))
                ) : (
                    <Typography align="center" color={darkMode ? '#bdbdbd' : 'text.secondary'} mt={4} sx={{ width: '100%' }}>
                        Không tìm thấy chủ đề nào.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default MainContent;