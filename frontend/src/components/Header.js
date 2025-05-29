import React, { useContext, useState } from 'react'; // Import useContext and useState from React
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

// Import Material-UI components
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge'; // Don't forget Badge for notifications

// Import Material-UI Icons
import PostAdd from '@mui/icons-material/PostAdd';
import Dashboard from '@mui/icons-material/Dashboard';
import Notifications from '@mui/icons-material/Notifications';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import Settings from '@mui/icons-material/Settings';
import Brightness7 from '@mui/icons-material/Brightness7';
import Brightness4 from '@mui/icons-material/Brightness4';
import ExitToApp from '@mui/icons-material/ExitToApp';
import Login from '@mui/icons-material/Login';
import PersonAdd from '@mui/icons-material/PersonAdd';

// Import your custom contexts
import { AuthContext } from '../context/AuthContext'; // Adjust path as needed
import { ThemeContext } from '../context/ThemeContext'; // Adjust path as needed

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { mode, toggleColorMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    // State for notification menu
    const [anchorElNotifications, setAnchorElNotifications] = useState(null);
    const handleOpenNotificationsMenu = (event) => {
        setAnchorElNotifications(event.currentTarget);
    };
    const handleCloseNotificationsMenu = () => {
        setAnchorElNotifications(null);
    };

    // State for user menu
    const [anchorElUser, setAnchorElUser] = useState(null);
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    // Handle Logout function
    const handleLogout = () => {
        logout(); // Assuming logout is provided by AuthContext
        handleCloseUserMenu();
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                color: '#fff',
                backgroundColor: '#1d2731', // Changed AppBar background color to match footer
            }}
        >
            <Toolbar
                sx={{
                    padding: '0 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '64px',
                    color: '#fff',
                }}
            >
                {/* Logo / Title */}
                <Typography
                    variant="h5"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        letterSpacing: '0.5px',
                        '&:hover': {
                            color: '#3498DB',
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
                                    onClick={() => navigate('/CreatePostPage')}
                                    sx={{
                                        marginRight: 2,
                                        backgroundColor: '#27AE60',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
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
                                        backgroundColor: '#8E44AD',
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
                                            src={user?.avatarUrl || "/static/images/avatar/2.jpg"}
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
                                    {/* Thay đổi dòng này để điều hướng đến trang ProfilePage với userId */}
                                    <MenuItem onClick={() => {
                                        if (user && user.id) {
                                            navigate(`/profile/${user.id}`);
                                        } else {
                                            navigate('/profile/default');
                                        }
                                        handleCloseUserMenu();
                                    }}>
                                        <Settings sx={{ marginRight: 1 }} />
                                        <Typography textAlign="center">Trang cá nhân</Typography>
                                    </MenuItem>

                                    {/* Nút chuyển đổi chế độ sáng/tối */}
                                    <MenuItem onClick={toggleColorMode}>
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
                                    backgroundColor: '#3498DB',
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
                                    backgroundColor: '#9B59B6',
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