// src/layouts/AdminDashboard.jsx
import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom'; // QUAN TRỌNG: Import Routes, Route, Navigate

// Đảm bảo đường dẫn này đúng với vị trí của Sidebar và AdminMainContent của bạn
// Dựa trên cấu trúc đã đề xuất, Sidebar nên nằm ở src/Sidebar.jsx
// và AdminMainContent ở src/layouts/AdminMainContent.jsx
import Sidebar from '../pages/admin/Sidebar'; // Chỉnh lại đường dẫn nếu Sidebar ở src/pages/admin/Sidebar
import AdminMainContent from '../pages/admin/AdminMainContent'; // Chỉnh lại đường dẫn nếu AdminMainContent ở src/pages/admin/AdminMainContent

// Import các trang admin con
// Đảm bảo các đường dẫn này khớp với vị trí thực tế của chúng trong thư mục pages/
import AdminDashboardOverview from '../pages/admin/AdminDashboardOverview';
import AdminPostsPage from '../pages/admin/AdminPostsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Tạo một theme tùy chỉnh (có thể là light hoặc dark)
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
            default: '#121212', // Nền chính của ứng dụng
            paper: '#1d1d1d',   // Nền của các thành phần như AppBar, Paper, Drawer
        },
        text: {
            primary: '#e0e0e0',
            secondary: '#a0a0a0',
        }
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

const AdminDashboard = () => {
    return (
        <ThemeProvider theme={adminDashboardTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar />
                {/* AdminMainContent sẽ bao bọc các route con của admin */}
                <AdminMainContent>
                    <Routes> {/* Đây là nơi các route con của admin được định nghĩa */}
                        {/* Route mặc định cho /admin (ví dụ: AdminDashboardOverview) */}
                        <Route index element={<AdminDashboardOverview />} />

                        {/* Các route cụ thể cho từng trang admin */}
                        <Route path="posts" element={<AdminPostsPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="settings" element={<AdminSettingsPage />} />

                        {/* Thêm các route admin khác tại đây nếu cần
                            Ví dụ: <Route path="posts/new" element={<AdminNewPostPage />} />
                                   <Route path="posts/:id/edit" element={<AdminEditPostPage />} />
                        */}

                        {/* Route catch-all cho các đường dẫn con không khớp trong admin */}
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </AdminMainContent>
            </Box>
        </ThemeProvider>
    );
};

export default AdminDashboard;