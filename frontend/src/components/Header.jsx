import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';

// Import Material-UI Icons MỚI VÀ HIỆN CÓ
import PostAdd from '@mui/icons-material/PostAdd';
import Dashboard from '@mui/icons-material/Dashboard';

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
import Chat from '@mui/icons-material/Chat'; // Thêm icon Chat

// Import your custom contexts
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Ensure this path is correct
import { useChat } from '../context/ChatContext'; // Import useChat hook

// Import NotificationBell component
import NotificationBell from './NotificationBell';

// Import PostForm component
import PostForm from '../pages/TopicDetail/CenterColumn/PostForm';

// Import logo nếu bạn đặt trong thư mục src/assets (chỉ khi dùng cách này)
// import logoImage from '../assets/logo.png'; // Điều chỉnh đường dẫn nếu cần

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { mode, toggleColorMode } = useContext(ThemeContext);
    const { unreadCount } = useChat();
    const navigate = useNavigate();



    // State for user menu
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [openPostDialog, setOpenPostDialog] = useState(false);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [loadingTopics, setLoadingTopics] = useState(false);

    // Fetch topics when dialog opens
    useEffect(() => {
        if (openPostDialog && topics.length === 0) {
            fetchTopics();
        }
    }, [openPostDialog]);

    const fetchTopics = async () => {
        try {
            setLoadingTopics(true);
            const response = await axios.get('http://localhost:5000/api/topics/all');
            setTopics(response.data);
        } catch (error) {
            console.error('Error fetching topics:', error);
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleOpenPostDialog = () => {
        setOpenPostDialog(true);
        setSelectedTopic('');
    };

    const handleClosePostDialog = () => {
        setOpenPostDialog(false);
        setSelectedTopic('');
    };

    const handlePostSubmit = async (postData) => {
        try {
            console.log('🚀 Submitting post from Header:', postData);

            // Get token from localStorage
            const token = localStorage.getItem('token');
            console.log('🔑 Token exists:', !!token);
            console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'null');

            if (!token) {
                alert('Bạn cần đăng nhập để đăng bài.');
                return;
            }

            // Validate required fields
            if (!postData.title || !postData.content || !postData.topicId) {
                alert('Vui lòng điền đầy đủ thông tin bài viết.');
                return;
            }

            console.log('📡 Making API call to:', 'http://localhost:5000/api/posts/cr');
            console.log('📦 Request payload:', {
                ...postData,
                content: postData.content.substring(0, 100) + '...' // Truncate content for logging
            });

            // Submit post to API - sử dụng endpoint đúng
            const response = await axios.post('http://localhost:5000/api/posts/cr', postData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ API Response status:', response.status);
            console.log('✅ API Response data:', response.data);

            if (response.status === 201) {
                console.log('🎉 Post created successfully:', response.data);
                // Close dialog and reset form
                handleClosePostDialog();
                // Show success message
                alert('Đăng bài thành công!');
            }
        } catch (error) {
            console.error('❌ Error creating post:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error config:', error.config);

            if (error.response?.status === 401) {
                alert('Bạn cần đăng nhập để đăng bài.');
            } else if (error.response?.status === 404) {
                alert('Không tìm thấy API endpoint. Vui lòng kiểm tra lại.');
            } else if (error.response?.status === 400) {
                alert(`Dữ liệu không hợp lệ: ${error.response?.data?.message || 'Vui lòng kiểm tra lại thông tin.'}`);
            } else if (error.code === 'ECONNREFUSED') {
                alert('Không thể kết nối đến server. Vui lòng kiểm tra server có đang chạy không.');
            } else {
                alert(`Có lỗi xảy ra khi đăng bài: ${error.response?.data?.message || error.message}`);
            }
        }
    };

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
        <>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Modern purple-blue gradient
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                }}
            >
                <Toolbar
                    sx={{
                        padding: '0 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: '64px',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '0 0 20px 20px',
                            zIndex: -1,
                        }
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

                        {/* Nút Chat (chỉ hiển thị khi đã đăng nhập) */}
                        {user && (
                            <Button
                                color="inherit"
                                onClick={() => navigate('/chat')}
                                sx={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    transition: 'background-color 0.3s ease',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                                }}
                                startIcon={
                                    <Badge
                                        badgeContent={unreadCount > 0 ? (unreadCount > 5 ? '5+' : unreadCount) : 0}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.7rem',
                                                minWidth: '18px',
                                                height: '18px',
                                                borderRadius: '9px',
                                                border: '1px solid white',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                    >
                                        <Chat />
                                    </Badge>
                                }
                            >
                                Chat
                            </Button>
                        )}
                    </Box>

                    {/* Navbar actions - Phía bên phải */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user ? (
                            <>
                                {/* Nút Đăng Bài (chỉ user thường thấy) */}
                                {user.role === 'user' && (
                                    <Button
                                        color="inherit"
                                        onClick={handleOpenPostDialog}
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

                                {/* Real-time Notification Bell */}
                                <NotificationBell />

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
                                            if (user && user._id) {
                                                navigate(`/profile/${user._id}`);
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

            {/* Post Creation Dialog */}
            <Dialog
                open={openPostDialog}
                onClose={handleClosePostDialog}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            minHeight: '70vh'
                        }
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <PostAdd color="primary" />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Tạo bài viết mới
                    </Typography>
                    <Button onClick={handleClosePostDialog} color="inherit">
                        ✕
                    </Button>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {/* Topic Selection */}
                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <FormControl fullWidth>
                            <InputLabel>Chọn chủ đề</InputLabel>
                            <Select
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                                label="Chọn chủ đề"
                                disabled={loadingTopics}
                            >
                                {loadingTopics ? (
                                    <MenuItem disabled>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Đang tải chủ đề...
                                    </MenuItem>
                                ) : (
                                    topics.map((topic) => (
                                        <MenuItem key={topic._id} value={topic._id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: 1,
                                                        bgcolor: topic.color || '#2196F3',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {topic.icon || '📚'}
                                                </Box>
                                                {topic.name}
                                            </Box>
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* PostForm */}
                    {selectedTopic && (
                        <PostForm
                            topicId={selectedTopic}
                            onPostCreated={handlePostSubmit}
                            isModal={true}
                        />
                    )}

                    {!selectedTopic && (
                        <Box sx={{
                            p: 6,
                            textAlign: 'center',
                            color: 'text.secondary'
                        }}>
                            <PostAdd sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" gutterBottom>
                                Chọn chủ đề để bắt đầu
                            </Typography>
                            <Typography variant="body2">
                                Vui lòng chọn một chủ đề từ danh sách trên để tạo bài viết mới
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Header;