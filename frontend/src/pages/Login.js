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
import API from '../services/api';
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
            // Gọi login một lần duy nhất với dữ liệu nhận được từ API
            login(res.data);
            if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Đăng nhập thất bại:', err); // Log lỗi chi tiết hơn
            alert('Sai email hoặc mật khẩu');
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            const res = await API.post('http://localhost:5000/api/auth/google-login', {
                token: credentialResponse.credential,
            });
            console.log("Google login success response:", res.data); // Log để kiểm tra dữ liệu trả về

            // Dữ liệu người dùng đã được cấu trúc trong res.data.user từ backend (theo như comment của bạn)
            // AuthContext.js nên được thiết kế để nhận trực tiếp res.data hoặc res.data.user
            // Nếu AuthContext.js mong đợi cấu trúc cụ thể, bạn có thể truyền nó vào
            login(res.data); // Truyền toàn bộ res.data hoặc res.data.user tùy thuộc vào AuthContext

            if (res.data.user.role === 'admin') { // Đảm bảo truy cập đúng thuộc tính role
                navigate('/admin');
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error('Lỗi khi đăng nhập Google:', err); // Log lỗi chi tiết hơn
            alert('Đăng nhập Google thất bại');
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
                    // Áp dụng màu sắc từ theme cho TextField
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
                    // Áp dụng màu sắc từ theme cho TextField
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

            <Divider sx={{ my: 3, borderColor: theme.palette.divider }}>hoặc</Divider> {/* Sử dụng màu divider từ theme */}

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                        console.error('Google login failed from component.'); // Log lỗi chi tiết hơn
                        alert('Lỗi khi đăng nhập Google');
                    }}
                    useOneTap
                    theme={theme.palette.mode === 'dark' ? 'filled_blue' : 'outline'} // Điều chỉnh theme Google Login theo mode
                    shape="rectangular" // Có thể dùng 'rectangular' cho phù hợp hơn với button thông thường
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