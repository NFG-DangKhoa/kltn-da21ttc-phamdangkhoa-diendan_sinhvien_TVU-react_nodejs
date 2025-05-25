import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
// Đảm bảo đường dẫn này đúng với vị trí của Sidebar và Content của bạn
import Sidebar from './Sidebar';
import Content from './Content';

// Tạo một theme tùy chỉnh (có thể là light hoặc dark)
// Bạn có thể giữ theme này trong App.jsx nếu muốn áp dụng cho toàn bộ ứng dụng,
// hoặc đặt ở đây nếu muốn theme riêng cho phần admin.
// Tôi sẽ đặt nó ở đây để minh họa sự độc lập.
const adminDashboardTheme = createTheme({
    palette: {
        mode: 'dark', // Đặt 'light' nếu bạn muốn giao diện sáng
        primary: {
            main: '#90caf9', // Blue
        },
        secondary: {
            main: '#f48fb1', // Pink
        },
        background: {
            default: '#121212',
            paper: '#1d1d1d',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

const AdminDashboard = () => {
    return (
        <ThemeProvider theme={adminDashboardTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline /> {/* Đặt ở đây để reset CSS cho phần dashboard */}
                <Sidebar />
                <Content />
            </Box>
        </ThemeProvider>
    );
};

export default AdminDashboard;