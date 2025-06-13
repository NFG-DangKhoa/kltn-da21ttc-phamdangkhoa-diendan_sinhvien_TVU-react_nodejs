import React, { useState, useContext } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Box,
    Badge,
    Tooltip,
    Divider,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    AccountCircle,
    Notifications,
    Settings,
    Logout,
    DarkMode,
    LightMode,
    Search,
    Help,
    Security,
    Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import NotificationBell from '../../components/NotificationBell';

const drawerWidth = 240;

// Styled AppBar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}));

// Styled Menu
const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 12,
        marginTop: theme.spacing(1),
        minWidth: 220,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '& .MuiMenuItem-root': {
            padding: '12px 16px',
            borderRadius: 8,
            margin: '4px 8px',
            '&:hover': {
                backgroundColor: theme.palette.mode === 'light'
                    ? 'rgba(102, 126, 234, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
            },
        },
    },
}));

const AdminHeader = ({ toggleColorMode, mode }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        handleMenuClose();
    };

    const handleProfile = () => {
        navigate('/admin/profile');
        handleMenuClose();
    };

    const handleSettings = () => {
        navigate('/admin/settings');
        handleMenuClose();
    };

    const handleSecurity = () => {
        navigate('/admin/security');
        handleMenuClose();
    };

    const isMenuOpen = Boolean(anchorEl);

    return (
        <StyledAppBar position="fixed">
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    Bảng Điều Khiển Admin
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Search Button */}
                    <Tooltip title="Tìm kiếm">
                        <IconButton color="inherit" size="large">
                            <Search />
                        </IconButton>
                    </Tooltip>

                    {/* Theme Toggle */}
                    <Tooltip title={mode === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}>
                        <IconButton color="inherit" onClick={toggleColorMode} size="large">
                            {mode === 'light' ? <DarkMode /> : <LightMode />}
                        </IconButton>
                    </Tooltip>

                    {/* Help Button */}
                    <Tooltip title="Trợ giúp">
                        <IconButton color="inherit" size="large">
                            <Help />
                        </IconButton>
                    </Tooltip>

                    {/* Real-time Notification Bell */}
                    <NotificationBell />

                    {/* Profile Menu */}
                    <Tooltip title="Tài khoản">
                        <IconButton
                            onClick={handleProfileMenuOpen}
                            size="large"
                            color="inherit"
                        >
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                }}
                                src={user.avatarUrl}
                            >
                                {user.fullName?.charAt(0) || 'A'}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Profile Menu */}
                <StyledMenu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {/* User Info */}
                    <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {user.fullName || 'Administrator'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.email || 'admin@tvu.edu.vn'}
                        </Typography>
                        <Typography variant="caption" color="primary">
                            Quản trị viên
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Menu Items */}
                    <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                            <Person fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Trang cá nhân</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={handleSettings}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Cài đặt</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={handleSecurity}>
                        <ListItemIcon>
                            <Security fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Bảo mật</ListItemText>
                    </MenuItem>

                    <Divider sx={{ my: 1 }} />

                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <Logout fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Đăng xuất</ListItemText>
                    </MenuItem>
                </StyledMenu>


            </Toolbar>
        </StyledAppBar>
    );
};

export default AdminHeader;
