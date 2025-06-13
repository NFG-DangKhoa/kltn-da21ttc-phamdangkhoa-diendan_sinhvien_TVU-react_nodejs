import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    Alert,
    CircularProgress,
    useTheme
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await API.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
            setEmailSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

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
                    maxWidth: 450,
                    position: 'relative'
                }}
            >
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/login')}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        color: theme.palette.text.secondary,
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover
                        }
                    }}
                >
                    Quay lại
                </Button>

                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
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
                        <EmailIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 1
                        }}
                    >
                        Quên mật khẩu?
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6
                        }}
                    >
                        {emailSent
                            ? 'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn'
                            : 'Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu'
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

                {!emailSent ? (
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
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
                                'Gửi email đặt lại mật khẩu'
                            )}
                        </Button>
                    </form>
                ) : (
                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => {
                                setEmailSent(false);
                                setMessage('');
                                setError('');
                                setEmail('');
                            }}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white',
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.shadows[4]
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Gửi lại email
                        </Button>
                    </Box>
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

export default ForgotPassword;
