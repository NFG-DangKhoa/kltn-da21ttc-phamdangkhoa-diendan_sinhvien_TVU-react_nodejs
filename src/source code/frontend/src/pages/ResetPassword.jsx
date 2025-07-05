import React, { useState, useEffect } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    Alert,
    CircularProgress,
    useTheme,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const theme = useTheme();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Token đặt lại mật khẩu không hợp lệ');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Validation
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        try {
            const response = await API.post('/auth/reset-password', {
                token,
                password
            });
            setMessage(response.data.message);
            setResetSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Alert severity="error">
                    Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn
                </Alert>
                <Button
                    component={Link}
                    to="/forgot-password"
                    variant="contained"
                    sx={{ mt: 2 }}
                >
                    Yêu cầu đặt lại mật khẩu mới
                </Button>
            </Container>
        );
    }

    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 12,
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
                            backgroundColor: theme.palette.success.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: theme.shadows[4]
                        }}
                    >
                        <LockResetIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 1
                        }}
                    >
                        Đặt lại mật khẩu
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6
                        }}
                    >
                        {resetSuccess
                            ? 'Mật khẩu đã được đặt lại thành công!'
                            : 'Nhập mật khẩu mới cho tài khoản của bạn'
                        }
                    </Typography>
                </Box>

                {/* Success/Error Messages */}
                {message && (
                    <Alert
                        severity="success"
                        sx={{ mb: 3, borderRadius: 2 }}
                    >
                        {message}
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Đang chuyển hướng đến trang đăng nhập...
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

                {!resetSuccess && (
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Mật khẩu mới"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            variant="outlined"
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

                        <TextField
                            fullWidth
                            label="Xác nhận mật khẩu"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            variant="outlined"
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
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                                'Đặt lại mật khẩu'
                            )}
                        </Button>
                    </form>
                )}

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Nhớ mật khẩu?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                fontWeight: 600
                            }}
                        >
                            Đăng nhập ngay
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default ResetPassword;
