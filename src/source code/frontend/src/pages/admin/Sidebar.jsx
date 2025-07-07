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
import TopicIcon from '@mui/icons-material/Topic';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StorageIcon from '@mui/icons-material/Storage';
import GavelIcon from '@mui/icons-material/Gavel';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

// Styled ListItem với hover effects đẹp
const StyledListItem = styled(ListItem)(({ theme }) => ({
    margin: '4px 8px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        transform: 'translateX(4px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    '&.active': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    '& .MuiListItemIcon-root': {
        color: '#ffffff',
        minWidth: '40px',
    },
    '& .MuiListItemText-root': {
        '& .MuiListItemText-primary': {
            color: '#ffffff',
            fontWeight: 500,
            fontSize: '0.95rem',
        }
    }
}));

// Styled Divider
const StyledDivider = styled(Divider)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: '8px 16px',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
        width: drawerWidth,
        boxSizing: 'border-box',
        // Gradient xanh dương đẹp cho sidebar admin
        background: theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' // Light mode: Purple-blue gradient
            : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', // Dark mode: Dark blue-gray gradient
        color: '#ffffff', // Text màu trắng để contrast với background xanh
        borderRight: theme.palette.mode === 'light'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.05)',
        // Thêm shadow để tạo depth
        boxShadow: theme.palette.mode === 'light'
            ? '2px 0 10px rgba(102, 126, 234, 0.15)'
            : '2px 0 10px rgba(0, 0, 0, 0.3)',
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
                        color: '#ffffff',
                        fontSize: '1.2rem',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                        '&:hover': {
                            textDecoration: 'none',
                            opacity: 0.9,
                            transform: 'scale(1.02)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    Admin Panel
                </Typography>
            </Toolbar>
            <StyledDivider />
            <Box sx={{ overflow: 'auto', padding: '8px 0' }}>
                <List>
                    {/* Link về trang chủ công khai */}
                    <StyledListItem button component={Link} to="/">
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Trang Chủ" />
                    </StyledListItem>
                    <StyledDivider />

                    {/* Các mục Dashboard hiện có */}
                    <StyledListItem button component={Link} to="/admin">
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </StyledListItem>
                    <StyledListItem button component={Link} to="/admin/posts">
                        <ListItemIcon>
                            <ArticleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Bài viết" />
                    </StyledListItem>
                    <StyledListItem button component={Link} to="/admin/users">
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Người dùng" />
                    </StyledListItem>
                    <StyledListItem button component={Link} to="/admin/topics">
                        <ListItemIcon>
                            <TopicIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Chủ đề" />
                    </StyledListItem>
                    <StyledListItem button component={Link} to="/admin/analytics">
                        <ListItemIcon>
                            <AnalyticsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Thống kê & Phân tích" />
                    </StyledListItem>
                    <StyledListItem button component={Link} to="/admin/chatbot">
                        <ListItemIcon>
                            <SmartToyIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Chatbot" />
                    </StyledListItem>


                    <StyledListItem button component={Link} to="/admin/comments">
                        <ListItemIcon>
                            <CommentIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Bình luận" />
                    </StyledListItem>
                    <StyledListItem button component={Link} to="/admin/ratings">
                        <ListItemIcon>
                            <StarIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Đánh giá" />
                    </StyledListItem>
                    <StyledListItem button component={Link} to="/admin/likes">
                        <ListItemIcon>
                            <ThumbUpIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Lượt thích" />
                    </StyledListItem>
                    <StyledListItem button component={Link} to="/admin/featured">
                        <ListItemIcon>
                            <StarIcon />
                        </ListItemIcon>
                        <ListItemText primary="Nổi bật & Thịnh hành" />
                    </StyledListItem>

                    {/* Notification Management */}
                    <StyledListItem button component={Link} to="/admin/notifications">
                        <ListItemIcon>
                            <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Quản lý Thông báo" />
                    </StyledListItem>
                </List>
                <StyledDivider />
                <List>
                    <StyledListItem button component={Link} to="/admin/settings">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Cài đặt" />
                    </StyledListItem>
                </List>
            </Box>
        </StyledDrawer>
    );
};

export default Sidebar;
