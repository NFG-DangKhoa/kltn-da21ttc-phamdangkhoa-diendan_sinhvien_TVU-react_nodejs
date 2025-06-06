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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
    },
}));

const Sidebar = () => {
    return (
        <StyledDrawer variant="permanent" anchor="left">
            <Toolbar>
                <Typography
                    variant="h6"
                    noWrap
                    component={Link}
                    to="/admin" // Link về trang dashboard chính (overview)
                    sx={{
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': {
                            textDecoration: 'none',
                            opacity: 0.8,
                        }
                    }}
                >
                    Admin Panel
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
                    <Divider />

                    {/* Các mục Dashboard hiện có */}
                    <ListItem button component={Link} to="/admin">
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/posts">
                        <ListItemIcon>
                            <ArticleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Bài viết" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/users">
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Người dùng" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/products">
                        <ListItemIcon>
                            <ShoppingCartIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Sản phẩm" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/reports">
                        <ListItemIcon>
                            <BarChartIcon />
                        </ListItemIcon>
                        <ListItemText primary="Báo cáo" />
                    </ListItem>
                </List>
                <Divider />
                <List>
                    <ListItem button component={Link} to="/admin/settings">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Cài đặt" />
                    </ListItem>
                </List>
            </Box>
        </StyledDrawer>
    );
};

export default Sidebar;