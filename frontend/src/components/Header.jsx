import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import Badge from '@mui/material/Badge';

// Import Material-UI Icons MỚI VÀ HIỆN CÓ
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
import Home from '@mui/icons-material/Home'; // Thêm icon Home
import Category from '@mui/icons-material/Category'; // Thêm icon Category
import Search from '@mui/icons-material/Search'; // Thêm icon Search

// Import your custom contexts
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Ensure this path is correct

// Import logo nếu bạn đặt trong thư mục src/assets (chỉ khi dùng cách này)
// import logoImage from '../assets/logo.png'; // Điều chỉnh đường dẫn nếu cần

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
        logout();
        handleCloseUserMenu();
        navigate('/login');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                background: 'linear-gradient(to right, #0A1929, #172A45)',// Thay đổi màu sắc nếu cần
                boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)', // Giữ boxShadow để đẹp hơn
            }}
        >
            <Toolbar
                sx={{
                    padding: '0 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '64px',
                }}
            >
                {/* Logo / Title (Đã thay đổi thành ảnh) */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        height: '100%', // Đảm bảo Box có chiều cao để căn giữa ảnh
                    }}
                    onClick={() => navigate('/')}
                >
                    <img
                        src="/favicon.png" // Đường dẫn đến ảnh logo của bạn trong thư mục public
                        alt="Diễn Đàn Sinh Viên TVU Logo"
                        style={{
                            height: '80px', // Chiều cao của ảnh logo, điều chỉnh theo kích thước mong muốn
                            marginRight: '8px', // Khoảng cách giữa logo và các phần tử khác nếu có
                            // Bạn có thể thêm max-width, object-fit để kiểm soát kích thước tốt hơn
                            // maxWidth: '180px',
                            // objectFit: 'contain',
                        }}
                    />
                    {/* Tùy chọn: Giữ Typography nếu bạn muốn có cả text và logo */}
                    {/* <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            letterSpacing: '0.5px',
                            color: 'white',
                            '&:hover': {
                                color: '#E0E0E0',
                            },
                        }}
                    >
                        Diễn Đàn Sinh Viên TVU
                    </Typography> */}
                </Box>

                {/* Các nút điều hướng chính cho mọi người dùng */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, marginLeft: 4 }}>
                    <Button
                        color="inherit"
                        onClick={() => navigate('/')}
                        sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            transition: 'background-color 0.3s ease',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                        }}
                        startIcon={<Home />}
                    >
                        Trang chủ
                    </Button>
                    <Button
                        color="inherit"
                        onClick={() => navigate('/categories')} // Thay bằng đường dẫn trang danh mục của bạn
                        sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            transition: 'background-color 0.3s ease',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                        }}
                        startIcon={<Category />}
                    >
                        Chủ đề
                    </Button>
                    {/* Nút Tìm kiếm (có thể là IconButton nếu bạn muốn icon không có text) */}
                    <IconButton
                        color="inherit"
                        onClick={() => navigate('/search')} // Thay bằng đường dẫn trang tìm kiếm của bạn
                        sx={{
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                        }}
                    >
                        <Search />
                    </IconButton>
                </Box>

                {/* Navbar actions - Phía bên phải */}
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
                                    <Typography textAlign="center" sx={{ color: (theme) => theme.palette.primary.main }}>
                                        Xem tất cả
                                    </Typography>
                                </MenuItem>
                            </Menu>

                            {/* Nút cài đặt và thông tin người dùng */}
                            <Box sx={{ flexGrow: 0 }}>
                                <Tooltip title="Cài đặt tài khoản">
                                    <Button
                                        onClick={handleOpenUserMenu}
                                        sx={{
                                            p: 0,
                                            color: 'inherit',
                                            textTransform: 'none',
                                        }}
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
                            {/* Nút chuyển đổi chế độ sáng/tối cho người dùng chưa đăng nhập */}
                            <IconButton sx={{ mr: 2 }} color="inherit" onClick={toggleColorMode}>
                                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>

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