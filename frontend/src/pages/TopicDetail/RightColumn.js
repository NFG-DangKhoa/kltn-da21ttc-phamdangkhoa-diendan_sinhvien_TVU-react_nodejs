import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material'; // Thêm List, ListItem, ListItemText, Divider

// Nhận prop 'darkMode' từ component cha
const RightColumn = ({ darkMode }) => {
    return (
        <Box
            sx={{
                p: 2,
                // Màu nền của toàn bộ cột RightColumn
                backgroundColor: darkMode ? '#121212' : '#f0f2f5', // Xám đậm cho ban đêm, trắng cho ban ngày
                color: darkMode ? '#e4e6eb' : '#1c1e21', // Màu chữ mặc định cho cột
                borderRadius: 2,
                width: '15vw', // Giữ nguyên độ rộng nếu bạn muốn
                ml: 2,
                height: 'calc(100vh - 64px)', // Đảm bảo chiều cao phù hợp
                overflowY: 'auto', // Cho phép cuộn nếu nội dung dài
                // Thêm shadow, điều chỉnh màu shadow cho ban đêm
                boxShadow: 'none',
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease', // Chuyển đổi mượt mà
            }}
        >
            {/* Tiêu đề "Bài viết được yêu thích" */}
            <Typography variant="h6" gutterBottom
                sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }} // Màu tiêu đề
            >
                📈 Bài viết được yêu thích
            </Typography>

            {/* Danh sách bài viết */}
            {/* Thay thế ul/li HTML bằng MUI List/ListItem để dễ dàng styling */}
            <List dense sx={{ paddingLeft: 0 }}> {/* paddingLeft 0 để loại bỏ padding mặc định của ul */}
                {['Làm chủ React Hooks', 'Responsive với MUI', 'Deploy React lên Vercel', 'Xây dựng API với Node.js'].map((item, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            p: 0.5, // Giảm padding để danh sách gọn hơn
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5', // Nền khi hover
                                cursor: 'pointer',
                            },
                            transition: 'background-color 0.3s ease',
                        }}
                    >
                        <ListItemText
                            primary={item}
                            primaryTypographyProps={{
                                color: darkMode ? '#b0b3b8' : '#65676b', // Màu chữ của từng mục
                                '&:hover': {
                                    color: darkMode ? '#90caf9' : 'primary.main', // Màu chữ khi hover
                                    textDecoration: 'underline',
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>

            {/* Thêm một đường phân cách */}
            <Divider sx={{ my: 2, borderColor: darkMode ? '#444' : '#eee' }} />

            {/* Phần quảng cáo hoặc nội dung khác */}
            <Typography variant="h6" gutterBottom
                sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }} // Màu tiêu đề
            >
                📢 Quảng cáo
            </Typography>
            <Box
                sx={{
                    p: 2,
                    backgroundColor: darkMode ? '#3a3b3c' : '#f0f0f0', // Nền của box quảng cáo
                    borderRadius: 1,
                    textAlign: 'center',
                    color: darkMode ? '#b0b3b8' : '#65676b', // Màu chữ trong box quảng cáo
                    transition: 'background-color 0.4s ease, color 0.4s ease',
                }}
            >
                <Typography variant="body2">
                    Bạn muốn phát triển kỹ năng Front-end? Khám phá các khóa học của chúng tôi!
                </Typography>
            </Box>
        </Box>
    );
};

export default RightColumn;