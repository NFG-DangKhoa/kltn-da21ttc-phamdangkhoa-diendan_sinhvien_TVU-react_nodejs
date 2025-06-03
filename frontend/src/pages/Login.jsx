import React, { useState, useContext } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Divider,
    useTheme // Thêm useTheme để truy cập theme
} from '@mui/material';
import API from '../services/api'; // Đảm bảo API đã được cấu hình đúng cách để gửi yêu cầu
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const theme = useTheme(); // Khởi tạo hook useTheme

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('http://localhost:5000/api/auth/login', { email, password });
            // API.post sẽ trả về res.data (ví dụ: { user: { id, email, fullName, role, avatarUrl }, token: '...' })
            // Hoặc trực tiếp { id, email, fullName, role, avatarUrl, token }

            // Giả định backend trả về trực tiếp user object cùng với token
            // Nếu backend trả về { user: {...}, token: '...' }, bạn cần truyền res.data.user và res.data.token
            // AuthContext của bạn mong muốn một object chứa cả user data và token
            login(res.data); // Truyền toàn bộ dữ liệu nhận được cho AuthContext

            // Điều hướng dựa trên vai trò của người dùng
            // Đảm bảo res.data có thuộc tính 'role' hoặc res.data.user.role
            if (res.data.user && res.data.user.role === 'admin') { // Kiểm tra res.data.user nếu backend trả về cấu trúc đó
                navigate('/admin');
            } else if (res.data.role === 'admin') { // Trường hợp backend trả về trực tiếp role trong res.data
                navigate('/admin');
            }
            else {
                navigate('/');
            }
        } catch (err) {
            console.error('Đăng nhập thất bại:', err.response ? err.response.data : err.message); // Log lỗi chi tiết hơn
            alert(err.response?.data?.message || 'Sai email hoặc mật khẩu'); // Hiển thị thông báo lỗi từ backend hoặc thông báo chung
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            // Gửi ID token từ Google (credentialResponse.credential) tới backend
            const res = await API.post('http://localhost:5000/api/auth/google-login', {
                token: credentialResponse.credential, // Đây là ID Token mà backend sẽ xác minh
            });

            console.log("Google login success response:", res.data); // Log để kiểm tra dữ liệu trả về từ backend

            // Backend của bạn **phải** trả về một object có chứa `avatarUrl`
            // Cấu trúc mong muốn từ backend: { user: { id, email, fullName, role, avatarUrl }, token: '...' }
            // Hoặc: { id, email, fullName, role, avatarUrl, token }

            // Kiểm tra cấu trúc dữ liệu trả về và truyền cho hàm login
            if (res.data.user) {
                // Nếu backend trả về { user: { ... }, token: '...' }
                login(res.data); // Truyền toàn bộ res.data, AuthContext sẽ lưu user và token
            } else {
                // Nếu backend trả về trực tiếp user object (có avatarUrl) và token
                login(res.data); // Giả định res.data đã có đủ các trường cần thiết, bao gồm avatarUrl và token
            }

            // Điều hướng dựa trên vai trò của người dùng
            // Đảm bảo truy cập đúng thuộc tính role, kiểm tra cả res.data.user.role và res.data.role
            if (res.data.user && res.data.user.role === 'admin') {
                navigate('/admin');
            } else if (res.data.role === 'admin') {
                navigate('/admin');
            }
            else {
                navigate('/');
            }

        } catch (err) {
            console.error('Lỗi khi đăng nhập Google:', err.response ? err.response.data : err.message); // Log lỗi chi tiết hơn
            alert(err.response?.data?.message || 'Đăng nhập Google thất bại'); // Hiển thị thông báo lỗi từ backend hoặc thông báo chung
        }
    };


    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 5,
                bgcolor: theme.palette.background.paper, // Sử dụng màu nền Paper từ theme
                p: 4,
                borderRadius: 2,
                boxShadow: theme.shadows[3], // Sử dụng shadow mặc định của theme
                color: theme.palette.text.primary, // Đảm bảo màu chữ chính khớp với theme
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
            }}
        >
            <Typography variant="h4" align="center" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
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
                    InputLabelProps={{
                        style: { color: theme.palette.text.secondary }
                    }}
                    InputProps={{
                        style: { color: theme.palette.text.primary },
                        sx: {
                            '& fieldset': { borderColor: theme.palette.divider },
                            '&:hover fieldset': { borderColor: theme.palette.primary.light },
                            '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                        }
                    }}
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
                    InputLabelProps={{
                        style: { color: theme.palette.text.secondary }
                    }}
                    InputProps={{
                        style: { color: theme.palette.text.primary },
                        sx: {
                            '& fieldset': { borderColor: theme.palette.divider },
                            '&:hover fieldset': { borderColor: theme.palette.primary.light },
                            '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                        }
                    }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Link to="/forgot-password" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
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
                        backgroundColor: theme.palette.primary.main, // Sử dụng màu primary từ theme
                        '&:hover': { backgroundColor: theme.palette.primary.dark }, // Sử dụng màu dark của primary
                        color: theme.palette.primary.contrastText, // Màu chữ tương phản với primary
                    }}
                >
                    Đăng nhập
                </Button>
            </form>

            <Divider sx={{ my: 3, borderColor: theme.palette.divider }}>hoặc</Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                        console.error('Google login failed from component.');
                        alert('Lỗi khi đăng nhập Google');
                    }}
                    useOneTap
                    theme={theme.palette.mode === 'dark' ? 'filled_blue' : 'outline'}
                    shape="rectangular"
                />
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Chưa có tài khoản?
                    <Link to="/register" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: '500' }}>
                        Đăng ký
                    </Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;