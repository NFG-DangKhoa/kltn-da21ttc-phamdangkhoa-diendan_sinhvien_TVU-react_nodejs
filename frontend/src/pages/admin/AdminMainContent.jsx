// src/layouts/AdminMainContent.jsx (Đã sửa đổi)
import React from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { styled } from '@mui/system';
// import { Outlet } from 'react-router-dom'; // <--- XÓA HOẶC COMMENT DÒNG NÀY

const MainContentArea = styled('main')(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
}));

const drawerWidth = 240;

// Đảm bảo component AdminMainContent nhận props 'children', 'toggleColorMode', 'mode'
const AdminMainContent = ({ children, toggleColorMode, mode }) => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="fixed"
                sx={{
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    backgroundColor: (theme) => theme.palette.background.paper,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Admin Panel
                    </Typography>
                    {/* Nút chuyển sáng/tối */}
                    <IconButton color="inherit" onClick={toggleColorMode} sx={{ ml: 1 }}>
                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                    <IconButton color="inherit">
                        <NotificationsIcon />
                    </IconButton>
                    <IconButton color="inherit">
                        <AccountCircle />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <MainContentArea>
                <Toolbar /> {/* Điều này quan trọng để đẩy nội dung xuống dưới AppBar */}
                {children} {/* <--- THAY <Outlet /> BẰNG {children} Ở ĐÂY */}
            </MainContentArea>
        </Box>
    );
};

export default AdminMainContent;