import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Box, Divider, Grid } from '@mui/material';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; // Thêm GoogleLogin

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data);
            if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }

        } catch (err) {
            alert('Sai email hoặc mật khẩu');
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            const res = await API.post('http://localhost:5000/api/auth/google-login', {
                token: credentialResponse.credential,
            });
            console.log(res.data);  // Kiểm tra xem dữ liệu người dùng trả về có đúng không
            login(res.data);
            const userData = {
                name: res.data.user.name,
                email: res.data.user.email,
                avatar: res.data.user.avatar,
                role: res.data.user.role, // ⚠️ bắt buộc phải có nếu muốn hiển thị theo role
                token: res.data.token
            };
            login(userData);

            if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }

        } catch (err) {
            alert('Đăng nhập Google thất bại');
        }
    };


    return (
        <Container maxWidth="sm" sx={{ mt: 5, bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ color: '#333', fontWeight: 600 }}>
                Đăng nhập
            </Typography>

            <form onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    required
                />

                <TextField
                    label="Mật khẩu"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 3 }}
                    required
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#2980B9' }}>
                        <Typography variant="body2" sx={{ fontWeight: '500' }}>Quên mật khẩu?</Typography>
                    </Link>
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                        mb: 2,
                        padding: '12px',
                        backgroundColor: '#2980B9',
                        '&:hover': { backgroundColor: '#1D6FA5' },
                    }}
                >
                    Đăng nhập
                </Button>
            </form>

            <Divider sx={{ my: 3 }}>hoặc</Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => alert('Lỗi khi đăng nhập Google')}
                    useOneTap
                    theme="outline"
                    shape="circle"
                />
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2">
                    Chưa có tài khoản?
                    <Link to="/register" style={{ color: '#2980B9', textDecoration: 'none', fontWeight: '500' }}>
                        Đăng ký
                    </Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;
