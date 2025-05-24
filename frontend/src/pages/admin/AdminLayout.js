// src/pages/admin/AdminLayout.js
import React from 'react';
import { Box, Container, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const AdminLayout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* AppBar */}
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        Quản Trị Hệ Thống
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <List>
                    <ListItem button component={Link} to="/admin/dashboard">
                        <ListItemText primary="Bảng Điều Khiển" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/posts">
                        <ListItemText primary="Bài Viết" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/comments">
                        <ListItemText primary="Bình Luận" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/users">
                        <ListItemText primary="Thành Viên" />
                    </ListItem>
                </List>
            </Drawer>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    padding: 3,
                    marginLeft: 240,  // Chắc chắn là margin để không bị chồng lấn lên Drawer
                    marginTop: '64px', // Đảm bảo tránh AppBar nếu có chồng lấn
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;
