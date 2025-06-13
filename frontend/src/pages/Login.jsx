import React, { useState, useContext } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Divider,
    useTheme,
    Paper,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await API.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data);

            // Điều hướng dựa trên vai trò của người dùng
            if (res.data.user && res.data.user.role === 'admin') {
                navigate('/admin');
            } else if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Đăng nhập thất bại:', err.response ? err.response.data : err.message);
            const errorData = err.response?.data;

            if (errorData?.requiresVerification) {
                setError(`${errorData.message} 📧 Vui lòng kiểm tra email: ${errorData.email}`);
            } else {
                setError(errorData?.message || 'Sai email hoặc mật khẩu');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            console.log("Google login credential received:", credentialResponse);

            // Use AuthContext googleLogin function
            const result = await googleLogin(credentialResponse.credential);

            if (result.success) {
                console.log("Google login success:", result.user);

                // Navigate based on user role
                if (result.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                console.error('Google login failed:', result.error);
                alert(result.error || 'Đăng nhập Google thất bại');
            }

        } catch (err) {
            console.error('Lỗi khi đăng nhập Google:', err);
            alert('Đăng nhập Google thất bại');
        }
    };


    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '80vh'
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[8],
                    transition: 'all 0.3s ease',
                    width: '100%',
                    maxWidth: 450
                }}
            >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: theme.shadows[4]
                        }}
                    >
                        <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 1
                        }}
                    >
                        Đăng nhập
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6
                        }}
                    >
                        Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn
                    </Typography>
                </Box>

                {/* Error Message */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3, borderRadius: 2 }}
                    >
                        {error}
                    </Alert>
                )}

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
                        Chưa có tài khoản?{' '}
                        <Link to="/register" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: '500' }}>
                            Đăng ký
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;