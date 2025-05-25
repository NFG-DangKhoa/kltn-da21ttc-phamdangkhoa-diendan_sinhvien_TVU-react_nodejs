import React, { useContext, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Badge,
    Avatar,
    Tooltip,
    // Import Switch nếu bạn muốn dùng switch thay vì IconButton
    // Switch,
    // FormControlLabel,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Import ThemeContext mới
import { useNavigate } from 'react-router-dom';
import {
    ExitToApp,
    PostAdd,
    Login,
    PersonAdd,
    Notifications,
    Settings,
    Dashboard,
    ArrowDropDown,
    Brightness4, // Icon cho chế độ tối
    Brightness7, // Icon cho chế độ sáng
} from '@mui/icons-material';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { mode, toggleColorMode } = useContext(ThemeContext); // Lấy mode và toggleColorMode từ ThemeContext
    const navigate = useNavigate();

    const [anchorElUser, setAnchorElUser] = useState(null);
    const [anchorElNotifications, setAnchorElNotifications] = useState(null);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenNotificationsMenu = (event) => {
        setAnchorElNotifications(event.currentTarget);
    };

    const handleCloseNotificationsMenu = () => {
        setAnchorElNotifications(null);
    };

    const handleLogout = () => {
        logout();
        handleCloseUserMenu();
        navigate('/');
    };

    return (
        <AppBar
            position="fixed" // Thay đổi thành 'fixed' để cố định header
            sx={{
                // Các màu này sẽ được điều khiển bởi ThemeProvider
                // backgroundColor: '#2C3E50',
                // boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                zIndex: (theme) => theme.zIndex.drawer + 1, // Đảm bảo header nằm trên các phần tử khác
            }}
        >
            <Toolbar
                sx={{
                    padding: '0 24px', // Tăng padding để không gian thoáng hơn
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '64px', // Đảm bảo chiều cao tối thiểu cho toolbar
                }}
            >
                {/* Logo / Title */}
                <Typography
                    variant="h5" // Tăng kích thước font
                    sx={{
                        flexGrow: 1,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        // color: '#ECF0F1', // Màu chữ sẽ được điều khiển bởi ThemeProvider
                        letterSpacing: '0.5px', // Tăng khoảng cách chữ
                        '&:hover': {
                            color: '#3498DB', // Hiệu ứng hover
                        },
                    }}
                    onClick={() => navigate('/')}
                >
                    Diễn Đàn Sinh Viên TVU
                </Typography>

                {/* Navbar actions */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {user ? (
                        <>
                            {/* Nút Đăng Bài (chỉ user thường thấy) */}
                            {user.role === 'user' && (
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/post')}
                                    sx={{
                                        marginRight: 2,
                                        backgroundColor: '#27AE60', // Màu xanh lá cho nút đăng bài
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: '8px', // Bo tròn góc
                                        padding: '8px 18px',
                                        transition: 'background-color 0.3s ease',
                                        '&:hover': { backgroundColor: '#2ECC71' },
                                    }}
                                    startIcon={<PostAdd />}
                                >
                                    Đăng Bài
                                </Button>
                            )}

                            {/* Nút Dashboard (chỉ admin/editor thấy) */}
                            {(user.role === 'admin' || user.role === 'editor') && (
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/admin')}
                                    sx={{
                                        marginRight: 2,
                                        backgroundColor: '#8E44AD', // Màu tím cho nút dashboard
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        padding: '8px 18px',
                                        transition: 'background-color 0.3s ease',
                                        '&:hover': { backgroundColor: '#9B59B6' },
                                    }}
                                    startIcon={<Dashboard />}
                                >
                                    Dashboard
                                </Button>
                            )}

                            {/* Chuông thông báo */}
                            <Tooltip title="Thông báo">
                                <IconButton
                                    color="inherit"
                                    sx={{ marginRight: 1 }}
                                    onClick={handleOpenNotificationsMenu}
                                >
                                    <Badge badgeContent={3} color="error">
                                        {' '}
                                        {/* Ví dụ có 3 thông báo mới */}
                                        <Notifications />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar-notifications"
                                anchorEl={anchorElNotifications}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElNotifications)}
                                onClose={handleCloseNotificationsMenu}
                            >
                                <MenuItem onClick={handleCloseNotificationsMenu}>
                                    <Typography textAlign="center">Thông báo 1</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleCloseNotificationsMenu}>
                                    <Typography textAlign="center">Thông báo 2</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleCloseNotificationsMenu}>
                                    <Typography textAlign="center">Thông báo 3</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleCloseNotificationsMenu}>
                                    <Typography textAlign="center" sx={{ color: '#3498DB' }}>
                                        Xem tất cả
                                    </Typography>
                                </MenuItem>
                            </Menu>

                            {/* Nút cài đặt và thông tin người dùng */}
                            <Box sx={{ flexGrow: 0 }}>
                                <Tooltip title="Cài đặt tài khoản">
                                    <Button
                                        onClick={handleOpenUserMenu}
                                        sx={{ p: 0, color: 'white', textTransform: 'none' }}
                                        endIcon={<ArrowDropDown />}
                                    >
                                        <Avatar
                                            alt={user?.fullName || user?.email}
                                            src="/static/images/avatar/2.jpg" // Có thể thay bằng avatar của người dùng
                                            sx={{ width: 32, height: 32, marginRight: 1 }}
                                        />
                                        <Typography sx={{ display: { xs: 'none', md: 'block' } }}>
                                            {user?.fullName || user?.email} ({user?.role})
                                        </Typography>
                                    </Button>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
                                        <Settings sx={{ marginRight: 1 }} />
                                        <Typography textAlign="center">Cài đặt tài khoản</Typography>
                                    </MenuItem>

                                    {/* Nút chuyển đổi chế độ sáng/tối */}
                                    <MenuItem onClick={toggleColorMode}> {/* Gọi hàm toggleColorMode khi click */}
                                        <IconButton sx={{ mr: 1 }} color="inherit">
                                            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                                        </IconButton>
                                        <Typography textAlign="center">
                                            Chế độ {mode === 'dark' ? 'Sáng' : 'Tối'}
                                        </Typography>
                                    </MenuItem>

                                    <MenuItem onClick={handleLogout}>
                                        <ExitToApp sx={{ marginRight: 1 }} />
                                        <Typography textAlign="center">Đăng Xuất</Typography>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </>
                    ) : (
                        <>
                            {/* Các nút Đăng Nhập và Đăng Ký */}
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}
                                sx={{
                                    marginLeft: 2,
                                    backgroundColor: '#3498DB', // Màu xanh dương cho nút đăng nhập
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '8px',
                                    padding: '8px 18px',
                                    transition: 'background-color 0.3s ease',
                                    '&:hover': { backgroundColor: '#2980B9' },
                                }}
                                startIcon={<Login />}
                            >
                                Đăng Nhập
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/register')}
                                sx={{
                                    marginLeft: 2,
                                    backgroundColor: '#9B59B6', // Màu tím nhạt cho nút đăng ký
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '8px',
                                    padding: '8px 18px',
                                    transition: 'background-color 0.3s ease',
                                    '&:hover': { backgroundColor: '#8E44AD' },
                                }}
                                startIcon={<PersonAdd />}
                            >
                                Đăng Ký
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;