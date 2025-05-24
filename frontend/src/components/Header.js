import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ExitToApp, PostAdd, Login, PersonAdd } from '@mui/icons-material';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    console.log("Header user:", user); // Kiểm tra user có không
    const navigate = useNavigate();

    console.log(user); // Kiểm tra giá trị của user

    return (
        <AppBar position="static" sx={{ backgroundColor: '#2C3E50', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <Toolbar sx={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Logo / Title */}
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer', color: 'white' }}
                    onClick={() => navigate('/')}
                >
                    Diễn Đàn Sinh Viên TVU
                </Typography>

                {/* Navbar actions */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Typography sx={{ color: 'white', marginRight: 2 }}>
                                {user?.fullName || user?.email} ({user?.role})
                            </Typography>


                            {/* Chỉ admin hoặc editor mới thấy nút quản lý */}
                            {(user.role === 'admin' || user.role === 'editor') && (
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/admin')}
                                    sx={{
                                        marginRight: 2,
                                        backgroundColor: '#8E44AD',
                                        '&:hover': { backgroundColor: '#9B59B6' },
                                        padding: '8px 20px',
                                    }}
                                >
                                    Dashboard
                                </Button>
                            )}

                            {/* Nút Đăng Bài nằm trước nút Đăng Xuất */}
                            {user.role === 'user' && (
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/post')}
                                    sx={{
                                        marginRight: 2,
                                        backgroundColor: '#27AE60',
                                        '&:hover': { backgroundColor: '#2ECC71' },
                                        padding: '8px 20px'
                                    }}
                                    startIcon={<PostAdd />}
                                >
                                    Đăng Bài
                                </Button>
                            )}

                            {/* Nút Đăng Xuất */}
                            <Button
                                color="inherit"
                                onClick={logout}
                                sx={{ '&:hover': { backgroundColor: '#E74C3C' } }}
                                startIcon={<ExitToApp />}
                            >
                                Đăng Xuất
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Các nút Đăng Nhập và Đăng Ký */}
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}
                                sx={{ marginLeft: 2, '&:hover': { backgroundColor: '#2980B9' } }}
                                startIcon={<Login />}
                            >
                                Đăng Nhập
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/register')}
                                sx={{ marginLeft: 2, '&:hover': { backgroundColor: '#2980B9' } }}
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
