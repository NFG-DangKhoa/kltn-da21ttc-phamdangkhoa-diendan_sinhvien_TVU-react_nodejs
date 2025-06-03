import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Divider,
    Box,
    Button, // Import Button
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home'; // Import HomeIcon
import { styled } from '@mui/system';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: theme.palette.mode === 'dark' ? '#1a202c' : '#f8f9fa',
        color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
    },
}));

const Sidebar = () => {
    return (
        <StyledDrawer variant="permanent" anchor="left">
            <Toolbar>
                {/* Logo hoặc tên có thể click để về trang chủ nếu muốn */}
                <Typography
                    variant="h6"
                    noWrap
                    component={Link} // Sử dụng Link component
                    to="/" // Đường dẫn về trang chủ
                    sx={{
                        fontWeight: 'bold',
                        textDecoration: 'none', // Bỏ gạch chân
                        color: 'inherit', // Giữ màu chữ kế thừa từ theme
                        '&:hover': {
                            textDecoration: 'none', // Bỏ gạch chân khi hover
                            opacity: 0.8,
                        }
                    }}
                >
                    Admin Dashboard
                </Typography>
            </Toolbar>
            <Divider />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {/* Link về trang chủ công khai */}
                    <ListItem button component={Link} to="/">
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Trang Chủ" />
                    </ListItem>
                    <Divider /> {/* Thêm divider để phân tách */}

                    {/* Các mục Dashboard hiện có */}
                    <ListItem button component={Link} to="/admin"> {/* Thêm Link cho Dashboard */}
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/users"> {/* Ví dụ cho Users */}
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Users" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/products"> {/* Ví dụ cho Products */}
                        <ListItemIcon>
                            <ShoppingCartIcon />
                        </ListItemIcon>
                        <ListItemText primary="Products" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/reports"> {/* Ví dụ cho Reports */}
                        <ListItemIcon>
                            <BarChartIcon />
                        </ListItemIcon>
                        <ListItemText primary="Reports" />
                    </ListItem>
                </List>
                <Divider />
                <List>
                    <ListItem button component={Link} to="/admin/settings"> {/* Ví dụ cho Settings */}
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItem>
                </List>
            </Box>
            {/* Nếu muốn thêm nút đăng xuất riêng */}
            {/* <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={() => {
                        // Logic đăng xuất ở đây
                        console.log('Admin Logout');
                        // Sau khi đăng xuất, chuyển hướng về trang chủ
                        // navigate('/');
                    }}
                >
                    Đăng xuất
                </Button>
            </Box> */}
        </StyledDrawer>
    );
};

export default Sidebar;