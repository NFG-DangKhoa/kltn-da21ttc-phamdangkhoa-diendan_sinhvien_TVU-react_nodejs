import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    useTheme,
    Paper,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Register = () => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await API.post('http://localhost:5000/api/auth/register', form);
            setSuccess(response.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');

            // Clear form
            setForm({ fullName: '', email: '', password: '' });

            // Don't auto-redirect - user needs to verify email first
            // Show message to check email
        } catch (err) {
            console.error('Đăng ký thất bại:', err);
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 10, // Điều chỉnh để phù hợp với header mới
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 64px)', // Đảm bảo chiếm đủ chiều cao màn hình (trừ AppBar)
                padding: theme.spacing(2), // Thêm padding tổng thể
            }}
        >
            <Paper
                elevation={3} // Thêm độ đổ bóng
                sx={{
                    p: 4,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper, // Sử dụng màu nền Paper từ theme
                    color: theme.palette.text.primary, // Sử dụng màu chữ chính từ theme
                    boxShadow: theme.shadows[3], // Sử dụng shadow mặc định của theme
                    transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                    width: '100%', // Đảm bảo Paper chiếm toàn bộ chiều rộng Container
                    maxWidth: 450, // Giới hạn chiều rộng tối đa của form
                }}
            >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.success.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: theme.shadows[4]
                        }}
                    >
                        <PersonAddIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 1
                        }}
                    >
                        Đăng ký
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6
                        }}
                    >
                        Tạo tài khoản mới để tham gia cộng đồng TVU
                    </Typography>
                </Box>

                {/* Success/Error Messages */}
                {success && (
                    <Alert
                        severity="success"
                        sx={{ mb: 3, borderRadius: 2 }}
                    >
                        {success}
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                            📧 Vui lòng kiểm tra email và click vào link xác thực để kích hoạt tài khoản!
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Sau khi xác thực email, bạn có thể đăng nhập.
                        </Typography>
                    </Alert>
                )}
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
                        label="Họ tên"
                        fullWidth
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        variant="outlined"
                        required
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                },
                            },
                        }}
                    />
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        variant="outlined"
                        required
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                },
                            },
                        }}
                    />
                    <TextField
                        label="Mật khẩu"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        variant="outlined"
                        required
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                },
                            },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            backgroundColor: theme.palette.success.main,
                            '&:hover': {
                                backgroundColor: theme.palette.success.dark,
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[8]
                            },
                            '&:disabled': {
                                backgroundColor: theme.palette.action.disabledBackground
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Đăng ký tài khoản'
                        )}
                    </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Đã có tài khoản?{' '}
                        <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: '500' }}>
                            Đăng nhập ngay
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;